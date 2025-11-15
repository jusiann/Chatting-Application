import "../style/CreateDepartmentButton.css";
import { Building } from "lucide-react";

const CreateDepartmentButton = () => {
    return (
        <button className="createDepartmentButton">
            <div className="logo-area">
                <Building className="logo-group" />
            </div>
            <span className="createDepartmentButton-text">Departman Mesajı</span>
        </button>
    );
};

export default CreateDepartmentButton;