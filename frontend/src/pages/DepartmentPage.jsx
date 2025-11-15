import "../style/DepartmentPage.css";
import SideBar from "../components/SideBar";
import SearchBar from "../components/SearchBar";
import ContactCard from "../components/ContactCard";
import { ChevronDown } from "lucide-react";
import DepartmentButton from "../components/DepartmentButton";
import GroupCancelButton from "../components/GroupCancelButton";
import GroupApprovalButton from "../components/GroupApprovalButton";

function DepartmentPage() {
    return (
        <div className="departmanpage-container">
            <SideBar />

            <div className="departmanpage-content">
                <SearchBar placeholder="Kişilerde arama yap" />

                <div className="departman-card">
                    <div className="departman-header">Departman seçimi yapınız</div>

                    <div className="departman-sortbar-row">
                        <span className="departman-sortbar-left">Sıralama</span>
                        <span className="departman-sortbar-right">
                            Varsayılan
                            <ChevronDown size={18} style={{ marginLeft: "5px" }} />
                        </span>
                    </div>

                    <div className="departman-person-list">
                        <DepartmentButton text="Bilgisayar mühendisliği"/>
                        <DepartmentButton text="İnşaat mühendisliği"/>
                        <DepartmentButton text="Endüstri mühendisliği"/>
                        <DepartmentButton text="Elektrik mühendisliği"/>
                    </div>

                </div>
            </div>
            <div className="departmanpage-right-panel-container">
                <div className="gruppage-right-panel">
                    <DepartmentButton />
                    <div className="header-and-input">
                        <h3 className="message-header">Mesaj Başlığı</h3>
                        <input type="text" className="message-input" placeholder="Mesaj başlığını giriniz..." />
                    </div>
                    <div className="message-textarea-container">
                        <h3 className="message-textarea-header">Mesaj</h3>
                        <textarea className="message-textarea" placeholder="Mesajınızı buraya yazın..."></textarea>
                    </div>
                    <div className="departman-page-button-row">
                        <GroupCancelButton />
                        <GroupApprovalButton text={"Mesaj gönder"}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DepartmentPage;
