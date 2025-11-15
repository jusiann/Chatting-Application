import "../style/GroupCard.css";
import useConservationStore from "../store/Conservation";
import { useEffect } from "react";
import timeFormatter from "../controllers/TimeController";
import useSocketStore from "../store/Socket";
import useUserStore from "../store/User";
import useGroupStore from "../store/Group";
import groupIcon from "../assets/group.svg";

function GroupCard({ groupRoom }) {
  const fetchMessages = useConservationStore(
    (state) => state.fetchGroupMessages
  );
  const setMessagingUser = useConservationStore(
    (state) => state.setMessagingUser
  );
  const messagingUser = useConservationStore((state) => state.messagingUser);

  const { emit } = useSocketStore();
  const { user } = useUserStore();

  const { unreadGroups, clearUnread } = useGroupStore();

  const handleClick = () => {
    fetchMessages(groupRoom.id);
    setMessagingUser({ id: groupRoom.id, type: "group" });
    emit("group_read", { groupId: groupRoom.id });
    clearUnread(groupRoom.id);
  };
  useEffect(() => {
    console.log("Mesajlaşma başlatıldı:", messagingUser);
  }, [messagingUser]);

  const PREVIEW_MAX_CHARS = 40; // adjust this value as you like
  const getPreview = (text) => {
    if (!text) return "Grup Oluşturuldu";
    if (text.length <= PREVIEW_MAX_CHARS) return text;
    return text.slice(0, PREVIEW_MAX_CHARS) + "...";
  };

  return (
    <button className="groupcard-button" onClick={handleClick}>
      <div className="groupcard">
        <div className="groupcard-image-and-texts">
          {/* <svg width="40" height="40" viewBox="0 0 24 24" fill="gray">
                            <circle cx="12" cy="8" r="4" />
                            <rect x="4" y="16" width="16" height="6" rx="3" />
                        </svg> */}
          <img src={groupIcon} alt="Group Icon" className="groupcard-logo" />

          <div className="groupcard-texts">
            <div className="groupcard-name">{groupRoom.name}</div>
            <div className="groupcard-message">
              {getPreview(groupRoom.last_message)}
            </div>
          </div>
        </div>
        <div className="groupcard-unread-and-time">
          <div className="groupcard-time">
            {groupRoom.last_message_time
              ? timeFormatter(groupRoom.last_message_time)
              : timeFormatter(groupRoom.created_at)}
          </div>
          {unreadGroups[groupRoom.id] > 0 && (
            <span className="groupcard-unread-badge">
              {unreadGroups[groupRoom.id]}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default GroupCard;
