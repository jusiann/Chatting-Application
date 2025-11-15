import { create } from "zustand";
import { io } from "socket.io-client";

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  connectionError: null,

  // Socket bağlantısını başlat
  connect: (serverUrl = "http://localhost:5001") => {    //http://localhost:5001  http://13.60.211.144
    const { socket } = get();

    if (socket && socket.connected) {
      console.log("Socket zaten bağlı");
      return socket;
    }

    const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al

    if (!token) {
      console.error("Authentication token bulunamadı");
      set({ connectionError: "Authentication token bulunamadı" });
      return null;
    }

    const newSocket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
      auth: {
        token: token,
      },
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });

    // Event listeners
    newSocket.on("connect", () => {
      console.log("Socket bağlandı:", newSocket.id);
      set({ isConnected: true, connectionError: null });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket bağlantısı kesildi");
      set({ isConnected: false });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket bağlantı hatası:", error);
      set({ isConnected: false, connectionError: error.message });
    });

    set({ socket: newSocket });
    return newSocket;
  },

  // Socket bağlantısını kes
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, connectionError: null });
    }
  },

  // Event emit etme
  emit: (event, data) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.error("Socket bağlı değil");
    }
  },

  // Event dinleme
  on: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.on(event, callback);
    }
  },

  // Event dinlemeyi durdurma
  off: (event, callback) => {
    const { socket } = get();
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  },

  // Kullanıcı join işlemi
  joinUser: (userId) => {
    get().emit("join", { userId });
  },

  // Mesaj gönderme
  sendSocketMessage: (messageData) => {
    get().emit("send_message", messageData);
  },

  sendGroupMessage: (groupId, content) => {
    get().emit("group_message", { groupId, content });
  },

  // Typing durumunu gönderme
  sendTyping: (data) => {
    get().emit("typing", data);
  },

  // Stop typing durumunu gönderme
  sendStopTyping: (data) => {
    get().emit("stop_typing", data);
  },

  // Socket durumunu kontrol et
  getConnectionStatus: () => {
    return get().isConnected;
  },

  // Socket instance'ını al
  getSocket: () => {
    return get().socket;
  },
}));

export default useSocketStore;
