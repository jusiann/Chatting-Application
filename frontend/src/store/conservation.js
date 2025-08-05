import { create } from "zustand";
import axios from "../api/axios.js";
import useSocketStore from "./socket.js";

const useConservationStore = create((set, get) => ({
    chatUsers: [],
    chatUsersFetch: async () => {
        try {
            const response = await axios.get("/messages/last-messages");
            set({ chatUsers: response.data.data });
            console.log("chatUsersFetch başarılı:", response.data);
        } catch (error) {
            console.error("chatUsersFetch hatası:", error);
            set({ chatUsers: [] });
        }
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
    messagingUser: null,
    setMessagingUser: ({id}) => {
        const user = get().chatUsers.find((user) => user.id == id);
        set({ messagingUser: user });
        console.log("Mesajlaşma başlatıldı:", user);
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

    // Yeni mesaj geldiğinde çağrılacak
    addNewMessage: (message) => {
        const currentMessages = get().messages;
        set({ messages: [...currentMessages, message] });
    },

    handleDelivered: (messageId) => {
        const messages = get().messages;
        const message = messages.find(msg => msg.id === messageId);
        if (message) {
            message.status = "delivered";
            set({ messages: [...messages] });
        }
    },

    // Socket event listener'ları kurma
    setupSocketListeners: () => {
        const socketStore = useSocketStore.getState();
        
        // Yeni mesaj geldiğinde
        socketStore.on('receive_message', (message) => {
            get().addNewMessage(message);
        });

        // Typing durumunu dinle
        socketStore.on('user_typing', (data) => {
            console.log('User typing:', data);
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
    }
}));

export default useConservationStore;
