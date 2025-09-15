import "../style/groupMessageReceived.css";
import timeFormatter from "../controllers/TimeController";
import useConservationStore from "../store/conservation";

function GroupMessageReceived({ message }) {
    const {contactUsers} = useConservationStore();

    const findSenderName = (message) => {
        const sender = contactUsers.find(user => user.id === message.sender_id);
        return sender ? `${sender.first_name} ${sender.last_name}` : "Unknown";
    }
    return (
        <div className="group-message-received-container">
            <div className="group-message-received">
                <h3>{findSenderName(message)}</h3>
                <p className="group-message-received-text">
                    {message.content}
                </p>
                <span className="group-message-received-time">{timeFormatter(message.created_at)}</span>
            </div>
        </div>
    );
}

export default GroupMessageReceived;

