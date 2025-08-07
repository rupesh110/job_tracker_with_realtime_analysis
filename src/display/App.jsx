import React, { useEffect } from "react";
import ExtractedDataDisplay from "./ExtractedDataDisplay.jsx"
import "./App.css"

export default function App({ data, onClose, onChangeDataClick}) {

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
      <ExtractedDataDisplay data={data}/>
      <div id="react-button-footer">
        
        <button onClick={onChangeDataClick}>Change Data</button>
        <button onClick={onClose}>Close</button>
      </div>
     
    </div>
  );
}
