import React, { use, useEffect } from "react";
import "../style/SettingUser.css";
import useUserStore from "../store/User";

const SettingUser = () => {
  const myUser = useUserStore((s) => s.user);
  if (!myUser) {
    return (
      <div className="settinguser-wrapper">
        <div className="settinguser-image">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="gray">
            <circle cx="12" cy="8" r="4" />
            <rect x="4" y="16" width="16" height="6" rx="3" />
          </svg>
        </div>
        <div className="settinguser-texts">
          <div className="settinguser-name">Yükleniyor...</div>
          <div className="settinguser-status"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="settinguser-wrapper">
      <div className="settinguser-image">
        {myUser.profile_pic != null ? (
          <img
            src={myUser.profile_pic}
            alt="Profile"
            className="settinguser-img"
          />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="gray">
            <circle cx="12" cy="8" r="4" />
            <rect x="4" y="16" width="16" height="6" rx="3" />
          </svg>
        )}
      </div>
      <div className="settinguser-texts">
        <div className="settinguser-name">
          {myUser.first_name} {myUser.last_name}
        </div>
        <div className="settinguser-status">{myUser.title}</div>
      </div>
    </div>
  );
};

export default SettingUser;
