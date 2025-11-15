import "../style/ContactBookCard.css";

function ContactBookCard({ contactUser, onClick }) {
    return (
        <button className="rehbercard-button" onClick={onClick}>
            <div className="rehbercard">
                <div className="rehbercard-image-and-texts">
                    {contactUser.profile_pic ? (
                        <img
                            src={contactUser.profile_pic}
                            alt="Profil Fotoğrafı"
                            style={{ width: 40, height: 40, borderRadius: '50%' }}
                        />
                        ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="gray">
                            <circle cx="12" cy="8" r="4" />
                            <rect x="4" y="16" width="16" height="6" rx="3" />
                        </svg>
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

export default ContactBookCard;
