import "../style/createGroupButton.css";
import { Users } from "lucide-react";

const CreateGroupButton = () => {
    return (
        <button className="createGroupButton">
            <div className="logo-area">
                <Users className="logo" />
            </div>
            <span className="createGroupButton-text">Grup Oluştur</span>
        </button>
    );
};

export default CreateGroupButton;