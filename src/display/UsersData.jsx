import React, { useEffect } from "react";
import "./App.css"

export default function UsersData({onClose }) {

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest("#react-extension-popup")) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div id="react-extension-popup">
      <button onClick={onClose} aria-label="Close popup">✖</button>
      <h4>Test Screen are you</h4>
    
    </div>
  );
}
