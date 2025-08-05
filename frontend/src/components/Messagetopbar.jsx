import React, { useEffect, useState } from "react";
import "../style/messagetopbar.css";
import { Search, MoreVertical } from "lucide-react";
import useConservationStore from "../store/conservation";

const MessageTopBar = () => {
    const messagingUser = useConservationStore((state) => state.messagingUser);

    console.log('🔄 MessageTopBar render oldu. Mevcut kullanıcı:', messagingUser);

    return (
        <div className="message-topbar-container">
            <div className="message-topbar-wrapper">
                <div className="message-topbar-content">
                    {messagingUser?.profile_pic ? (
                        <img
                            src={messagingUser.profile_pic}
                            alt={`${messagingUser.first_name} ${messagingUser.last_name}`}
                            className="message-topbar-image"
                        />
                    ) : (
                        <div className="message-topbar-image" />
                    )}

                    <div className="message-topbar-texts">
                        <div className="message-topbar-name">
                            {messagingUser
                                ? `${messagingUser.first_name} ${messagingUser.last_name}`
                                : "Kullanıcı Seçili Değil"}
                        </div>
                        <div className="message-topbar-status">
                            Son görülme : Bugün 22:02
                        </div>
                    </div>
                </div>

                <div className="message-topbar-icons">
                    <button className="message-topbar-icon">
                        <Search color="white" size={20} />
                    </button>
                    <button className="message-topbar-icon">
                        <MoreVertical color="white" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageTopBar;
