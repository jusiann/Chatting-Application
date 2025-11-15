import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import SideBar from "../components/SideBar";
import SearchBar from "../components/SearchBar";
import PersonCard from "../components/PersonCard";
import useGroupStore from "../store/Group";
import MessageTopBar from "../components/MessageTopBar";
import MessageReceived from "../components/MessageReceived";
import MessageSent from "../components/MessageSent";
import SendBox from "../components/SendBox";
import useConservationStore from "../store/Conservation";
import useUserStore from "../store/User";
import "../style/MainScreenPage.css";
import GroupCard from "../components/GroupCard";
import GroupMessageReceived from "../components/GroupMessageReceived";
import useFileStore from "../store/File";
import { File } from "lucide-react";
import GroupApprovalButton from "../components/GroupApprovalButton";
import GroupCancelButton from "../components/GroupCancelButton";

const HomePage = () => {
  const {
    chatUsers,
    messages,
    messagingType,
    messagingUser,
    fetchMoreMessages,
  } = useConservationStore();

  const { file, clearFile, uploadFile } = useFileStore();

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
      if (initialLoad) return;
      const distanceToBottom =
        div.scrollHeight - div.scrollTop - div.clientHeight;
      isNearBottomRef.current = distanceToBottom < 100;

      if (isFetchingRef.current) return;
      if (div.scrollTop > 5) return;
      if (messagingType !== "individual") return;

      const rawId = useConservationStore.getState().messagingUser?.id;
      const id = Number(rawId);
      if (!id) return;

      isPrependingRef.current = true;
      prevScrollHeightRef.current = div.scrollHeight;
      isFetchingRef.current = true;
      try {
        await fetchMoreMessages({ id });
      } finally {
        isFetchingRef.current = false;
      }
    };
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [initialLoad, messagingType, messagingUser, fetchMoreMessages]);

  useEffect(() => {
    if (messagingUser) {
      setInitialLoad(true);
    }
  }, [messagingUser]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  };

  const handleUpload = () => {
    if (!file) return;
    uploadFile();
    clearFile();
  };

  useLayoutEffect(() => {
    if (!messagingUser) return;
    if (!initialLoad) return;
    if (!messages || messages.length === 0) return;
    const id = requestAnimationFrame(() => {
      scrollToBottom();
      setInitialLoad(false);
    });
    return () => cancelAnimationFrame(id);
  }, [messages, messagingUser, initialLoad]);

  useLayoutEffect(() => {
    const div = messagesContainerRef.current;
    if (!div) return;
    if (isPrependingRef.current) {
      const oldHeight = prevScrollHeightRef.current;
      const newHeight = div.scrollHeight;
      const heightDiff = newHeight - oldHeight;
      div.scrollTop = div.scrollTop + heightDiff;
      isPrependingRef.current = false;
      return;
    }
    if (isNearBottomRef.current) {
      scrollToBottom();
    }
  }, [messages]);

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
      lastMessage: g.last_message || g.lastMessage || null,
      created_at: g.last_message_time || g.created_at,
      original: g,
    }))
    : [];

  const conversationList = [...userConversations, ...groupConversations]
    .filter(
      (c) => (c.lastMessage != null && c.type === "user") || c.type === "group"
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="anaekran-container">
      <SideBar />

      <div className="anaekran-content">
        <SearchBar />

        <div className="anaekran-person-list">
          {conversationList.map((c) =>
            c.type === "user" ? (
              <PersonCard key={c.id} chatUser={c.original} />
            ) : (
              <GroupCard key={c.id} groupRoom={c.original} />
            )
          )}
        </div>
      </div>

      {messagingUser == null ? (
        <div className="anaekran-right-panel">Sohbet</div>
      ) : (
        <div className="anaekran-chat-panel">
          <div className="messagetopbar-container-home">
            <MessageTopBar />
          </div>

          {file != null ? (
            <div className="file-info-container">
              <div className="file-info-box">
                <File size={100} />
                <h3>{file.name}</h3>
                <p>{file.type}</p>
                <p>{(file.size / 1024).toFixed(2)} KB</p>
                <div className="file-info-buttons">
                  <GroupCancelButton onClick={clearFile} />
                  <GroupApprovalButton text="Gönder" onClick={uploadFile} />
                </div>
              </div>
            </div>
          ) : (
            <div className="anaekran-messages" ref={messagesContainerRef}>
              {messagingType === "individual"
                ? messages.map((message, index) =>
                  message.sender_id === user.id ? (
                    <MessageSent key={index} message={message} /> // Düzeltme yapıldı
                  ) : (
                    <MessageReceived key={index} message={message} /> // Düzeltme yapıldı
                  )
                )
                : messages.map((message, index) =>
                  message.sender_id === user.id ? (
                    <MessageSent key={index} message={message} /> // Düzeltme yapıldı
                  ) : (
                    <GroupMessageReceived key={index} message={message} />
                  )
                )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {file != null ? <div /> : <SendBox />}
        </div>
      )}
    </div>
  );
};

export default HomePage;