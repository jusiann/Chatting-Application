import "../style/TextInput.css";
import { Mail } from "lucide-react";

const TextInput = ({ icon: Icon = Mail, placeholder = "Email adresinizi giriniz", type = "text", width, name, value, onChange, required }) => {
    return (
        <div className="textinput" style={width ? { width } : {}}>
            {Icon && <Icon className="icon" />}
            <input
                type={type}
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
};

export default TextInput;
