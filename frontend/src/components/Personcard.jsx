import "../style/personcard.css";

function Personcard() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    return (
        <div className="personcard">
            <div className="personcard-placeholder" />
            <div className="personcard-texts">
                <div className="personcard-name">Arş. Gör. Derya Kaya</div>
                <div className="personcard-message">Görüşürüz</div>
            </div>
            <div className="personcard-time">{currentTime}</div>
        </div>
    );
}

export default Personcard;
