import "../style/createDepartmentButton.css";
import { Building } from "lucide-react";

const CreateDepartmentButton = () => {
    return (
        <div className="createDepartmentButton">
            <div className="logo-area">
                <Building className="logo" />
            </div>
            <span className="createDepartmentButton-text">Departman Mesajı</span>
        </div>
    );
};

export default CreateDepartmentButton;