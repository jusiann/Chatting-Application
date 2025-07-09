import "../style/textinput.css";
import { Mail } from "lucide-react";

const Textinput = ({icon: Icon = Mail}) => {
    return (
        <div className="textinput">
            <Icon className="icon" />
            <input type="email" placeholder="Email adresinizi giriniz" />
        </div>
    );
};

export default Textinput;
