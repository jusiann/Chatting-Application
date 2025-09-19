import "../style/rehberpage.css";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import CreateGroupButton from "../components/createGroupButton";
import CreateDepartmentButton from "../components/createDepartmentButton";
import SortBar from "../components/sortBar";
import Rehbercard from "../components/Rehbercard";
import { Building } from "lucide-react";
import useConservationStore from "../store/conservation";
import { useEffect } from "react";
import { messageWithUser } from "../controllers/RehberPageController";
import { useNavigate } from "react-router-dom";

function RehberPage() {
  const { contactUsers, contactUsersFetch } = useConservationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (contactUsers.length === 0) {
      contactUsersFetch();
    }
  }, []);

  return (
    <div className="rehber-container">
      <Sidebar />

      <div className="rehber-content">
        <Searchbar />

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
                <Rehbercard
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

export default RehberPage;
