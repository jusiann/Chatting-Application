import toast from "react-hot-toast";
import { create } from "zustand";
import { createGroup, getGroupMessages, getGroups } from "../api/Group";
import useSocketStore from "./Socket";
import useUserStore from "./User";

const useGroupStore = create((set, get) => ({
  groups: [],
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  removeGroup: (groupId) =>
    set((state) => ({ groups: state.groups.filter((g) => g.id !== groupId) })),
  groupCreate: async (formData) => {
    try {
      const res = await createGroup(formData);
      const { emit } = useSocketStore.getState();
      emit("join_group", res.id);
      emit("new_group", { memberIds: formData.memberIds, groupId: res.id });
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
      for (const group of res.data) {
        get().setUnreadCount(group.id, parseInt(group.unread_count) || 0);
      }
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
    const updatedGroup = currentGroups.find((group) => group.id === groupId);
    if (updatedGroup == null || updatedGroup === undefined) {
      await get().fetchGroups();
      return;
    }
    const messageContent = (value) => {
      try {
        const userId = useUserStore.getState().user.id;
        const isSendedFileMessage = value.file_key && value.sender_id == userId;
        if (isSendedFileMessage) return "Dosya gönderildi";
        const isReceivedFileMessage =
          value.file_key && value.sender_id != userId;
        if (isReceivedFileMessage) return "Dosya alındı";
        return value.content || "no Message";
      } catch (err) {
        console.log(err);
      }
    };
    updatedGroup.last_message = messageContent(message);
    updatedGroup.last_message_time = message.created_at;
    const filteredGroups = currentGroups.filter(
      (group) => group.id !== groupId
    );
    set({ groups: [...filteredGroups, updatedGroup] });
  },

  unreadGroups: {},
  setUnreadCount: (groupId, count) => {
    const currentUnread = get().unreadGroups;
    set({ unreadGroups: { ...currentUnread, [groupId]: count } });
  },
  unreadGroupIncrement: (groupId) => {
    const currentUnread = get().unreadGroups;
    const currentCount = currentUnread[groupId] || 0;
    set({ unreadGroups: { ...currentUnread, [groupId]: currentCount + 1 } });
  },
  clearUnread: (groupId) => {
    const currentUnread = get().unreadGroups;
    set({ unreadGroups: { ...currentUnread, [groupId]: 0 } });
  },
}));

export default useGroupStore;
