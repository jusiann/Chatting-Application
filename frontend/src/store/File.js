import { create } from "zustand";
import axios from "../api/Axios";
import useSocketStore from "./Socket";
import useConservationStore from "./Conservation";
import useUserStore from "./User";

const useFileStore = create((set, get) => ({
  file: null,
  uploading: false,
  setFile: (file) => set({ file: file }),
  clearFile: () => set({ file: null }),
  uploadFile: async () => {
    if (get().file == null) return null;
    const formData = { fileName: get().file.name, fileType: get().file.type };
    try {
      set({ uploading: true });
      const response = await axios.post("/messages/upload-url", formData);
      const { uploadUrl, fileKey } = response.data;
      await axios.put(uploadUrl, get().file, {
        headers: {
          "Content-Type": get().file.type,
        },
      });
      const messagingType = useConservationStore.getState().messagingType;
      if (messagingType === "individual") {
        useSocketStore.getState().emit("file_message", {
          senderId: useUserStore.getState().user?.id,
          receiverId: useConservationStore.getState().messagingUser?.id,
          fileKey: fileKey,
          fileType: get().file.type,
        });
      } else if (messagingType === "group") {
        useSocketStore.getState().emit("group_file_message", {
          senderId: useUserStore.getState().user?.id,
          groupId: useConservationStore.getState().messagingUser?.id,
          fileKey: fileKey,
          fileType: get().file.type,
        });
      }
      get().clearFile();
      return fileKey;
    } catch (err) {
      console.error("[FILE] Upload error:", err);
    } finally {
      set({ uploading: false });
    }
  },
}));
export default useFileStore;
