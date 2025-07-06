import "../style/departmentButton.css";
import { Building } from "lucide-react";

const DepartmentButton = () => {
    return (
        <div className="departmentButton">
            <Building />
            <span>Bilgisayar mühendisliği</span>
        </div>
    );
};

export default DepartmentButton;