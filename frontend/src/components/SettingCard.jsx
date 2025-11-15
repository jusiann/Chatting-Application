import { KeyRound } from "lucide-react";
import "../style/SettingCard.css";

const SettingCard = ({
  icon: Icon = KeyRound,
  title = "Hesap",
  subtitle = "Güvenlik bildirimleri, Hesap bilgileri",
  onClick,
}) => {
  return (
    <button className="page-wrapper" onClick={onClick}>
      <div className="setting-card">
        <Icon className="key-icon" />
        <div className="text-content">
          <div className="title">{title}</div>
          <div className="subtitle">{subtitle}</div>
        </div>
      </div>
    </button>
  );
};

export default SettingCard;
