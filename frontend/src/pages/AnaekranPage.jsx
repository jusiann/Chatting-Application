import React, { useEffect , useRef} from "react";
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
import useSocketStore from "../store/socket";

const AnaekranPage = () => {
    const {
        chatUsers,
        chatUsersFetch,
        messages,
        messagingUserId,
        initializeSocket,
        addNewMessage,
        messagingUser,
        handleDelivered,
    } = useConservationStore();

    const { user } = useUserStore();

    const {on, off, emit} = useSocketStore();

    const messagesEndRef = useRef(null);

    useEffect(() => {
        chatUsersFetch();
        initializeSocket();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (messagingUserId) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [messagingUserId]);

    useEffect(() => {
        on("new_message", (message) => {
            if (message.sender_id === messagingUser?.id) {
                addNewMessage(message);
            }
            chatUsersFetch();

            emit("mark_delivered", { message_id: message.id });
        });

        on("message_delivered", (data) => {
            const msgId = data.message_id;
            handleDelivered(msgId);
            chatUsersFetch();
        });
        return () => {
            off("new_message");
            off("message_delivered");
        }
    }, [on, addNewMessage, messagingUser?.id, off]);

    const scrollToBottom = () => {
        // Yöntem 1: messagesEndRef kullanarak
        messagesEndRef.current?.scrollIntoView({ 
            behavior: "smooth",
            block: "end"
        });
    };

    const sortedMessages = messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const filteredChatUsers = Array.isArray(chatUsers) ? chatUsers.filter(chatUser => chatUser.lastMessage != null) : [];
    const sortedChatUser = filteredChatUsers.sort((a, b) => {
        const aTime = new Date(a.lastMessage.created_at);
        const bTime = new Date(b.lastMessage.created_at);
        return bTime - aTime; // En son mesajı önce göster
    });

    return (
        <div className="anaekran-container">
            <Sidebar />

            <div className="anaekran-content">
                <Searchbar />

                <div className="anaekran-person-list">
                    {Array.isArray(sortedChatUser) &&
                        sortedChatUser.map((chatUser) => (
                            <Personcard key={chatUser.id} chatUser={chatUser} />
                        ))}
                </div>
            </div>

            <div className="anaekran-chat-panel">
                <div className="messagetopbar-container-home">
                    <Messagetopbar />
                </div>

                <div className="anaekran-messages">
                    {sortedMessages.map((message, index) =>
                        message.sender_id === user.id ? (
                            <Messagesended
                                key={index}
                                message={message}
                            />
                        ) : (
                            <Messagereceived
                                key={index}
                                message={message}
                            />
                        )
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <Sendbox />
            </div>
        </div>
    );
};

export default AnaekranPage;
