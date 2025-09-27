import { create } from "zustand";
import axios from "../api/axios";
import useSocketStore from "./socket";
import useConservationStore from "./conservation";
import useUserStore from "./user";

const useFileStore = create((set, get) => ({
  file: null,
  setFile: (file) => set({ file: file }),
  clearFile: () => set({ file: null }),
  uploadFile: async () => {
    if (get().file == null) return null;
    const formData = { fileName: get().file.name, fileType: get().file.type };
    try {
      const response = await axios.post("/messages/upload-url", formData);
      const { uploadUrl, fileKey } = response.data;
      await axios.put(uploadUrl, get().file, {
        headers: {
          "Content-Type": get().file.type,
        },
      });
      useSocketStore.getState().emit("file_message", {
        senderId: useUserStore.getState().user?.id,
        receiverId: useConservationStore.getState().messagingUser?.id,
        fileKey: fileKey,
        fileType: get().file.type,
      });
      get().clearFile();
      return fileKey;
    } catch (err) {
      console.error("[FILE] Upload error:", err);
    }
  },
}));
export default useFileStore;
