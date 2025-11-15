import { XCircle } from "lucide-react";
import "../style/GroupSelectedCard.css";

function GroupSelectedCard({ contactUser, onClick }) {
    return (
        <button className="group-selected-card-button">
            <div className="group-selected-card">
                <div className="group-selected-card-image-and-texts">
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

                    <div className="group-selected-card-texts">
                        <div className="group-selected-card-name">
                            {contactUser.first_name} {contactUser.last_name}
                        </div>
                        <div className="group-selected-card-department">{contactUser.department}</div>
                    </div>
                    <div className="group-selected-card-spacer" />
                    <button className="group-selected-card-remove" onClick={onClick}>
                        <XCircle />
                    </button>
                </div>
            </div>
        </button>
    );
}

export default GroupSelectedCard;
