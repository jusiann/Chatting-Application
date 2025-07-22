import { create } from "zustand";
import axios from "axios";

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
            set({ contactUsers: response.data });
        } catch (error) {
            console.error("contactUsersFetch hatası:", error);
            set({ contactUsers: [] });
        }
    },
}));

export default useConservationStore;
