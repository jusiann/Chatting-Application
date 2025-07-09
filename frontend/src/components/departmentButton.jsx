import "../style/departmentButton.css";
import { Building } from "lucide-react";

const DepartmentButton = () => {
    return (
        <button className="departmentButton">
            <Building />
            <span>Bilgisayar mühendisliği</span>
        </button>
    );
};

export default DepartmentButton;