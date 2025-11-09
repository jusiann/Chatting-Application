import { create } from "zustand";
import axios from "../api/Axios.js";
import useSocketStore from "./Socket.js";
import useGroupStore from "./Group.js";
import useUserStore from "./User.js";

const useConservationStore = create((set, get) => ({
  // Typing state
  typingUsers: {}, // { [userId]: true }
  typingTimeouts: {}, // { [userId]: timeoutId }
  setUserTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [String(userId)]: !!isTyping },
    }));
  },
  clearUserTyping: (userId) => {
    set((state) => {
      const next = { ...state.typingUsers };
      delete next[String(userId)];
      return { typingUsers: next };
    });
  },
  unreadCounts: {},
  unreadFetch: async () => {
    try {
      const response = await axios.get("/messages/unread-count");
      set({ unreadCounts: response.data });
    } catch (error) {
      console.error("unreadFetch hatası:", error);
    }
  },
  unreadIncrement: (userId) => {
    const counts = get().unreadCounts;
    set({ unreadCounts: { ...counts, [userId]: (counts[userId] || 0) + 1 } });
  },

  unreadClear: (userId) => {
    const counts = get().unreadCounts;
    set({ unreadCounts: { ...counts, [userId]: 0 } });
  },

  chatUsers: [],
  chatUsersFetch: async () => {
    try {
      const response = await axios.get("/messages/last-messages");
      set({ chatUsers: response.data.data });
      get().unreadFetch();
      console.log("chatUsersFetch başarılı:", response.data);
    } catch (error) {
      console.error("chatUsersFetch hatası:", error);
      set({ chatUsers: [] });
    }
  },
  updateChatUsers: async (newUserId, message) => {
    const messageContent = (value) => {
      const isFileMessage =
        value.file_key && value.sender_id != useUserStore.getState().user.id;
      if (isFileMessage) return "Dosya alındı";
      const isSendedFileMessage =
        value.file_key && value.sender_id == useUserStore.getState().user.id;
      if (isSendedFileMessage) return "Dosya gönderildi";
      return value.content || "no Message";
    };
    const currentUsers = get().chatUsers;
    const updatedUser = currentUsers.find((user) => user.id === newUserId);
    if (!updatedUser || updatedUser.lastMessage == null) {
      await get().chatUsersFetch();
      return;
    } // Kullanıcı bulunamazsa çıkış yap
    updatedUser.lastMessage.content = messageContent(message); // Yeni mesaj içeriği
    updatedUser.lastMessage.created_at = message.created_at; // Yeni mesaj zamanı
    updatedUser.lastMessage.status = message.status; // Yeni mesaj durumu
    updatedUser.lastMessage.sender = message.sender_id; // Yeni mesaj gönderen
    const filteredUsers = currentUsers.filter((user) => user.id !== newUserId);
    set({ chatUsers: [...filteredUsers, updatedUser] });
  },

  contactUsers: [],
  contactUsersFetch: async () => {
    try {
      const response = await axios.get("/messages/users");
      const normalized = response.data.users || [];
      set({ contactUsers: normalized });
    } catch (error) {
      console.error("contactUsersFetch hatası:", error);
      set({ contactUsers: [] });
    }
  },
  setOnlineStatus: (userId, isOnline) => {
    const users = get().contactUsers || [];
    const targetId = String(userId);
    const idx = users.findIndex((u) => String(u.id) === targetId);
    if (idx === -1) return; // user not found in contacts

    const user = users[idx];
    if (isOnline) {
      user.is_online = true;
      users[idx] = user;
    } else {
      user.is_online = false;
      user.last_seen = new Date().toISOString();
      users[idx] = user;
    }
    set({ contactUsers: users });
  },

  messages: [],
  messagingUserId: null,
  messagingGroupId: null,
  messagingUser: null,
  messagingType: null,
  hasMore: false,
  cursor: null,
  setMessagingUser: ({ id, type }) => {
    set({ messagingType: type });
    if (get().messagingType === "individual") {
      const user = get().contactUsers.find((user) => user.id == id);
      set({ messagingUser: user });
      console.log("Mesajlaşma başlatıldı:", user);
    } else if (get().messagingType === "group") {
      const group = useGroupStore
        .getState()
        .groups.find((group) => group.id == id);
      set({ messagingUser: group });
      console.log("Grup mesajlaşma başlatıldı:", group);
    }
  },

  fetchMessages: async ({ id }) => {
    try {
      const response = await axios.get(`/messages/${id}?isFirst=true`);
      // Backend returns newest -> oldest (ORDER BY id DESC). Reverse to keep array oldest -> newest.
      const ordered = [...(response.data.messages || [])].reverse();
      set({ messages: ordered });
      set({ hasMore: response.data.hasMore || false });
      set({ cursor: response.data.cursor || null });
      console.log("Mesajlar alındı:", response.data);
    } catch (error) {
      console.error("Mesajlar alınamadı:", error);
      set({ messages: [] });
    }
  },

  fetchMoreMessages: async ({ id }) => {
    if (get().messagingType == "individual") {
      try {
        if (get().hasMore == false) return;
        if (!get().cursor) return;
        const cursor = get().cursor;
        const response = await axios.get(
          `/messages/${id}?isFirst=false&cursor=${cursor}`
        );
        // Older chunk (newest->oldest) needs reversing before prepend.
        const moreDescending = response.data.messages || [];
        const moreAscending = [...moreDescending].reverse();
        const existing = get().messages || [];
        // Prepend older messages. This keeps overall order oldest -> newest.
        const combined = [...moreAscending, ...existing];
        // Deduplicate by id (in case overlap)
        const seen = new Set();
        const deduped = [];
        for (const m of combined) {
          if (m && !seen.has(m.id)) {
            seen.add(m.id);
            deduped.push(m);
          }
        }
        set({ messages: deduped });
        set({ hasMore: response.data.hasMore || false });
        set({ cursor: response.data.cursor || null });
        console.log("Daha fazla mesaj alındı:", response.data);
      } catch (error) {
        console.error("Daha fazla mesaj alınamadı:", error);
      }
    } else if (get().messagingType == "group") {
      try {
        if (get().hasMore == false) return;
        if (!get().cursor) return;
        const cursor = get().cursor;
        const response = await axios.get(
          `/groups/${id}/messages?isFirst=false&cursor=${cursor}`
        );
        // Older chunk (newest->oldest) needs reversing before prepend.
        const moreDescending = response.data.messages || [];
        const moreAscending = [...moreDescending].reverse();
        const existing = get().messages || [];
        // Prepend older messages. This keeps overall order oldest -> newest.
        const combined = [...moreAscending, ...existing];
        // Deduplicate by id (in case overlap)
        const seen = new Set();
        const deduped = [];
        for (const m of combined) {
          if (m && !seen.has(m.id)) {
            seen.add(m.id);
            deduped.push(m);
          }
        }
        set({ messages: deduped });
        set({ hasMore: response.data.hasMore || false });
        set({ cursor: response.data.cursor || null });
        console.log("Daha fazla grup mesajı alındı:", response.data);
      } catch (error) {
        console.error("Daha fazla grup mesajı alınamadı:", error);
      }
    }
  },

  fetchGroupMessages: async (groupId) => {
    try {
      const response = await axios.get(
        `/groups/${groupId}/messages?isFirst=true`
      );
      const ordered = [...(response.data.messages || [])].reverse();
      set({ hasMore: response.data.hasMore || false });
      set({ cursor: response.data.cursor || null });
      set({ messages: ordered });
    } catch (error) {
      console.error("Grup mesajları alınamadı:", error);
      set({ messages: [] });
    }
  },

  setMessagingUserId: (id) => set({ messagingUserId: id }),

  // Socket fonksiyonları
  initializeSocket: (serverUrl) => {
    const socketStore = useSocketStore.getState();
    const socket = socketStore.connect(serverUrl);

    // Socket event listener'ları kur
    get().setupSocketListeners();

    return socket;
  },

  sendMessage: async (messageData) => {
    try {
      // Sonra socket ile real-time gönder
      const socketStore = useSocketStore.getState();
      socketStore.sendSocketMessage(messageData);

      // Mesajları güncelle
      /* if (get().messagingUser.id) {
        get().fetchMessages({ id: get().messagingUser.id });
      } */
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
    }
  },

  sendGroupMessage: async (groupId, content) => {
    const socketStore = useSocketStore.getState();
    socketStore.sendGroupMessage(groupId, content);
  },

  // Yeni mesaj geldiğinde çağrılacak
  addNewMessage: (message) => {
    // Keep ordering oldest -> newest. Only append if not already present.
    const currentMessages = get().messages || [];
    if (currentMessages.some((m) => m.id === message.id)) return;
    set({ messages: [...currentMessages, message] });
  },

  handleDelivered: (receiver_id) => {
    const messages = get().messages;
    const updatedMessages = messages.map((msg) => {
      if (msg.receiver_id === receiver_id && msg.status === "sent") {
        return { ...msg, status: "delivered" };
      }
      return msg;
    });
    const updatedChatUser = get().chatUsers.find(
      (user) => user.id === receiver_id
    );
    if (updatedChatUser && updatedChatUser.lastMessage.status === "sent") {
      updatedChatUser.lastMessage.status = "delivered";
    }
    const updatedChatUsers = get().chatUsers.map((user) =>
      user.id === receiver_id ? updatedChatUser : user
    );
    set({ messages: updatedMessages, chatUsers: updatedChatUsers });
  },

  handleRead: (receiver_id) => {
    const messages = get().messages;
    const updatedMessages = messages.map((msg) => {
      if (msg.receiver_id === receiver_id && msg.status !== "read") {
        return { ...msg, status: "read" };
      }
      return msg;
    });
    const updatedChatUser = get().chatUsers.find(
      (user) => user.id === receiver_id
    );
    if (updatedChatUser && updatedChatUser.lastMessage.status !== "read") {
      updatedChatUser.lastMessage.status = "read";
    }
    const updatedChatUsers = get().chatUsers.map((user) =>
      user.id === receiver_id ? updatedChatUser : user
    );
    set({ messages: updatedMessages, chatUsers: updatedChatUsers });
  },

  // Socket event listener'ları kurma
  setupSocketListeners: () => {
    const socketStore = useSocketStore.getState();

    // Yeni mesaj geldiğinde
    socketStore.on("receive_message", (message) => {
      get().addNewMessage(message);
    });

    // Typing durumunu dinle
    socketStore.on("typing", (data) => {
      const fromId =
        data?.fromId ??
        data?.senderId ??
        data?.sender_id ??
        data?.userId ??
        data?.user_id;
      if (!fromId) return;
      const id = String(fromId);
      const timeouts = get().typingTimeouts;
      // işaretle
      get().setUserTyping(id, true);
      // önceki timeout'u temizle ve yeni timeout ile typing'i otomatik kapat
      if (timeouts[id]) clearTimeout(timeouts[id]);
      const to = setTimeout(() => {
        get().setUserTyping(id, false);
      }, 3000);
      set({ typingTimeouts: { ...timeouts, [id]: to } });
    });

    socketStore.on("stop_typing", (data) => {
      const fromId =
        data?.fromId ??
        data?.senderId ??
        data?.sender_id ??
        data?.userId ??
        data?.user_id;
      if (!fromId) return;
      const id = String(fromId);
      const timeouts = get().typingTimeouts;
      if (timeouts[id]) clearTimeout(timeouts[id]);
      get().setUserTyping(id, false);
      const next = { ...timeouts };
      delete next[id];
      set({ typingTimeouts: next });
    });
  },

  // Socket bağlantısında kullanıcıyı join et
  joinSocketRoom: (userId) => {
    const socketStore = useSocketStore.getState();
    socketStore.joinUser(userId);
  },

  // Typing gönder
  sendTyping: (data) => {
    const socketStore = useSocketStore.getState();
    socketStore.emit("typing", data);
  },

  // Stop typing gönder
  sendStopTyping: (data) => {
    const socketStore = useSocketStore.getState();
    socketStore.emit("stop_typing", data);
  },

  // Socket bağlantısını kes
  disconnectSocket: () => {
    const socketStore = useSocketStore.getState();
    socketStore.disconnect();
  },
}));

export default useConservationStore;
