import "../style/createGroupButton.css";
import { Users } from "lucide-react";

const CreateGroupButton = ({logo: Logo = Users}) => {
    return (
        <button className="createGroupButton">
            <div className="logo-area">
                <Logo className="logo" />
            </div>
            <span className="createGroupButton-text">Grup Oluştur</span>
        </button>
    );
};  

export default CreateGroupButton;