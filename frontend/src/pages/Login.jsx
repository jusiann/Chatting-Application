import { Lock, User } from "lucide-react";
import Textinput from "../components/TextInput";
import LoginButton from "../components/LoginButton";
import { useState } from "react";
import useUserStore from "../store/User";
import { useNavigate } from "react-router-dom";

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
        </div>
    );
};

export default Login; 
