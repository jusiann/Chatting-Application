import "../style/groupCancelButton.css";
import { XCircle } from "lucide-react";
const GroupCancelButton = () => {
    return (
        <button className="groupCancelButton">
            <span>İptal et</span>
            <XCircle />
        </button>
    );
};

export default GroupCancelButton;