import "../style/messagereceived.css";
import timeFormatter from "../controllers/TimeController";

function MessageReceived({ message }) {
    return (
        <div className="message-received-container">
            <div className="message-received">
                <p className="message-received-text">
                    {message.content}
                </p>
                <span className="message-received-time">{timeFormatter(message.created_at)}</span>
            </div>
        </div>
    );
}

export default MessageReceived;

