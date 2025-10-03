import { Lock, User } from "lucide-react";
import Textinput from "../components/Textinput";
import LoginButton from "../components/loginButton";
import { useState } from "react";
import useUserStore from "../store/user";
import { useNavigate } from "react-router-dom";
import "../style/login.css";
import logo from "../assets/Logo1.png";

const Login = () => {
    const navigate = useNavigate();
    const login = useUserStore((state) => state.login);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(formData.email, formData.password);
        if (success) {
            navigate("/home");
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Sol Panel */}
                <div className="login-left">
                    <h1 className="left-title">Rumeli Üniversitesi İletişim Uygulaması</h1>
                    <p className="left-subtitle">Giriş yap</p>
                </div>

                {/* Sağ Panel */}
                <div className="login-right">
                    <div className="login-content">
                        <img src={logo} alt="Logo" className="login-logo" />
                        <div className="right-texts">
                            <h1 className="welcome-title">Hoşgeldiniz</h1>
                            <p className="welcome-subtitle">Lütfen giriş bilgilerinizi giriniz</p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            <Textinput
                                type="email"
                                placeholder="E-posta adresiniz"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                icon={User}
                                required
                            />
                            <Textinput
                                type="password"
                                placeholder="Şifreniz"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                icon={Lock}
                                required
                            />
                            <LoginButton type="submit" className="login-button" text="Giriş Yap" />
                        </form>

                        <p className="login-register-link">
                            Hesabınız yok mu? <a href="/register" onClick={(e) => {
                                e.preventDefault();
                                navigate("/register");
                            }}>Kayıt Ol</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 
