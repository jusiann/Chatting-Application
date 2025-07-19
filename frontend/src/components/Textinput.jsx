import "../style/textinput.css";
import { Mail } from "lucide-react";

const Textinput = ({icon: Icon = Mail, placeholder = "Email adresinizi giriniz", type = "text", width = "400px", value, onChange}) => {
    return (
        <div className="textinput" style={{ width }}>
            <Icon className="icon" />
            <input type={type} placeholder={placeholder} value={value} onChange={onChange} />
        </div>
    );
};

export default Textinput;
