import "../style/rehbercard.css";

function Rehbercard({ contactUser }) {
    return (
        <button className="rehbercard-button">
            <div className="rehbercard">
                <div className="rehbercard-image-and-texts">
                    {contactUser.profilepic ? (
                        <img
                            src={contactUser.profilepic}
                            alt={contactUser.fullname}
                            className="rehbercard-image"
                        />
                    ) : (
                        <div className="rehbercard-placeholder" />
                    )}

                    <div className="rehbercard-texts">
                        <div className="rehbercard-name">{contactUser.fullname}</div>
                        <div className="rehbercard-department">{contactUser.department}</div>
                    </div>
                </div>
            </div>
        </button>
    );
}

export default Rehbercard;
