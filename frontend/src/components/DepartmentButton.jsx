import "../style/DepartmentButton.css";
import { Building } from "lucide-react";

const DepartmentButton = ({text = "Bilgisayar mühendisliği"}) => {
    return (
        <button className="departmentButton">
            <Building className="departmentButton-icon"/>
            <p>{text}</p>
        </button>
    );
};

export default DepartmentButton;