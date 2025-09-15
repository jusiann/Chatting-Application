import "../style/personcard.css";
import useConservationStore from "../store/conservation";
import { useEffect } from "react";
import timeFormatter from "../controllers/TimeController";
import useSocketStore from "../store/socket";
import useUserStore from "../store/user";

function Personcard({ chatUser }) {
    const fetchMessages = useConservationStore((state) => state.fetchMessages);
    const setMessagingUser = useConservationStore((state) => state.setMessagingUser);
    const messagingUser = useConservationStore((state) => state.messagingUser);
    const setMessagingType = useConservationStore((state) => state.setMessagingType);

    const {emit} = useSocketStore();
    const {user} = useUserStore();

    const handleClick = () => {
        fetchMessages({ id: chatUser.id });
        setMessagingType("individual");
        setMessagingUser({ id: chatUser.id });
        emit("mark_read", { receiver_id: user.id, sender_id: chatUser.id });
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

    return (
        <button className="personcard-button" onClick={handleClick}>
            <div className="personcard">
                <div className="personcard-image-and-texts">
                    {chatUser.profile_pic ? (
                        <img src={chatUser.profile_pic} alt={chatUser.first_name} className="personcard-image" />
                    ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="gray">
                            <circle cx="12" cy="8" r="4" />
                            <rect x="4" y="16" width="16" height="6" rx="3" />
                        </svg>
                    )}

                    <div className="personcard-texts">
                        <div className="personcard-name">{chatUser.first_name}</div>
                        <div className="personcard-message">{getPreview(chatUser.lastMessage?.content)}</div>
                    </div>
                </div>

                <div className="personcard-time">{chatUser.lastMessage ? timeFormatter(chatUser.lastMessage.created_at) : "Unknown time"}</div>
            </div>
        </button>
    );
}

export default Personcard;
