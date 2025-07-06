import { KeyRound } from "lucide-react";
import "../style/settingcard.css";

const SettingCard = () => {
    return (
        <div className="page-wrapper">
            <div className="setting-card">
                <KeyRound className="key-icon" />
                <div className="text-content">
                    <div className="title">Hesap</div>
                    <div className="subtitle">Güvenlik bildirimleri, Hesap bilgileri</div>
                </div>
            </div>
        </div>
    );
};

export default SettingCard;
