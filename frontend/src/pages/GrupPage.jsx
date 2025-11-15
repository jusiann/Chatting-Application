import "../style/GrupPage.css";
import Sidebar from "../components/SideBar";
import Searchbar from "../components/SearchBar";
import ContactCard from "../components/ContactCard";
import { ChevronDown } from "lucide-react";
import GroupCancelButton from "../components/GroupCancelButton";
import GroupApprovalButton from "../components/GroupApprovalButton";
import useConservationStore from "../store/Conservation";
import Rehbercard from "../components/RehberCard";
import { useState } from "react";
import GroupSelectedCard from "../components/GroupSelectedCard";
import useGroupStore from "../store/Group";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useSocketStore from "../store/Socket";

function Gruppage() {
  const { contactUsers } = useConservationStore();
  const { groupCreate } = useGroupStore();
  const navigate = useNavigate();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [inputName, setInputName] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const addMember = (member) => {
    if (selectedMembers.find((m) => m.id === member.id)) return; // Prevent duplicates
    setSelectedMembers((prev) => [...prev, member]);
  };
  const handleCreateGroup = async () => {
    const formData = {
      name: inputName,
      description: inputDescription,
      memberIds: selectedMembers.map((m) => m.id),
    };
    if (formData.name.trim() === "") {
      toast.error("Grup adı boş olamaz.");
      return;
    }
    if (formData.memberIds.length === 0) {
      toast.error("En az bir üye seçmelisiniz.");
      return;
    }
    const success = await groupCreate(formData);
    if (success) {
      navigate("/home");
    }
  };

  return (
    <div className="gruppage-container">
      <Sidebar />

      <div className="gruppage-content">
        <Searchbar placeholder="Kişilerde arama yap" />

        <div className="group-card">
          <div className="group-header">Grup üyelerini seçiniz</div>

          <div className="group-sortbar-row">
            <span className="group-sortbar-left">Sıralama</span>
            <span className="group-sortbar-right">
              Varsayılan
              <ChevronDown size={18} style={{ marginLeft: "5px" }} />
            </span>
          </div>

          <div className="group-person-list">
            {Array.isArray(contactUsers) &&
              contactUsers.map((contactUser) => (
                <Rehbercard
                  key={contactUser.id}
                  contactUser={contactUser}
                  onClick={() => addMember(contactUser)}
                />
              ))}
          </div>
        </div>
      </div>
      <div className="grouppage-right-panel-container">
        <div className="gruppage-right-panel">
          <div className="group-image-placeholder">
            <div className="group-image-circle">
              Grup
              <br />
              Simgesi Ekle
            </div>
          </div>

          <input
            type="text"
            className="group-name-input"
            placeholder="Grup adını giriniz"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <input
            type="text"
            className="group-description-input"
            placeholder="Grup açıklamasını giriniz"
            value={inputDescription}
            onChange={(e) => setInputDescription(e.target.value)}
          />

          <div className="selected-members-title">Seçili üyeler</div>

          <div className="selected-members-list">
            {Array.isArray(selectedMembers) &&
              selectedMembers.map((contactUser) => (
                <GroupSelectedCard
                  key={contactUser.id}
                  contactUser={contactUser}
                  onClick={() =>
                    setSelectedMembers((prev) =>
                      prev.filter((m) => m.id !== contactUser.id)
                    )
                  }
                />
              ))}
          </div>

          <div className="group-action-buttons">
            <GroupCancelButton />
            <GroupApprovalButton
              text={"Grubu oluştur"}
              onClick={handleCreateGroup}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gruppage;
