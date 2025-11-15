import "../style/CreateGroupButton.css";
import { Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const CreateGroupButton = ({logo: Logo = Users, onClick = "/grup", text = "Grup Oluştur"}) => {
    const navigate = useNavigate();
    return (
        <button className="createGroupButton" onClick={() => navigate(onClick)}>
            <div className="createGroupButton-icon">
                <Logo className="logo-group" />
            </div>
            <p className="createGroupButton-text">{text}</p>
        </button>
    );
};  

export default CreateGroupButton;