import React from "react";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import Personcard from "../components/Personcard";
import Messagetopbar from "../components/Messagetopbar";
import Messagereceived from "../components/Messagereceived";
import Messagesended from "../components/Messagesended";
import Sendbox from "../components/Sendbox";
import "../style/anaekranpage.css";

const AnaekranPage = () => {
    return (
        <div className="anaekran-container">
            <Sidebar />

            <div className="anaekran-content">
                <Searchbar />

                <div className="anaekran-person-list">
                    <Personcard name="Arş. Gör. Derya Kaya" message="Görüşürüz" time="22:02" image="" />
                    <Personcard name="Mehmet Özkan" message="Anlaştık" time="06:30" image="" />
                    <Personcard name="Doç. Dr. Emre Tanrıverdi" message="Haha bende öyle düşünüyorum" time="14:43" image="" />
                    <Personcard name="Büşra Şahin" message="Haberleşiriz" time="21:30" image="" />
                    <Personcard name="Dr. Öğr. Üyesi Cemal Acar" message="Evet ben de izledim" time="00:16" image="" />
                    <Personcard name="Esra Demir" message="Olur, getiririm" time="17:50" image="" />
                    <Personcard name="Ali Rıza Uçar" message="Uyuyordum" time="17:50" image="" />
                </div>
            </div>

            <div className="anaekran-chat-panel">
                <div className="messagetopbar-container">
                    <Messagetopbar name="Arş. Gör. Derya Kaya" status="Son görülme : Bugün 22:02" image="" />
                </div>

                <div className="anaekran-messages">
                    <Messagereceived text="Selam, yarın 14:00’teki toplantıya katılabilecek misin?" time="14:56" />
                    <Messagesended text="Selam! Evet, katılacağım. Hangi salonda olacak?" time="14:58" />
                    <Messagereceived text="B Blok, 2. kat, 204 numaralı sınıfta." time="15:00" />
                    <Messagesended text="Harika, zamanında orada olurum. Slaytları önceden paylaşabilir misin?" time="16:50" />
                    <Messagereceived text="Tabii, hemen gönderiyorum." time="19:20" />
                    <Messagesended text="Süper, teşekkürler! Görüşürüz 😊" time="22:02" />
                </div>


                <Sendbox />
            </div>
        </div>
    );
};

export default AnaekranPage;
