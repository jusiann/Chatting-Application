import "../style/groupCancelButton.css";
import { XCircle } from "lucide-react";
const GroupCancelButton = () => {
    return (
        <div className="groupCancelButton">
            <span>İptal et</span>
            <XCircle />
        </div>
    );
};

export default GroupCancelButton;