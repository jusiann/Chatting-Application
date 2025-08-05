import "../style/personcard.css";
import useConservationStore from "../store/conservation";
import { useEffect } from "react";

function Personcard({ chatUser }) {
    const fetchMessages = useConservationStore((state) => state.fetchMessages);
    const setMessagingUser = useConservationStore((state) => state.setMessagingUser);
    const messagingUser = useConservationStore((state) => state.messagingUser);

    const handleClick = () => {
        fetchMessages({ id: chatUser.id });
        setMessagingUser({ id: chatUser.id });
    };
    useEffect(() => {
        console.log("Mesajlaşma başlatıldı:", messagingUser);
    }, [messagingUser]);

    return (
        <button className="personcard-button" onClick={handleClick}>
            <div className="personcard">
                <div className="personcard-image-and-texts">
                    {chatUser.profile_pic ? (
                        <img src={chatUser.profile_pic} alt={chatUser.first_name} className="personcard-image" />
                    ) : (
                        <div className="personcard-placeholder">
                            {chatUser.first_name?.[0]}{chatUser.last_name?.[0]}
                        </div>
                    )}

                    <div className="personcard-texts">
                        <div className="personcard-name">{chatUser.first_name}</div>
                        <div className="personcard-message">{chatUser.lastMessage ? chatUser.lastMessage.content : "No message"}</div>
                    </div>
                </div>

                <div className="personcard-time">{chatUser.lastMessage ? chatUser.lastMessage.created_at : "Unknown time"}</div>
            </div>
        </button>
    );
}

export default Personcard;
