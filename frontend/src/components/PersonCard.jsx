import "../style/PersonCard.css";
import useConservationStore from "../store/Conservation";
import { useEffect } from "react";
import timeFormatter from "../controllers/TimeController";
import useSocketStore from "../store/Socket";
import useUserStore from "../store/User";
import { Check, CheckCheck } from "lucide-react";

function Personcard({ chatUser }) {
  const fetchMessages = useConservationStore((state) => state.fetchMessages);
  const setMessagingUser = useConservationStore(
    (state) => state.setMessagingUser
  );
  const messagingUser = useConservationStore((state) => state.messagingUser);
  const { unreadCounts, unreadClear, typingUsers } = useConservationStore();

  const { emit } = useSocketStore();
  const { user } = useUserStore();

  const isTyping = typingUsers[chatUser.id] || false;

  const handleClick = async () => {
    await fetchMessages({ id: chatUser.id });
    setMessagingUser({ id: chatUser.id, type: "individual" });
    emit("mark_read", { receiver_id: user.id, sender_id: chatUser.id });
    unreadClear(chatUser.id);
  };
  useEffect(() => {
    console.log("Mesajlaşma başlatıldı:", messagingUser);
  }, [messagingUser]);

  // Truncate preview text to a fixed number of characters
  const PREVIEW_MAX_CHARS = 40; // adjust this value as you like
  const getPreview = (text) => {
    if (!text) return "No message";
    if (text.length <= PREVIEW_MAX_CHARS) return text;
    return text.slice(0, PREVIEW_MAX_CHARS) + "...";
  };

  const getStatusIcon = (status) => {
    if (status === "sent") {
      return <Check className="card-sended-check" />; // single check mark
    } else if (status === "delivered") {
      return <CheckCheck className="card-sended-check" />; // double check mark
    } else if (status === "read") {
      return <CheckCheck className="card-readed-check" />; // double check mark with "read"
    }
  };

  return (
    <button className="personcard-button" onClick={handleClick}>
      <div className="personcard">
        <div className="personcard-image-and-texts">
          {chatUser.profile_pic ? (
            <img
              src={chatUser.profile_pic}
              alt={chatUser.first_name}
              className="personcard-image"
            />
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="gray">
              <circle cx="12" cy="8" r="4" />
              <rect x="4" y="16" width="16" height="6" rx="3" />
            </svg>
          )}

          <div className="personcard-texts">
            <div className="personcard-name">
              {chatUser.title} {chatUser.first_name} {chatUser.last_name}
            </div>
            <div className="personcard-message">
              {isTyping ? (
                <p style={{ color: "green" }}>Yazıyor...</p>
              ) : (
                <>
                  {chatUser.lastMessage.sender === user.id &&
                    getStatusIcon(chatUser.lastMessage?.status)}{" "}
                  {getPreview(chatUser.lastMessage?.content)}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="personcard-right-side">
          <div className="personcard-time">
            {chatUser.lastMessage
              ? timeFormatter(chatUser.lastMessage.created_at)
              : "Unknown time"}
          </div>
          {unreadCounts[chatUser.id] > 0 && (
            <span className="personcard-unread-badge">
              {unreadCounts[chatUser.id]}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default Personcard;
