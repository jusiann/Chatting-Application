import "../style/gruppage.css";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import ContactCard from "../components/contactCard";
import { ChevronDown } from "lucide-react";
import GroupCancelButton from "../components/groupCancelButton";
import GroupApprovalButton from "../components/groupApprovalButton";

function Gruppage() {
    return (
        <div className="gruppage-container">
            <Sidebar />

            <div className="gruppage-content">
                <Searchbar placeholder="Kişilerde arama yap" />

                <div className="group-card">
                    <div className="group-header">Grup üyelerini seçiniz</div>

                    <div className="group-sortbar-row">
                        <span className="group-sortbar-left">Sıralama</span>
                        <span className="group-sortbar-right">
                            Varsayılan
                            <ChevronDown size={18} style={{ marginLeft: "5px" }} />
                        </span>
                    </div>

                    <div className="group-person-list">
                        <ContactCard name="Prof. Dr. Taner Çevik" title="Bilgisayar Mühendisliği" />
                        <ContactCard name="Doç. Dr. Emre Tanrıverdi" title="Elektrik-Elektronik Mühendisliği" />
                        <ContactCard name="Dr. Öğr. Üyesi Cemal Acar" title="Endüstri Mühendisliği" />
                        <ContactCard name="Esra Demir" title="Fakülte Sekreteri" />
                        <ContactCard name="Mehmet Özkan" title="Öğrenci İşleri" />
                        <ContactCard name="Gizem Tok" title="Kütüphane Sorumlusu" />
                        <ContactCard name="Derya Kaya" title="Makine Mühendisliği" />
                    </div>

                </div>
            </div>
            <div className="grouppage-right-panel-container">
                <div className="gruppage-right-panel">
                    <div className="group-image-placeholder">
                        <div className="group-image-circle">Grup<br />Simgesi Ekle</div>
                    </div>

                    <input type="text" className="group-name-input" placeholder="Grup adını giriniz" />

                    <div className="selected-members-title">Seçili üyeler</div>

                    <div className="selected-members-list">
                        <ContactCard name="İsmail Yıldız" title="Yazılım Uzmanı"  />
                        <ContactCard name="Zeynep Aksoy" title="Akademik Danışman"  />
                        <ContactCard name="Büşra Şahin" title="Eğitim Fakültesi Sekreteri"  />
                        <ContactCard name="Barış Çetin" title="Mühendislik Fakültesi Asistanı"  />
                        <ContactCard name="Nehir Yılmaz" title="Rektörlük Sekreteri"  />
                    </div>

                    <div className="group-action-buttons">
                        <GroupCancelButton />
                        <GroupApprovalButton text={"Grubu oluştur"}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Gruppage;
