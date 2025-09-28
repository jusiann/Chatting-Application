import "../style/groupApprovalButton.css";
import { CheckCircle, LoaderCircle } from "lucide-react";
import useFileStore from "../store/file.js";

const GroupApprovalButton = ({ text, onClick }) => {
  const { uploading } = useFileStore();
  return (
    <button className="groupApprovalButton" onClick={onClick}>
      {uploading ? (
        <LoaderCircle className="spinnerLoader" />
      ) : (
        <>
          <span>{text}</span>
          <CheckCircle />
        </>
      )}
    </button>
  );
};

export default GroupApprovalButton;
