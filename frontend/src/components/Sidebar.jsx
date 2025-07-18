import "../style/sidebar.css";
import {MessageSquareMore , Contact , Settings , User } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    return <div className="Sidebar">
        <div className="topIcons">
            <button className="sidebarButton" onClick={() => navigate("/home")}>
                <MessageSquareMore size={25} />
            </button>
            <button className="sidebarButton" onClick={() => navigate("/rehber")}>
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