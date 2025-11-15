import "../style/SortBar.css";
import { ChevronDown } from "lucide-react";

const SortBar = () => {
    return (
        <div className="sortBar">
            <span className="sortBar-text">Sıralama</span>
            <div className="default-area">
                <span className="default-text">Varsayılan</span>
                <ChevronDown className="option-icon" />
            </div>
        </div>
    );
};

export default SortBar;