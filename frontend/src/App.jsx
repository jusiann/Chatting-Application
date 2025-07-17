
import './App.css'
import Textinput from './components/Textinput'
import Searchbar from './components/Searchbar'
import SettingCard from './components/Settingcard'
import Sendbox from './components/Sendbox'
import Settinguser from './components/Settinguser'
import MessageTopBar from './components/Messagetopbar'
import Personcard from './components/Personcard'
import MessageSended from './components/Messagesended'
import MessageReceived from './components/Messagereceived'
import GroupApprovalButton from './components/groupApprovalButton'
import ContactCard from './components/contactCard'
import CreateDepartmentButton from './components/createDepartmentButton'
import CreateGroupButton from './components/createGroupButton'
import DepartmentButton from './components/departmentButton'
import GroupCancelButton from './components/groupCancelButton'
import LoginButton from './components/loginButton'
import RememberMe from './components/rememberMe'
import SearchBar from './components/Searchbar'
import Sidebar from './components/Sidebar'
import SortBar from './components/sortBar'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RehberPage from "./pages/RehberPage";
import GrupPage from "./pages/GrupPage"
import AnaekranPage from "./pages/AnaekranPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnaekranPage />} />
        <Route path="/rehber" element={<RehberPage />} />
        <Route path="/grup" element={<GrupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
