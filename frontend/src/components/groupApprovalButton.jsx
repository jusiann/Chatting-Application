import "../style/groupApprovalButton.css";
import { CheckCircle } from "lucide-react";

const GroupApprovalButton = ({text, onClick}) => {
    return (
        <button className="groupApprovalButton" onClick={onClick}>
                <span>{text}</span>
                <CheckCircle />
        </button>
    );
};

export default GroupApprovalButton;