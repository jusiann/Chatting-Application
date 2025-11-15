import SearchBar from "../components/SearchBar";
import "../style/SettingsPage.css";
import SettingUser from "../components/SettingUser";
import SettingCard from "../components/SettingCard";
import SideBar from "../components/SideBar";
import {
  Bell,
  Globe,
  HelpCircle,
  KeyRound,
  Lock,
  LogOut,
  User,
} from "lucide-react";
import useUserStore from "../store/User";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { logout } = useUserStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="settings-container">
      <SideBar />
      <div className="settings-content">
        <SearchBar />
        <div className="settings-card">
          <SettingUser />
          <div className="settings-options">
            <SettingCard />
            <SettingCard
              title="Gizlilik"
              icon={Lock}
              subtitle="Hesap gizliliğinizi yönetin."
            />
            <SettingCard
              title="Bildirimler"
              icon={Bell}
              subtitle="Bildirim ayarlarınızı yönetin."
            />
            <SettingCard
              title="Dil"
              icon={Globe}
              subtitle="Uygulama dilini değiştirin."
            />
            <SettingCard
              title="Yardım"
              icon={HelpCircle}
              subtitle="Yardım ve destek alın."
            />
            <SettingCard
              title="Çıkış"
              icon={LogOut}
              subtitle="Hesabınızdan çıkış yapın."
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
      <div className="settings-right">
        <h1>Ayarlar</h1>
      </div>
    </div>
  );
};

export default SettingsPage;
