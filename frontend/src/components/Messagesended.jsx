import "../style/messagesended.css";
import { CheckCheck, Check } from "lucide-react";

function MessageSended({message}) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;
    let statusIcon = null;

    if (message.status === "sent") {
        statusIcon = <Check className="message-sended-check" />;
    } else if (message.status === "delivered") {
        statusIcon = <CheckCheck className="message-sended-check" />;
    }
    else {
        statusIcon = <CheckCheck className="message-sended-check-read" />; // Varsayılan olarak hiçbir ikon gösterme
    }

    return (
        <div className="message-sended-container">
            <div className="message-sended">
                <p className="message-sended-text">
                    {message.content}
                </p>
                <div className="message-sended-meta">
                    <span className="message-sended-time">{message.created_at}</span>
                    {statusIcon}
                </div>
            </div>
        </div>
    );
}

export default MessageSended;
