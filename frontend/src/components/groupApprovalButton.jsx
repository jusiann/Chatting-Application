import "../style/groupApprovalButton.css";
import { CheckCircle } from "lucide-react";

const GroupApprovalButton = ({text}) => {
    return (
        <button className="groupApprovalButton">
                <span>{text}</span>
                <CheckCircle />
        </button>
    );
};

export default GroupApprovalButton;