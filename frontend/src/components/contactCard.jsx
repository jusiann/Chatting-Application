import "../style/contactCard.css";
import tanerCevik from "../assets/tanerCevik.jpg";

const ContactCard = () => {
    return (
        <div className="contactCard">
            <div className="image-area">
                <img src={tanerCevik} alt="Taner Çevik" />
            </div>
            <div className="text-area">
                <div className="title-text">
                    <span>Prof. Dr. Taner Çevik</span>
                    <span>~</span>
                    <span>Bilgisayar Mühendisliği Bölüm Başkanı</span>
                </div>
            </div>
        </div>
    );
};

export default ContactCard;