import "../style/sidebar.css";
import {MessageSquareMore , Contact , Settings , User } from "lucide-react";

const Sidebar = () => {
    return <div className="Sidebar">
        <div className="topIcons">
            <button className="sidebarButton">
                <MessageSquareMore size={25} />
            </button>
            <button className="sidebarButton">
                <Contact size={25} />
            </button>
        </div>
        <div className="bottomIcons">
            <button className="sidebarButton">
                <Settings size={25} />
            </button>
            <button className="sidebarButton">
                <User size={25} />
            </button>
        </div>
    </div>
}

export default Sidebar;