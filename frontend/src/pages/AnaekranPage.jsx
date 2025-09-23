import React, { useEffect, useRef } from "react";
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
  const { chatUsers, messages, messagingUserId, messagingType, messagingUser } =
    useConservationStore();

  const { groups } = useGroupStore();

  const { user } = useUserStore();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messagingUserId) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messagingUserId]);

  const scrollToBottom = () => {
    // Yöntem 1: messagesEndRef kullanarak
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const sortedMessages = messages.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

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

          <div className="anaekran-messages">
            {messagingType === "individual"
              ? sortedMessages.map((message, index) =>
                  message.sender_id === user.id ? (
                    <Messagesended key={index} message={message} />
                  ) : (
                    <Messagereceived key={index} message={message} />
                  )
                )
              : sortedMessages.map((message, index) =>
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
