import "../style/messagereceived.css";

function MessageReceived({text, time}) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    return (
        <div className="message-received-container">
            <div className="message-received">
                <p className="message-received-text">
                    {text}
                </p>
                <span className="message-received-time">{time}</span>
            </div>
        </div>
    );
}

export default MessageReceived;
