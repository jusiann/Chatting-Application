import React from "react";
import "../style/sendbox.css";
import { SmilePlus, Paperclip, Send } from "lucide-react";

const Sendbox = () => {
    return (
        <div className="sendbox-wrapper">
            <div className="sendbox-container">
                <div className="sendbox-icon">
                    <SmilePlus size={24} />
                </div>

                <input
                    type="text"
                    placeholder="Mesaj"
                    className="sendbox-input"
                />

                <div className="sendbox-attachment">
                    <Paperclip size={24} />
                </div>

                <div className="sendbox-send">
                    <Send size={24} />
                </div>
            </div>
        </div>
    );
};

export default Sendbox;
