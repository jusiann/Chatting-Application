import React, { useState, useEffect } from "react";
import "../style/sendbox.css";
import { SmilePlus, Paperclip, Send } from "lucide-react";
import useConservationStore from "../store/conservation";

const Sendbox = () => {
    const [message, setMessage] = useState({
        content: "",
        receiver_id: "", 
    });

    const { sendMessage , messagingUser, chatUsersFetch} = useConservationStore();

    useEffect(() => {
        setMessage(prev => ({
            ...prev,
            receiver_id: messagingUser?.id || ""
        }));
    }, [messagingUser]);

    const handleChange = (e) => {
        setMessage({ ...message, [e.target.name]: e.target.value });
    };
    const handleSend = () => {
        if (message.content.trim() && message.receiver_id) {
            sendMessage(message);
            console.log("Mesaj gönderildi:", message);
            setMessage({ ...message, content: "" }); // Mesaj kutusunu temizle
            chatUsersFetch(); // Güncel kullanıcı listesini çek
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
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
                    name="content"
                    value={message.content}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                />

                <div className="sendbox-attachment">
                    <Paperclip size={24} />
                </div>

                <div className="sendbox-send" onClick={handleSend}>
                    <Send size={24} />
                </div>
            </div>
        </div>
    );
};

export default Sendbox;
