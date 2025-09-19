import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RehberPage from "./pages/RehberPage";
import GrupPage from "./pages/GrupPage";
import AnaekranPage from "./pages/AnaekranPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Textinput from "./components/Textinput";
import { User } from "lucide-react";
import DepartmanPage from "./pages/DepartmanPage";
import SettingsPage from "./pages/SettingsPage";
import KayıtOl from "./pages/KayıtOl";
import useUserStore from "./store/user.js";
import { useEffect } from "react";
import useConservationStore from "./store/conservation.js";

function App() {
  const { checkAuth, user } = useUserStore();
  const { contactUsersFetch } = useConservationStore();
  useEffect(async () => {
    await checkAuth();
    if (user != null) await contactUsersFetch();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<AnaekranPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<KayıtOl />} />
        <Route path="/rehber" element={<RehberPage />} />
        <Route path="/grup" element={<GrupPage />} />
        <Route path="/departman" element={<DepartmanPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
