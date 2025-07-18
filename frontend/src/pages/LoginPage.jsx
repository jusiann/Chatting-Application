import "../style/LoginPage.css";
import { LockKeyhole, Mail } from "lucide-react";
import LoginButton from "../components/loginButton";
import Textinput from "../components/Textinput";
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    return (
        <div className="login-container">
            <div className="login-left-panel">
                <img src="src/assets/Logo1.png" alt="Logo" className="logo" />
                <div className="login-texts">
                    <h1 className="login-title">Hoşgeldiniz</h1>
                    <p className="login-subtitle">Lütfen bilgileriniz giriniz</p>
                </div>
                <form className="login-form" onSubmit={(e) => {
                    e.preventDefault();
                    navigate("/home");
                }}>
                    <div className="login-inputs">
                        <Textinput icon={Mail} />
                        <Textinput icon={LockKeyhole} type="password" placeholder="Şifre"/>
                    </div>
                    <LoginButton type="submit"/>
                </form>
                <p>Hesabın yok mu ? <a href="/register" className="register-link">Kayıt ol</a></p>
            </div>
            <div className="login-right-panel">
                <h1 className="welcome-title">Rumeli Üniversitesi İletişim Uygulaması</h1>
                <p className="welcome-subtitle">Kurumsal email bilgileriniz ile giriş yapınız</p>
            </div>
        </div>
    );
};

export default LoginPage;