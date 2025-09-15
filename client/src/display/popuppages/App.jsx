import React from "react";
import ExtractedDataDisplay from "./ExtractedDataDisplay.jsx";
import "./App.css";

export default function App({ data, onClose, onGenerateCoverLetter, onChangeDataClick, onSaveButton, notification }) {
  return (
    <div id="react-extension-popup">
      <ExtractedDataDisplay data={data} />

      <div id="react-button-footer">   
        <button onClick={onGenerateCoverLetter}>Cover Letter</button>
        <button onClick={onSaveButton}>Save as Applied</button>
        <button onClick={onChangeDataClick}>Update Resume/Key</button>
        <button onClick={onClose}>Close</button>
      </div>

      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: notification.type === "success" ? "#4CAF50" : "#F44336",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
            zIndex: 9999,
          }}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
