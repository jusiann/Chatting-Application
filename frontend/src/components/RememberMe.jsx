import "../style/RememberMe.css";

const RememberMe = () => {
    return (
        <div className="rememberMe">
            <span className="rememberMe-text">Beni hatırla</span>
            <div className="rememberMe-checkbox"></div>
            <span className="rememberMe-forgot">Şifreni mi unuttun?</span>
        </div>
    );
};

export default RememberMe;