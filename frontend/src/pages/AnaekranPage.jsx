import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import Personcard from "../components/Personcard";
import Messagetopbar from "../components/Messagetopbar";
import Messagereceived from "../components/Messagereceived";
import Messagesended from "../components/Messagesended";
import Sendbox from "../components/Sendbox";
import useConservationStore from "../store/conservation";
import useUserStore from "../store/user";
import "../style/anaekranpage.css";

const AnaekranPage = () => {
    const {
        chatUsers,
        chatUsersFetch,
        messages,
        messagingUserId
    } = useConservationStore();

    const { user } = useUserStore();

    useEffect(() => {
        chatUsersFetch();
    }, []);

    return (
        <div className="anaekran-container">
            <Sidebar />

            <div className="anaekran-content">
                <Searchbar />

                <div className="anaekran-person-list">
                    {Array.isArray(chatUsers) &&
                        chatUsers.map((chatUser) => (
                            <Personcard key={chatUser.id} chatUser={chatUser} />
                        ))}
                </div>
            </div>

            <div className="anaekran-chat-panel">
                <div className="messagetopbar-container-home">
                    <Messagetopbar id={messagingUserId} />
                </div>

                <div className="anaekran-messages">
                    {messages.map((message, index) =>
                        message.sender_id === user.id ? (
                            <Messagesended
                                key={index}
                                text={message.content}
                                time={message.created_at}
                                status={message.status}
                            />
                        ) : (
                            <Messagereceived
                                key={index}
                                text={message.content}
                                time={message.created_at}
                                status={message.status}
                            />
                        )
                    )}
                </div>

                <Sendbox />
            </div>
        </div>
    );
};

export default AnaekranPage;
