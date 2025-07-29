import React from "react";
import "../style/messagetopbar.css";
import { Search, MoreVertical } from "lucide-react";
import useConservationStore from "../store/conservation";

const MessageTopBar = ({ id }) => {
    const contactUsers = useConservationStore((state) => state.contactUsers);
    const selectedUser = contactUsers.find((user) => user.id === id);

    return (
        <div className="message-topbar-container">
            <div className="message-topbar-wrapper">
                <div className="message-topbar-content">
                    {selectedUser?.profile_pic ? (
                        <img
                            src={selectedUser.profile_pic}
                            alt={`${selectedUser.first_name} ${selectedUser.last_name}`}
                            className="message-topbar-image"
                        />
                    ) : (
                        <div className="message-topbar-image" />
                    )}

                    <div className="message-topbar-texts">
                        <div className="message-topbar-name">
                            {selectedUser
                                ? `${selectedUser.first_name} ${selectedUser.last_name}`
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
