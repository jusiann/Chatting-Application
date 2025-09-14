import toast from "react-hot-toast";
import { create } from "zustand";
import { createGroup, getGroupMessages, getGroups } from "../api/group";

const useGroupStore = create((set, get) => ({
    groups: [],
    addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
    removeGroup: (groupId) => set((state) => ({ groups: state.groups.filter((g) => g.id !== groupId) })),
    groupCreate: async (formData) => {
        try {
            const res = await createGroup(formData);
            set((state) => ({ groups: [...state.groups, res] }));
            toast.success("Grup oluşturuldu!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Grup oluşturulamadı.");
            return false;
        }
    },
    fetchGroups: async () => {
        try {
            const res = await getGroups();
            set({ groups: res.data });
        } catch (error) {
            toast.error("Gruplar yüklenemedi.");
        }
    },
    groupMessages: [],
    fetchGroupMessages: async (groupId) => {
        try {
            const res = await getGroupMessages(groupId);
            set({ groupMessages: res });
        } catch (error) {
            toast.error("Grup mesajları yüklenemedi.");
        }
    },

    updateGroupLastMessage: async (groupId, message) => {
        console.log("updateGroupLastMessage çağrıldı:", groupId, message);
        const currentGroups = get().groups;
        const updatedGroup = currentGroups.find((group) => group.id === groupId );
        if (!updatedGroup) {
            await get().fetchGroups();
            return;
        }
        updatedGroup.last_message = message.content;
        updatedGroup.last_message_time = message.created_at;
        const filteredGroups = currentGroups.filter((group) => group.id !== groupId );
        set({ groups: [...filteredGroups, updatedGroup] });
    },
}));

export default useGroupStore;