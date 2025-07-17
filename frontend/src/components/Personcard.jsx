import "../style/personcard.css";

function Personcard({ name, message, image, time }) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    return (
        <button className="personcard-button">
        <div className="personcard">
            <div className="personcard-image-and-texts">
                    {image ? (
                    <img src={image} alt={name} className="personcard-image" />
                ) : (
                    <div className="personcard-placeholder" />
                )}

                <div className="personcard-texts">
                    <div className="personcard-name">{name}</div>
                    <div className="personcard-message">{message}</div>
                </div>
            </div>

            <div className="personcard-time">{time}</div>
        </div>
        </button>
    );
}

export default Personcard;
