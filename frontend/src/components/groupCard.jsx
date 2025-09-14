import "../style/groupCard.css";
import useConservationStore from "../store/conservation";
import { useEffect } from "react";
import timeFormatter from "../controllers/TimeController";
import useSocketStore from "../store/socket";
import useUserStore from "../store/user";
import useGroupStore from "../store/group";
import groupIcon from "../assets/group.svg";

function groupCard({ groupRoom }) {
    const fetchMessages = useConservationStore((state) => state.fetchGroupMessages);
    const setMessagingUser = useConservationStore((state) => state.setMessagingUser);
    const messagingUser = useConservationStore((state) => state.messagingUser);
    const setMessagingType = useConservationStore((state) => state.setMessagingType);

    const {emit} = useSocketStore();
    const {user} = useUserStore();

    const handleClick = () => {
        fetchMessages(groupRoom.id);
        setMessagingType("group");
        setMessagingUser({ id: groupRoom.id });
        emit("mark_group_read", { receiver_id: user.id, sender_id: groupRoom.id });
    };
    useEffect(() => {
        console.log("Mesajlaşma başlatıldı:", messagingUser);
    }, [messagingUser]);

    return (
        <button className="groupcard-button" onClick={handleClick}>
            <div className="groupcard">
                <div className="groupcard-image-and-texts">
                        {/* <svg width="40" height="40" viewBox="0 0 24 24" fill="gray">
                            <circle cx="12" cy="8" r="4" />
                            <rect x="4" y="16" width="16" height="6" rx="3" />
                        </svg> */}
                        <img src = {groupIcon} alt="Group Icon" className="groupcard-logo"/>

                    <div className="groupcard-texts">
                        <div className="groupcard-name">{groupRoom.name}</div>
                        <div className="groupcard-message">{groupRoom.last_message ? groupRoom.last_message : "Grup oluşturuldu."}</div>
                    </div>
                </div>

                <div className="groupcard-time">{groupRoom.last_message_time ? timeFormatter(groupRoom.last_message_time) : timeFormatter(groupRoom.created_at)}</div>
            </div>
        </button>
    );
}

export default groupCard;
