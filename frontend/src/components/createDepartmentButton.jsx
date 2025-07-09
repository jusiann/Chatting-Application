import "../style/createDepartmentButton.css";
import { Building } from "lucide-react";

const CreateDepartmentButton = () => {
    return (
        <button className="createDepartmentButton">
            <div className="logo-area">
                <Building className="logo" />
            </div>
            <span className="createDepartmentButton-text">Departman Mesajı</span>
        </button>
    );
};

export default CreateDepartmentButton;