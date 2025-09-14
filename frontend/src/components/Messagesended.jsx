import "../style/messagesended.css";
import { CheckCheck, Check } from "lucide-react";
import timeFormatter from "../controllers/TimeController";

function MessageSended({message}) {
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
                    <span className="message-sended-time">{timeFormatter(message.created_at)}</span>
                    {statusIcon}
                </div>
            </div>
        </div>
    );
}

export default MessageSended;
