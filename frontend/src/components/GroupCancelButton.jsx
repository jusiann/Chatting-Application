import "../style/group.cancel.button.css";
import { XCircle } from "lucide-react";
const GroupCancelButton = ({ onClick }) => {
  return (
    <button className="groupCancelButton" onClick={onClick}>
      <span>İptal et</span>
      <XCircle />
    </button>
  );
};

export default GroupCancelButton;
