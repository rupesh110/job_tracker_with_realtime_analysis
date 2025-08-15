import React, { useEffect } from "react";
import ExtractedDataDisplay from "./ExtractedDataDisplay.jsx"
import "./App.css"

export default function App({ data, onClose, onChangeDataClick, onSaveButton}) {

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest("#react-extension-popup")) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  console.log("data1234A:",data)

  return (
    <div id="react-extension-popup">
      <ExtractedDataDisplay data={data}/>
      <div id="react-button-footer">
        <button onClick={onSaveButton}>Save Data</button>
        <button onClick={onChangeDataClick}>Change Datas</button>
        <button onClick={onClose}>Closeaa</button>
      </div>
     
    </div>
  );
}
