import React, { useState } from "react";
import MainContent from "../floatingpages/MainContent";
import "./FloatingMain.css";
import icon48 from "../../../public/icons/icon48.webp"


export default function FloatingMain({ onSeeAll }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMain = () => setIsOpen(prev => !prev);

  return (
    <div className="floating-main">
    <button className={`floating-toggle-btn ${isOpen ? "open" : ""}`} onClick={toggleMain}>
      {isOpen ? <span>×</span> : <img src={icon48} alt="icon" className="floating-toggle-icon" />}
    </button>


      {isOpen && (
        <div className="floating-main-content">
          <MainContent onSeeAll={onSeeAll} />
        </div>
      )}
    </div>
  );
}
