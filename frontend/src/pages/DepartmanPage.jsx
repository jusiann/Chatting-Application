import "../style/DepartmanPage.css";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import ContactCard from "../components/contactCard";
import { ChevronDown } from "lucide-react";
import DepartmentButton from "../components/departmentButton";
import GroupCancelButton from "../components/groupCancelButton";
import GroupApprovalButton from "../components/groupApprovalButton";

function DepartmanPage() {
    return (
        <div className="departmanpage-container">
            <Sidebar />

            <div className="departmanpage-content">
                <Searchbar placeholder="Kişilerde arama yap" />

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

export default DepartmanPage;
