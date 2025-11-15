import React, { useEffect, useState } from "react";
import "../style/MessageTopBar.css";
import { Search, MoreVertical } from "lucide-react";
import useConservationStore from "../store/Conservation";
import GroupIcon from "../assets/group.svg";
import timeFormatter from "../controllers/TimeController";

const MessageTopBar = () => {
  const messagingUser = useConservationStore((state) => state.messagingUser);
  const messagingType = useConservationStore((state) => state.messagingType);
  const contactUsers = useConservationStore((state) => state.contactUsers);
  const typingUsers = useConservationStore((state) => state.typingUsers);

  console.log("🔄 MessageTopBar render oldu. Mevcut kullanıcı:", messagingUser);

  const displayName = () => {
    if (messagingType === "individual") {
      return messagingUser
        ? `${messagingUser.first_name} ${messagingUser.last_name}`
        : "Kullanıcı Seçili Değil";
    } else if (messagingType === "group") {
      return messagingUser ? messagingUser.name : "Kullanıcı Seçili Değil";
    }
  };

  const displayIcon = () => {
    if (messagingType === "individual") {
      return messagingUser?.profile_pic ? (
        <img
          src={messagingUser.profile_pic}
          alt={`${messagingUser.first_name} ${messagingUser.last_name}`}
          className="message-topbar-image"
        />
      ) : (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="gray">
          <circle cx="12" cy="8" r="4" />
          <rect x="4" y="16" width="16" height="6" rx="3" />
        </svg>
      );
    } else if (messagingType === "group") {
      return (
        <img
          src={GroupIcon}
          alt="Group"
          className="message-topbar-image"
          style={{ backgroundColor: "var(--rumeli-brand-color)" }}
        />
      );
    }
  };

  const lastSeen = () => {
    // Find the freshest presence by matching id in contactUsers
    const freshUser =
      contactUsers?.find((u) => String(u.id) === String(messagingUser?.id)) ||
      messagingUser;
    // Normalize presence to boolean: backend may send true/false, 1/0, or '1'/'0'
    const isOnline = !!(
      freshUser &&
      (freshUser.is_online === true ||
        freshUser.is_online === 1 ||
        freshUser.is_online === "1")
    );
    if (isOnline) {
      return "Çevrimiçi";
    } else {
      return timeFormatter(freshUser?.last_seen) || "Bilinmiyor";
    }
  };

  return (
    <div className="message-topbar-container">
      <div className="message-topbar-wrapper">
        <div className="message-topbar-content">
          {displayIcon()}

          <div className="message-topbar-texts">
            <div className="message-topbar-name">{displayName()}</div>
            <div className="message-topbar-status">
              {messagingType === "individual" &&
              typingUsers[String(messagingUser?.id)] ? (
                <p>Yazıyor...</p>
              ) : (
                <p>
                  {messagingType === "individual"
                    ? "Son görülme : " + lastSeen()
                    : ""}
                </p>
              )}
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
