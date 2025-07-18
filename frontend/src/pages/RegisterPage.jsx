import { GraduationCap, Lock, User } from "lucide-react";
import LoginButton from "../components/loginButton";
import Textinput from "../components/Textinput";
import "../style/RegisterPage.css";

const Register = () => {
    return (
        <div className="register-page">
            <div className="register-left-container">
                <h1 className="welcome-title">Rumeli Üniversitesi İletişim Uygulaması</h1>
                <p className="welcome-subtitle">Kurumsal email bilgileriniz ile giriş yapınız</p>
            </div>
            <div className="register-right-container">
                <img src="src/assets/Logo1.png" alt="Logo" className="register-logo" />
                <div className="register-texts">
                    <h1 className="register-title">Hesap oluştur</h1>
                    <p className="register-description">Lütfen bilgilerinizi giriniz</p>
                </div>
                <form className="register-form">
                    <div className="name-surname-container">
                        <Textinput type="text" placeholder="Adınız" className="register-input name-input" width="190px" icon={User}/>
                        <Textinput type="text" placeholder="Soyadınız" className="register-input surname-input" width="190px" icon={User}/>
                    </div>
                    <Textinput type="text" placeholder="Ünvanınız örn: Prof. Dr." className="register-input" icon={GraduationCap}/>
                    <Textinput type="text" placeholder="Bölüm adı örn: Bilgisayar Mühendisliği" className="register-input" icon={GraduationCap}/>
                    <Textinput type="email" placeholder="E-posta adresiniz" className="register-input" />
                    <Textinput type="password" placeholder="Şifreniz" className="register-input" icon={Lock}/>
                    <Textinput type="password" placeholder="Şifreniz tekrar" className="register-input" icon={Lock}/>
                    <LoginButton type="submit" className="register-button" text="Kayıt Ol" />
                    <p className="register-login-link">Zaten bir hesabınız var mı? <a href="/login">Giriş yap</a></p>
                </form>

            </div>
        </div>
    )
}

export default Register; 