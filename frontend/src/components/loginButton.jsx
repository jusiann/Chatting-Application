import "../style/loginButton.css";
import { LockKeyhole } from "lucide-react";
const LoginButton = ({ onClick }) => {
    return (
        <button className="loginButton" onClick={onClick}>
            <span>Giriş yap</span>
            <LockKeyhole />
        </button>
    );
};

export default LoginButton;