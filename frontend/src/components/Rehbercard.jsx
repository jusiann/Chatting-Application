import "../style/rehbercard.css";

function Rehbercard({ contactUser, onClick }) {
    return (
        <button className="rehbercard-button" onClick={onClick}>
            <div className="rehbercard">
                <div className="rehbercard-image-and-texts">
                    {contactUser.profile_pic ? (
                        <img
                            src={contactUser.profile_pic}
                            alt={`${contactUser.first_name} ${contactUser.last_name}`}
                            className="rehbercard-image"
                        />
                    ) : (
                        <div className="rehbercard-placeholder" />
                    )}

                    <div className="rehbercard-texts">
                        <div className="rehbercard-name">
                            {contactUser.first_name} {contactUser.last_name}
                        </div>
                        <div className="rehbercard-department">{contactUser.department}</div>
                    </div>
                </div>
            </div>
        </button>
    );
}

export default Rehbercard;
