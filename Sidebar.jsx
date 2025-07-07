import "../style/sidebar.css";
import {MessageSquareMore , Contact , Settings , User } from "lucide-react";

const Sidebar = () => {
    return <div className="Sidebar">
        <div className="topIcons">
            <MessageSquareMore />
            <Contact />
        </div>
        <div className="bottomIcons">
            <Settings />
            <User />
        </div>
    </div>
}

export default Sidebar;