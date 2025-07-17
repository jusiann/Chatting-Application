import React from "react";
import "../style/LoginPage.css";
import loginButton from "../components/loginButton";
import rememberMe from "../components/rememberMe";
import { LockKeyhole, Mail } from "lucide-react";

const LoginPage = () => {
    return (
        <div className="login-container">
            <div className="login-left-panel">
                <img src="Logo1.png" alt="Logo" className="login-logo" />
                <div className="login-welcome">Hoşgeldiniz</div>
                <div className="login-instruction">Lütfen bilgilerinizi giriniz</div>
                <div className="login-input-section">
                    <div className="login-email-field">
                        <Mail />
                        <input type="email" placeholder="Email adresinizi giriniz" className="login-input" />
                    </div>
                    <div className="login-password-field">
                        <LockKeyhole />
                        <input type="password" placeholder="Şifrenizi giriniz" className="login-input" />
                    </div>
                    <div className="login-remember-forgot">
                        <rememberMe text="Beni hatırla" />
                        <a href="#" className="login-forgot">Şifreni mi unuttun?</a>
                    </div>
                    <loginButton text="Giriş yap" onClick={() => alert("Giriş yapılıyor...")} />
                </div>
                <div className="login-signup">Hesabın yok mu? Kayıt ol</div>
            </div>
            <div className="login-right-panel">
                <div className="login-right-text">
                    <div className="login-right-title">Rumeli Üniversitesi İletişim Uygulaması</div>
                    <div className="login-right-subtitle">Kurumsal email bilgileriniz ile giriş yapınız</div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;