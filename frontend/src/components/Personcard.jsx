import "../style/personcard.css";

function Personcard({ chatUser }) {
    return (
        <button className="personcard-button">
            <div className="personcard">
                <div className="personcard-image-and-texts">
                    {chatUser.profilepic ? (
                        <img src={chatUser.profilepic} alt={chatUser.fullname} className="personcard-image" />
                    ) : (
                        <div className="personcard-placeholder" />
                    )}

                    <div className="personcard-texts">
                        <div className="personcard-name">{chatUser.fullname}</div>
                        <div className="personcard-message">{chatUser.last_message}</div>
                    </div>
                </div>

                <div className="personcard-time">{chatUser.last_message_time}</div>
            </div>
        </button>
    );
}

export default Personcard;
