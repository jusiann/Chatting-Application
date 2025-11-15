import { Mail, Lock, User } from "lucide-react";
import "../style/KayıtOl.css";
import LoginButton from "../components/LoginButton";
import Textinput from "../components/TextInput";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/User";
import logo from "../assets/Logo1.png";

const KayıtOl = () => {
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

  const signUp = useUserStore((state) => state.signUp);

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
    <div className="register-container">
      {/* Sol Panel */}
      <div className="register-left">
        <h1 className="left-title">Rumeli Üniversitesi İletişim Uygulaması</h1>
        <p className="left-subtitle">Kayıt ol</p>
      </div>

      {/* Sağ Panel */}
      <div className="register-right">
        <img src={logo} alt="Logo" className="register-logo" />
        <div className="right-texts">
          <h1 className="welcome-title">Hoşgeldiniz</h1>
          <p className="welcome-subtitle">Lütfen bilgilerinizi giriniz</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="name-surname">
            <Textinput
              icon={User}
              placeholder="Adınız"
              name="name"
              value={formData.name}
              onChange={handleChange}
              width="183px"
            />
            <Textinput
              icon={User}
              placeholder="Soyadınız"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              width="183px"
            />
          </div>

          <Textinput
            icon={Mail}
            placeholder="Email adresinizi giriniz"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <select
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="register-select"
          >
            <option value="">Ünvanınızı seçiniz</option>
            <option value="Prof. Dr.">Prof. Dr.</option>
            <option value="Dr. Öğretim Üyesi">Dr. Öğretim Üyesi</option>
            <option value="Araştırma Görevlisi">Araştırma Görevlisi</option>
          </select>

          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="register-select"
          >
            <option value="">Bölümünüzü seçiniz</option>
            <option value="Bilgisayar Mühendisliği">
              Bilgisayar Mühendisliği
            </option>
            <option value="Endüstri Mühendisliği">Endüstri Mühendisliği</option>
            <option value="İnşaat Mühendisliği">İnşaat Mühendisliği</option>
          </select>

          <Textinput
            icon={Lock}
            placeholder="Şifrenizi giriniz"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <Textinput
            icon={Lock}
            placeholder="Şifrenizi tekrar giriniz"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <LoginButton
            type="submit"
            className="register-button"
            text="Kayıt ol"
          />

          <p className="register-login-link">
            Zaten hesabın var mı? <a href="/login">Giriş yap</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default KayıtOl;
