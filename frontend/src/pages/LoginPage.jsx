import "../style/LoginPage.css";
import { LockKeyhole, Mail } from "lucide-react";
import LoginButton from "../components/loginButton";
import Textinput from "../components/Textinput";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useUserStore from "../store/user";
import useConservationStore from "../store/conservation";
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
    <div className="login-container">
      <div className="login-left-panel">
        <img src={logo} alt="Logo" className="logo" />
        <div className="login-texts">
          <h1 className="login-title">Hoşgeldiniz</h1>
          <p className="login-subtitle">Lütfen bilgileriniz giriniz</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-inputs">
            <Textinput
              type="email"
              placeholder="E-posta adresiniz"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />
            <Textinput
              type="password"
              placeholder="Şifre"
              name="password"
              value={formData.password}
              onChange={handleChange}
              icon={LockKeyhole}
              required
            />
          </div>
          <LoginButton type="submit" />
        </form>
        <p>
          Hesabın yok mu ?{" "}
          <a href="/register" className="register-link">
            Kayıt ol
          </a>
        </p>
      </div>
      <div className="login-right-panel">
        <h1 className="welcome-title">
          Rumeli Üniversitesi İletişim Uygulaması
        </h1>
        <p className="welcome-subtitle">
          Kurumsal email bilgileriniz ile giriş yapınız
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
