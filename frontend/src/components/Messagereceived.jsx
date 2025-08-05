import "../style/messagereceived.css";

function MessageReceived({ message }) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    return (
        <div className="message-received-container">
            <div className="message-received">
                <p className="message-received-text">
                    {message.content}
                </p>
                <span className="message-received-time">{message.created_at}</span>
            </div>
        </div>
    );
}

export default MessageReceived;

