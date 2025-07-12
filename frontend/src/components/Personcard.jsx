import "../style/personcard.css";

function Personcard({ name, title, image }) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    return (
        <div className="personcard">
            {image ? (
                <img src={image} alt={name} className="personcard-image" />
            ) : (
                <div className="personcard-placeholder" />
            )}

            <div className="personcard-texts">
                <div className="personcard-name">{name}</div>
                <div className="personcard-message">{title}</div>
            </div>

            <div className="personcard-time">{currentTime}</div>
        </div>
    );
}

export default Personcard;
