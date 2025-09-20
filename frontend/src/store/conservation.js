import { create } from "zustand";
import axios from "../api/axios.js";
import useSocketStore from "./socket.js";
import useGroupStore from "./group.js";

const useConservationStore = create((set, get) => ({
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
    const currentUsers = get().chatUsers;
    const updatedUser = currentUsers.find((user) => user.id === newUserId);
    if (!updatedUser || updatedUser.lastMessage == null) {
      await get().chatUsersFetch();
      return;
    } // Kullanıcı bulunamazsa çıkış yap
    updatedUser.lastMessage.content = message.content; // Yeni mesaj içeriği
    updatedUser.lastMessage.created_at = message.created_at; // Yeni mesaj zamanı
    updatedUser.lastMessage.status = message.status; // Yeni mesaj durumu
    const filteredUsers = currentUsers.filter((user) => user.id !== newUserId);
    set({ chatUsers: [...filteredUsers, updatedUser] });
  },

  contactUsers: [],
  contactUsersFetch: async () => {
    try {
      const response = await axios.get("/messages/users");
      set({ contactUsers: response.data.users });
    } catch (error) {
      console.error("contactUsersFetch hatası:", error);
      set({ contactUsers: [] });
    }
  },

  messages: [],
  messagingUserId: null,
  messagingGroupId: null,
  messagingUser: null,
  messagingType: null,
  setMessagingUser: ({ id }) => {
    if (get().messagingType === "individual") {
      const user = get().chatUsers.find((user) => user.id == id);
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
      const response = await axios.get(`/messages/${id}`);
      set({ messages: response.data.messages });
    } catch (error) {
      console.error("Mesajlar alınamadı:", error);
      set({ messages: [] });
    }
  },

  fetchGroupMessages: async (groupId) => {
    try {
      const response = await axios.get(`/groups/${groupId}/messages`);
      set({ messages: response.data });
    } catch (error) {
      console.error("Grup mesajları alınamadı:", error);
      set({ messages: [] });
    }
  },

  setMessagingType: (type) => set({ messagingType: type }),

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
      if (get().messagingUser.id) {
        get().fetchMessages({ id: get().messagingUser.id });
      }
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
    const currentMessages = get().messages;
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
    socketStore.on("user_typing", (data) => {
      console.log("User typing:", data);
      // Typing gösterimi için state ekleyebilirsiniz
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
    socketStore.sendTyping(data);
  },

  // Socket bağlantısını kes
  disconnectSocket: () => {
    const socketStore = useSocketStore.getState();
    socketStore.disconnect();
  },
}));

export default useConservationStore;
