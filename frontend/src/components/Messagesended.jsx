import "../style/messagesended.css";
import { CheckCheck } from "lucide-react";

function MessageSended() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    return (
        <div className="message-sended-container">
            <div className="message-sended">
                <p className="message-sended-text">
                    Selam, yarın 14:00'teki toplantıya katılabilecek misin?
                </p>
                <div className="message-sended-meta">
                    <span className="message-sended-time">{currentTime}</span>
                    <CheckCheck className="message-sended-check" />
                </div>
            </div>
        </div>
    );
}

export default MessageSended;
