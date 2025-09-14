import React, { use } from "react";
import "../style/settinguser.css";
import useUserStore from "../store/user";

const Settinguser = () => {

    const {user} = useUserStore();
    return (

        <div className="settinguser-wrapper">
            <div className="settinguser-image" />
            <div className="settinguser-texts">
                <div className="settinguser-name">{user.first_name} {user.last_name}</div>
                <div className="settinguser-status">{user.title}</div>
            </div>
        </div>

    );
};

export default Settinguser;
