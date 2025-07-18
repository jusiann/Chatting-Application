import SearchBar from "../components/Searchbar";
import "../style/SettingsPage.css";
import Settingsuser from "../components/Settinguser";
import SettingCard from "../components/Settingcard";
import Sidebar from "../components/Sidebar";
import { Bell, Globe, HelpCircle, KeyRound, Lock, LogOut, User } from "lucide-react";


const SettingsPage = () => {
    return (
        <div className="settings-container">
            <Sidebar />
            <div className="settings-content">
                <SearchBar />
                <div className="settings-card">
                    <Settingsuser />
                    <div className="settings-options">
                        <SettingCard />
                        <SettingCard title="Gizlilik" icon={ Lock } subtitle="Hesap gizliliğinizi yönetin."/>
                        <SettingCard title="Bildirimler" icon={Bell} subtitle="Bildirim ayarlarınızı yönetin." />
                        <SettingCard title="Dil" icon={Globe} subtitle="Uygulama dilini değiştirin." />
                        <SettingCard title="Yardım" icon={HelpCircle} subtitle="Yardım ve destek alın." />
                        <SettingCard title="Çıkış" icon={LogOut} subtitle="Hesabınızdan çıkış yapın." />
                    </div>
                    
                </div>
            </div>
            <div className="settings-right">
                <h1>Ayarlar</h1>
            </div>
        </div>
    );
}

export default SettingsPage;