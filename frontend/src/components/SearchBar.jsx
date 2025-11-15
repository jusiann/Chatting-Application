import "../style/SearchBar.css";
import logo from "../assets/Logo1.png";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="searchbar">
      <img src={logo} alt="Rumeli Logo" className="searchLogo" />
      <div className="input-area">
        <Search className="icon" />
        <input type="text" placeholder="Arama yap" />
      </div>
    </div>
  );
};

export default SearchBar;
