import "../style/gruppage.css";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import ContactCard from "../components/contactCard";
import { ChevronDown } from "lucide-react";

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
                        <ContactCard name="Prof. Dr. Taner Çevik" title="Bilgisayar Mühendisliği" image="" />
                        <ContactCard name="Doç. Dr. Emre Tanrıverdi" title="Elektrik-Elektronik Mühendisliği" image="" />
                        <ContactCard name="Dr. Öğr. Üyesi Cemal Acar" title="Endüstri Mühendisliği" image="" />
                        <ContactCard name="Esra Demir" title="Fakülte Sekreteri" image="" />
                        <ContactCard name="Mehmet Özkan" title="Öğrenci İşleri" image="" />
                        <ContactCard name="Gizem Tok" title="Kütüphane Sorumlusu" image="" />
                        <ContactCard name="Derya Kaya" title="Makine Mühendisliği" image="" />
                    </div>

                </div>
            </div>

            <div className="gruppage-right-panel">
                <div className="group-image-placeholder">
                    <div className="group-image-circle">Grup<br />Simgesi Ekle</div>
                </div>

                <input type="text" className="group-name-input" placeholder="Grup adını giriniz" />

                <div className="selected-members-title">Seçili üyeler</div>

                <div className="selected-members-list">
                    <ContactCard name="İsmail Yıldız" title="Yazılım Uzmanı" image="" />
                    <ContactCard name="Zeynep Aksoy" title="Akademik Danışman" image="" />
                    <ContactCard name="Büşra Kar" title="Eğitim Fakültesi Sekreteri" image="" />
                    <ContactCard name="Barış Çetin" title="Mühendislik Fakültesi Asistanı" image="" />
                    <ContactCard name="Nehir Yılmaz" title="Rektörlük Sekreteri" image="" />
                </div>

                <div className="group-action-buttons">
                    <button className="cancel-btn">❌ İptal et</button>
                    <button className="create-btn">✅ Grubu oluştur</button>
                </div>
            </div>
        </div>
    );
}

export default Gruppage;
