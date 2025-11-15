import { GraduationCap, Lock, User } from "lucide-react";
import LoginButton from "../components/LoginButton";
import Textinput from "../components/TextInput";
import "../style/RegisterPage.css";
import { useState } from "react";
import toast from "react-hot-toast";
import { signUp } from "../api/Auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo1.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    title: "",
    department: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { name, surname, email, password, confirmPassword } = formData;

    if (!name.trim() || !surname.trim()) return "Ad ve Soyad boş bırakılamaz.";

    if (!email.endsWith("@stu.rumeli.edu.tr"))
      return "Lütfen kurumsal e-posta (@stu.rumeli.edu.tr) girin.";

    if (password.includes(" ")) return "Şifre boşluk içeremez.";

    if (password !== confirmPassword) return "Şifreler eşleşmiyor.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    try {
      const payload = {
        first_name: formData.name,
        last_name: formData.surname,
        email: formData.email,
        password: formData.password,
        title: formData.title,
        department: formData.department,
      };
      const res = await signUp(payload);
      toast.success(res.message || "Kayıt başarılı!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Kayıt başarısız.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-left-container">
        <h1 className="welcome-title">
          Rumeli Üniversitesi İletişim Uygulaması
        </h1>
        <p className="welcome-subtitle">
          Kurumsal email bilgileriniz ile giriş yapınız
        </p>
      </div>
      <div className="register-right-container">
        <img src={logo} alt="Logo" className="register-logo" />
        <div className="register-texts">
          <h1 className="register-title">Hesap oluştur</h1>
          <p className="register-description">Lütfen bilgilerinizi giriniz</p>
        </div>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="name-surname-container">
            <Textinput
              type="text"
              placeholder="Adınız"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="register-input name-input"
              width="190px"
              icon={User}
            />
            <Textinput
              type="text"
              placeholder="Soyadınız"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className="register-input surname-input"
              width="190px"
              icon={User}
            />
          </div>
          <Textinput
            type="text"
            placeholder="Ünvanınız örn: Prof. Dr."
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="register-input"
            icon={GraduationCap}
          />
          <Textinput
            type="text"
            placeholder="Bölüm adı örn: Bilgisayar Mühendisliği"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="register-input"
            icon={GraduationCap}
          />
          <Textinput
            type="email"
            placeholder="E-posta adresiniz"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="register-input"
          />
          <Textinput
            type="password"
            placeholder="Şifreniz"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="register-input"
            icon={Lock}
          />
          <Textinput
            type="password"
            placeholder="Şifreniz tekrar"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="register-input"
            icon={Lock}
          />
          <LoginButton
            type="submit"
            className="register-button"
            text="Kayıt Ol"
          />
          <p className="register-login-link">
            Zaten bir hesabınız var mı? <a href="/login">Giriş yap</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
