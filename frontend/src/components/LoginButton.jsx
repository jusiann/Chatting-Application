import "../style/LoginButton.css";
import useUserStore from "../store/User";
import { LoaderCircle } from "lucide-react";
const LoginButton = ({ onClick, text = "Giriş yap", type = "button" }) => {
  const { loggingIn } = useUserStore.getState();
  return (
    <button
      className="loginButton"
      onClick={onClick}
      type={type}
      disabled={loggingIn}
    >
      {loggingIn ? (
        <LoaderCircle size={30} className="spinner" />
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
};

export default LoginButton;
