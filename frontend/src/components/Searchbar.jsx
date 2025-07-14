import "../style/searchbar.css";
import logo from "../assets/logo1.png";
import { Search } from "lucide-react";

const SearchBar = () => {
    return (
        <div className="searchbar">
            <img src={logo} alt="Rumeli Logo" className="logo" />
            <div className="input-area">
                <Search className="icon" />
                <input type="text" placeholder="Arama yap" />
            </div>
        </div>
    );
};

export default SearchBar;
