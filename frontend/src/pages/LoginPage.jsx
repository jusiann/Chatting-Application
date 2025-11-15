import "../style/LoginPage.css";
import { LockKeyhole, Mail } from "lucide-react";
import LoginButton from "../components/LoginButton";
import TextInput from "../components/TextInput";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useUserStore from "../store/User";
import useConservationStore from "../store/Conservation";
import logo from "../assets/Logo1.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);
  const { contactUsersFetch } = useConservationStore();

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
      await contactUsersFetch();
      navigate("/home");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left-container">
        <h1 className="welcome-title">
          Rumeli Üniversitesi İletişim Uygulaması
        </h1>
        <p className="welcome-subtitle">
          Kurumsal email bilgileriniz ile giriş yapınız
        </p>
      </div>
      <div className="login-right-container">
        <img src={logo} alt="Logo" className="login-logo" />
        <div className="login-texts">
          <h1 className="login-title">Hoşgeldiniz</h1>
          <p className="login-description">Lütfen bilgilerinizi giriniz</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <TextInput
            type="email"
            placeholder="E-posta adresiniz"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="login-input"
            icon={Mail}
            required
          />
          <TextInput
            type="password"
            placeholder="Şifre"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="login-input"
            icon={LockKeyhole}
            required
          />
          <LoginButton
            type="submit"
            className="login-button"
            text="Giriş Yap"
          />
          <p className="login-register-link">
            Hesabın yok mu? <a href="/register">Kayıt ol</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;