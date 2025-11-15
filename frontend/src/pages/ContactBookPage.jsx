import "../style/ContactBookPage.css";
import SideBar from "../components/SideBar";
import SearchBar from "../components/SearchBar";
import CreateGroupButton from "../components/CreateGroupButton";
import SortBar from "../components/SortBar";
import ContactBookCard from "../components/ContactBookCard";
import { Building } from "lucide-react";
import useConservationStore from "../store/Conservation";
import { useEffect } from "react";
import { messageWithUser } from "../controllers/RehberPageController";
import { useNavigate } from "react-router-dom";

function ContactBookPage() {
  const { contactUsers, contactUsersFetch } = useConservationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (contactUsers.length === 0) {
      contactUsersFetch();
    }
  }, []);

  return (
    <div className="rehber-container">
      <SideBar />

      <div className="rehber-content">
        <SearchBar />

        <div className="rehber-card">
          <div className="button-row">
            <CreateGroupButton text="Grup Oluştur" />
            <CreateGroupButton
              text="Departman Mesajı"
              logo={Building}
              onClick="/departman"
            />
            <div className="divider" />
          </div>

          <SortBar />

          <div className="person-list">
            {Array.isArray(contactUsers) &&
              contactUsers.map((contactUser) => (
                <ContactBookCard
                  key={contactUser.id}
                  contactUser={contactUser}
                  onClick={() => messageWithUser(contactUser.id, navigate)}
                />
              ))}
          </div>
        </div>
      </div>

      <div className="rehber-right-panel">REHBER</div>
    </div>
  );
}

export default ContactBookPage;
