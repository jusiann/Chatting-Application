import "../style/rehberpage.css";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import CreateGroupButton from "../components/createGroupButton";
import CreateDepartmentButton from "../components/createDepartmentButton";
import SortBar from "../components/sortBar";
import Personcard from "../components/Personcard";
import { Building, Building2 } from "lucide-react";

function RehberPage() {
    return (
        <div className="rehber-container">
            <Sidebar />

            <div className="rehber-content">
                <Searchbar />

                <div className="rehber-card">
                    <div className="button-row">
                        <CreateGroupButton text="Grup Oluştur" />
                        <CreateDepartmentButton text="Departman Mesajı" />
                        <div className="divider"/>
                    </div>

                    <SortBar />

                    <div className="person-list">
                        <Personcard
                            name="Arş. Gör. Derya Kaya"
                            title="Görüşürüz"
                            image=""
                        />
                        <Personcard
                            name="Arş. Gör. Emre Aksu"
                            title="Çalışmaya devam"
                            image=""
                        />
                        <Personcard
                            name="Taner Çevik"
                            title="Toplantı 11:00"
                            image="tanerCevik.jpg"
                        />
                        <Personcard
                            name="Doç. Dr. Emre Tanrıverdi"
                            title="Elektrik ve Elektronik Mühendisliği"
                            image=""
                        />
                        <Personcard
                            name="Prof. Dr. Taner Çevik"
                            title="Bilgisayar Mühendisliği Bölüm Başkanı"
                            image=""
                        />
                        <Personcard
                            name="Dr. Öğr. Üyesi Cemal Acar"
                            title="Endüstri Mühendisliği"
                            image=""
                        />
                    </div>
                </div>
            </div>

            <div className="rehber-right-panel">REHBER</div>
        </div>
    );
}

export default RehberPage;