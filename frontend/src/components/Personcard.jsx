import "../style/personcard.css";
import useConservationStore from "../store/conservation";

function Personcard({ chatUser }) {
    const fetchMessages = useConservationStore((state) => state.fetchMessages);
    const setMessagingUserId = useConservationStore((state) => state.setMessagingUserId);

    const handleClick = () => {
        fetchMessages({ id: chatUser.id });
        setMessagingUserId(chatUser.id);
    };

    return (
        <button className="personcard-button" onClick={handleClick}>
            <div className="personcard">
                <div className="personcard-image-and-texts">
                    {chatUser.profilepic ? (
                        <img src={chatUser.profilepic} alt={chatUser.fullname} className="personcard-image" />
                    ) : (
                        <div className="personcard-placeholder" />
                    )}

                    <div className="personcard-texts">
                        <div className="personcard-name">{chatUser.fullname}</div>
                        <div className="personcard-message">{chatUser.last_message}</div>
                    </div>
                </div>

                <div className="personcard-time">{chatUser.last_message_time}</div>
            </div>
        </button>
    );
}

export default Personcard;
