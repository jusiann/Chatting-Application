import "../style/textinput.css";
import { Mail } from "lucide-react";

const Textinput = ({icon: Icon = Mail, placeholder = "Email adresinizi giriniz", type = "text", width = "400px"}) => {
    return (
        <div className="textinput" style={{ width }}>
            <Icon className="icon" />
            <input type={type} placeholder={placeholder} />
        </div>
    );
};

export default Textinput;
