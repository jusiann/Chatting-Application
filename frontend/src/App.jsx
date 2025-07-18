
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RehberPage from "./pages/RehberPage";
import GrupPage from "./pages/GrupPage"
import AnaekranPage from "./pages/AnaekranPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Textinput from './components/Textinput';
import { User } from 'lucide-react';
import DepartmanPage from './pages/DepartmanPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<AnaekranPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rehber" element={<RehberPage />} />
        <Route path="/grup" element={<GrupPage />} />
        <Route path="/departman" element={<DepartmanPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
