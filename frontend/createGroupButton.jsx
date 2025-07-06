import "../style/createGroupButton.css";
import { Users } from "lucide-react";

const CreateGroupButton = () => {
    return (
        <div className="createGroupButton">
            <div className="logo-area">
                <Users className="logo" />
            </div>
            <span className="createGroupButton-text">Grup Oluştur</span>
        </div>
    );
};

export default CreateGroupButton;