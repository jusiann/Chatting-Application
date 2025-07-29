import { create } from "zustand";
import axios from "../api/axios.js";

const useConservationStore = create((set) => ({
    chatUsers: [],
    chatUsersFetch: async () => {
        try {
            const response = await axios.get("/messages/messageUsers");
            set({ chatUsers: response.data });
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
}));

export default useConservationStore;
