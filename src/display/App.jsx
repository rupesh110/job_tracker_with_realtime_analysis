import React, { useEffect } from "react";
import "./App.css"


export default function App({ data, onClose }) {

  if(data){
    console.log("App received it", data)
  }
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
      <h4>Extension Result</h4>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
