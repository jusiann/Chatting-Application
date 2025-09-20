import React, { useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import Personcard from "../components/Personcard";
import GroupSelectedCard from "../components/groupSelectedCard";
import useGroupStore from "../store/group";
import Messagetopbar from "../components/Messagetopbar";
import Messagereceived from "../components/Messagereceived";
import Messagesended from "../components/Messagesended";
import Sendbox from "../components/Sendbox";
import useConservationStore from "../store/conservation";
import useUserStore from "../store/user";
import "../style/anaekranpage.css";
import useSocketStore from "../store/socket";
import GroupCard from "../components/groupCard";
import GroupMessageReceived from "../components/groupMessageReceived";

const AnaekranPage = () => {
  const {
    chatUsers,
    chatUsersFetch,
    messages,
    messagingUserId,
    initializeSocket,
    addNewMessage,
    messagingUser,
    handleDelivered,
    handleRead,
    updateChatUsers,
    messagingType,
    unreadIncrement,
    contactUsersFetch,
  } = useConservationStore();

  const { groups, fetchGroups, updateGroupLastMessage, unreadGroupIncrement } =
    useGroupStore();

  const { user } = useUserStore();

  const { on, off, emit } = useSocketStore();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    chatUsersFetch();
    fetchGroups();
    initializeSocket();
    contactUsersFetch();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messagingUserId) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messagingUserId]);

  useEffect(() => {
    on("new_message", (message) => {
      if (
        message.sender_id === messagingUser?.id &&
        messagingType === "individual"
      ) {
        addNewMessage(message);
        emit("mark_read", {
          receiver_id: user.id,
          sender_id: messagingUser.id,
        });
      } else {
        emit("mark_delivered", {
          receiver_id: user.id,
          sender_id: message.sender_id,
        });
        unreadIncrement(message.sender_id);
      }
      updateChatUsers(message.sender_id, message);
      //chatUsersFetch();
    });

    on("message_sent", (message) => {
      updateChatUsers(message.receiver_id, message);
    });

    on("group_message", (message) => {
      if (message.group_id === messagingUser?.id && messagingType === "group") {
        addNewMessage(message);
        emit("group_read", { groupId: messagingUser.id });
      } else {
        unreadGroupIncrement(message.group_id);
      }
      updateGroupLastMessage(message.group_id, message);
    });

    on("message_delivered", (data) => {
      const receiver_id = data.receiver_id;
      handleDelivered(receiver_id);
      //chatUsersFetch();
    });

    on("messages_read", (data) => {
      const receiverId = data.receiver_id;
      handleRead(receiverId);
      //chatUsersFetch();
    });

    on("new_group", async (id) => {
      emit("join_group", id);
      await fetchGroups();
    });

    return () => {
      off("new_message");
      off("message_delivered");
      off("message_read");
      off("group_message");
      off("message_sent");
      off("new_group");
    };
  }, [on, addNewMessage, messagingUser?.id, off]);

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
    </div>
  );
};

export default AnaekranPage;
