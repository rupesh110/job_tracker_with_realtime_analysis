import React, { useState } from "react";
import MainContent from "../floatingpages/MainContent";
import "./FloatingMain.css";

export default function FloatingMain({ onSeeAll }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMain = () => setIsOpen(prev => !prev);

  return (
    <div className="floating-main">
      <button onClick={toggleMain} className="floating-toggle-btn">
        {isOpen ? "×" : "M"}
      </button>

      {isOpen && (
        <div className="floating-main-content">
          <MainContent onSeeAll={onSeeAll} />
        </div>
      )}
    </div>
  );
}
