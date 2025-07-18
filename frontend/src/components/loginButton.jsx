import "../style/loginButton.css";
const LoginButton = ({ onClick, text = "Giriş yap" , type = "button"}) => {
    return (
        <button className="loginButton" onClick={onClick} type={type}>
            <span>{text}</span>
        </button>
    );
};

export default LoginButton;