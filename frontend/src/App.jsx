import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RehberPage from "./pages/RehberPage";
import GrupPage from "./pages/GrupPage";
import AnaekranPage from "./pages/AnaekranPage";
import LoginPage from "./pages/LoginPage";
import DepartmanPage from "./pages/DepartmanPage";
import SettingsPage from "./pages/SettingsPage";
import KayıtOl from "./pages/KayıtOl";
import useUserStore from "./store/user.js";
import { useEffect, useRef } from "react";
import useConservationStore from "./store/conservation.js";
import useGroupStore from "./store/group.js";
import useSocketStore from "./store/socket.js";

function App() {
  const { checkAuth, user } = useUserStore();
  const {
    addNewMessage,
    handleDelivered,
    handleRead,
    updateChatUsers,
    unreadIncrement,
    contactUsersFetch,
    chatUsersFetch,
    initializeSocket,
    setOnlineStatus,
  } = useConservationStore();
  const { socket, on, off, emit } = useSocketStore();
  const { fetchGroups, updateGroupLastMessage, unreadGroupIncrement } =
    useGroupStore();

  // Check auth only once on app mount to avoid loops
  useEffect(() => {
    checkAuth().catch(() => {});
  }, []);

  // Run initial data loads and socket init once per login
  const didInitForUser = useRef(false);
  useEffect(() => {
    if (!user) return;
    if (didInitForUser.current) return;
    didInitForUser.current = true;

    (async () => {
      await contactUsersFetch();
      await chatUsersFetch();
      await fetchGroups();
      await initializeSocket();
    })();
  }, [user?.id]);

  useEffect(() => {
    if (user != null && socket) {
      on("new_message", (message) => {
        const { messagingUser, messagingType } =
          useConservationStore.getState();
        if (
          message.sender_id == messagingUser?.id &&
          messagingType === "individual"
        ) {
          addNewMessage(message);
          emit("mark_read", {
            receiver_id: user.id,
            sender_id: messagingUser.id,
          });
        } else {
          emit("mark_delivered", {
            receiver_id: user.id,
            sender_id: message.sender_id,
          });
          unreadIncrement(message.sender_id);
        }
        updateChatUsers(message.sender_id, message);
        //chatUsersFetch();
      });

      on("message_sent", (message) => {
        updateChatUsers(message.receiver_id, message);
        addNewMessage(message);
      });

      on("group_message", (message) => {
        const { messagingUser, messagingType } =
          useConservationStore.getState();
        if (
          message.group_id === messagingUser?.id &&
          messagingType === "group"
        ) {
          addNewMessage(message);
          emit("group_read", { groupId: messagingUser.id });
        } else {
          unreadGroupIncrement(message.group_id);
        }
        updateGroupLastMessage(message.group_id, message);
      });

      on("message_delivered", (data) => {
        const receiver_id = data.receiver_id;
        handleDelivered(receiver_id);
      });

      on("messages_read", (data) => {
        const receiverId = data.receiver_id;
        handleRead(receiverId);
      });

      on("new_group", async (id) => {
        emit("join_group", id);
        await fetchGroups();
      });

      on("online", (data) => {
        console.log("[socket] online event:", data);
        const userId = data.id ?? data.userId ?? data.user_id ?? data.user?.id;
        setOnlineStatus(userId, true);
      });

      on("offline", (data) => {
        console.log("[socket] offline event:", data);
        const userId = data.id ?? data.userId ?? data.user_id ?? data.user?.id;
        setOnlineStatus(userId, false);
      });

      return () => {
        off("new_message");
        off("message_delivered");
        off("messages_read");
        off("group_message");
        off("message_sent");
        off("new_group");
        off("offline");
        off("online");
      };
    }
  }, [user?.id, socket]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={user ? <AnaekranPage /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to='/home' replace />} />
        <Route path="/register" element={!user ? <KayıtOl /> : <Navigate to='/home' replace />} />
        <Route path="/rehber" element={user ? <RehberPage /> : <Navigate to='/login' replace />} />
        <Route path="/grup" element={user ? <GrupPage /> : <Navigate to='/login' replace />} />
        <Route path="/departman" element={user ? <DepartmanPage /> : <Navigate to='/login' replace />} />
        <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to='/login' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
