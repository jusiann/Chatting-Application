import React from "react";
import "../style/messagetopbar.css";
import { Search, MoreVertical } from "lucide-react";

const MessageTopBar = () => {
    return (
        <div className="message-topbar-container">
            <div className="message-topbar-wrapper">
                <div className="message-topbar-content">
                    <div className="message-topbar-image" />
                    <div className="message-topbar-texts">
                        <div className="message-topbar-name">Arş. Gör. Derya Kaya</div>
                        <div className="message-topbar-status">
                            Son görülme : Bugün 22:02
                        </div>
                    </div>
                </div>
                <div className="message-topbar-icons">
                    <Search color="white" size={20} />
                    <MoreVertical color="white" size={20} />
                </div>
            </div>
        </div>
    );
};

export default MessageTopBar;
