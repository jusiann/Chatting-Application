import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import Personcard from "../components/Personcard";
import useGroupStore from "../store/group";
import Messagetopbar from "../components/Messagetopbar";
import Messagereceived from "../components/Messagereceived";
import Messagesended from "../components/Messagesended";
import Sendbox from "../components/Sendbox";
import useConservationStore from "../store/conservation";
import useUserStore from "../store/user";
import "../style/anaekranpage.css";
import GroupCard from "../components/groupCard";
import GroupMessageReceived from "../components/groupMessageReceived";

const AnaekranPage = () => {
  const {
    chatUsers,
    messages,
    messagingType,
    messagingUser,
    fetchMoreMessages,
  } = useConservationStore();

  const { groups } = useGroupStore();

  const { user } = useUserStore();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const isPrependingRef = useRef(true);
  const isNearBottomRef = useRef(true);
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    const div = messagesContainerRef.current;
    if (!div) return;
    const distanceToBottom =
      div.scrollHeight - div.scrollTop - div.clientHeight;
    if (distanceToBottom < 800) scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const div = messagesContainerRef.current;
    if (!div) return;
    const handleScroll = async () => {
      // Only trigger when very top reached (<= 5px) and not during initial bottom scroll
      if (initialLoad) return;
      // Track near-bottom state for auto-scroll on new incoming messages
      const distanceToBottom =
        div.scrollHeight - div.scrollTop - div.clientHeight;
      isNearBottomRef.current = distanceToBottom < 100;

      if (isFetchingRef.current) return;
      if (div.scrollTop > 5) return;
      if (messagingType !== "individual") return; // group pagination not yet implemented

      const rawId = useConservationStore.getState().messagingUser?.id;
      const id = Number(rawId);
      if (!id) return;

      // Prepare for prepend scroll restore
      isPrependingRef.current = true;
      prevScrollHeightRef.current = div.scrollHeight;
      isFetchingRef.current = true;
      try {
        await fetchMoreMessages({ id });
      } finally {
        // scroll restore happens in useLayoutEffect after messages update
        isFetchingRef.current = false;
      }
    };
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [initialLoad, messagingType, messagingUser, fetchMoreMessages]);

  useEffect(() => {
    // Yeni bir sohbete geçildiğinde, mesajlar yüklendikten sonra en alta kaydırmayı hedefle
    if (messagingUser) {
      setInitialLoad(true);
    }
  }, [messagingUser]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    // Önce doğrudan scrollTop ile en alta in
    container.scrollTop = container.scrollHeight;
    // Ek olarak anchor'a scrollIntoView ile güvence altına al
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  };

  // İlk yüklemede (yeni sohbet seçildiğinde ve mesajlar geldiğinde) en alta kaydır
  useLayoutEffect(() => {
    if (!messagingUser) return;
    if (!initialLoad) return;
    if (!messages || messages.length === 0) return;
    // Bir frame sonra çalıştır ki DOM ölçümleri doğru olsun
    const id = requestAnimationFrame(() => {
      scrollToBottom();
      setInitialLoad(false);
    });
    return () => cancelAnimationFrame(id);
  }, [messages, messagingUser, initialLoad]);

  useLayoutEffect(() => {
    const div = messagesContainerRef.current;
    if (!div) return;
    // When older messages are prepended, adjust scroll so the first previously visible message stays in place
    if (isPrependingRef.current) {
      const oldHeight = prevScrollHeightRef.current;
      const newHeight = div.scrollHeight;
      const heightDiff = newHeight - oldHeight;
      div.scrollTop = div.scrollTop + heightDiff;
      isPrependingRef.current = false;
      return;
    }
    // For new incoming messages appended at the bottom, auto-scroll only if user is already near bottom
    if (isNearBottomRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  /* const sortedMessages = messages.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  ); */

  // Normalize users and groups into a single conversation list with a common shape
  const userConversations = Array.isArray(chatUsers)
    ? chatUsers.map((u) => ({
        type: "user",
        id: `user-${u.id}`,
        rawId: u.id,
        displayName: u.first_name,
        profile_pic: u.profile_pic,
        lastMessage: u.lastMessage || null,
        created_at: u.lastMessage != null ? u.lastMessage.created_at : null,
        original: u,
      }))
    : [];

  const groupConversations = Array.isArray(groups)
    ? groups.map((g) => ({
        type: "group",
        id: `group-${g.id}`,
        rawId: g.id,
        displayName: g.name || g.first_name || "Grup",
        profile_pic: g.profile_pic || null,
        // assume groups may have last_message or lastMessage
        lastMessage: g.last_message || g.lastMessage || null,
        created_at: g.last_message_time || g.created_at,
        original: g,
      }))
    : [];

  const conversationList = [...userConversations, ...groupConversations]
    .filter(
      (c) => (c.lastMessage != null && c.type === "user") || c.type === "group"
    ) // only those with messages
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="anaekran-container">
      <Sidebar />

      <div className="anaekran-content">
        <Searchbar />

        <div className="anaekran-person-list">
          {conversationList.map((c) =>
            c.type === "user" ? (
              <Personcard key={c.id} chatUser={c.original} />
            ) : (
              <GroupCard key={c.id} groupRoom={c.original} /> //Değişecek
            )
          )}
        </div>
      </div>
      {messagingUser == null ? (
        <div className="anaekran-right-panel">Sohbet</div>
      ) : (
        <div className="anaekran-chat-panel">
          <div className="messagetopbar-container-home">
            <Messagetopbar />
          </div>

          <div className="anaekran-messages" ref={messagesContainerRef}>
            {messagingType === "individual"
              ? messages.map((message, index) =>
                  message.sender_id === user.id ? (
                    <Messagesended key={index} message={message} />
                  ) : (
                    <Messagereceived key={index} message={message} />
                  )
                )
              : messages.map((message, index) =>
                  message.sender_id === user.id ? (
                    <Messagesended key={index} message={message} />
                  ) : (
                    <GroupMessageReceived key={index} message={message} />
                  )
                )}
            <div ref={messagesEndRef} />
          </div>

          <Sendbox />
        </div>
      )}
    </div>
  );
};

export default AnaekranPage;
