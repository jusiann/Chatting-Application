import "../style/ContactCard.css";
import tanerCevik from "../assets/tanerCevik.jpg";

const ContactCard = ({name = "Prof. Dr. Taner Çevik", title = "Bilgisayar Mühendisliği Bölüm Başkanı", image = "src/assets/tanerCevik.jpg"}) => {
    return (
        <div className="contactCard">
            <div className="contact-image-and-texts">
                <img src={image} alt="Contact" className="contact-image" />
                <p className="contact-name">{name}</p>
            </div>
            <p className="contact-title">{title}</p>
        </div>
    );
};

export default ContactCard;