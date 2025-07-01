import "../style/textinput.css";
import { Mail } from "lucide-react";

const Textinput = () => {
    return (
        <div className="textinput">
            <Mail className="icon" />
            <input type="email" placeholder="Email adresinizi giriniz" />
        </div>
    );
};

export default Textinput;
