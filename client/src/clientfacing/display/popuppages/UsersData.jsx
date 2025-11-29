import React, { useState } from "react";
import { setUserData } from "../../Feeder/UsersDataFeeder.js";
import { extractTextFromPDF } from "./helper.js";
import "./UsersData.css";

export default function UsersData({ onClose, onDataSaved }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [existingResumeName, setExistingResumeName] = useState("");
  const [isResumeRequired, setIsResumeRequired] = useState(true);
  const [isApiKeyRequired, setIsApiKeyRequired] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Handle resume upload
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setExistingResumeName(file.name);
      setIsResumeRequired(false);
    }
  };

  // Handle API key input
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
    setIsApiKeyRequired(!e.target.value.trim());
  };

  // Save user data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (isResumeRequired && !resumeFile) {
      alert("Please upload your resume.");
      return;
    }
    if (isApiKeyRequired && !apiKey.trim()) {
      alert("Please enter your Google API key.");
      return;
    }

    setLoading(true);

    try {
      let extractedText = null;

      // Extract text from PDF (if uploaded)
      if (resumeFile && resumeFile.type === "application/pdf") {
        try {
          extractedText = await extractTextFromPDF(resumeFile);
          if (!extractedText) throw new Error("No text extracted from resume");
        } catch (err) {
          console.error("PDF extraction failed:", err);
          alert("Failed to extract text from PDF.");
        }
      }

      // Prepare payload for storage
      const newData = {
        resume:{
          name: existingResumeName || resumeFile?.name || "",
          text: extractedText,
        },
        geminiApiKey: apiKey,
      };

      await setUserData(newData);
      alert("User data saved successfully!");
      onDataSaved?.(); // Tell PopupController to reload
      onClose();
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Failed to save user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="react-extension-popup" className="popup-container">
      <button className="close-btn" onClick={onClose} aria-label="Close popup">
        ✖
      </button>

      <h2 className="popup-title">Upload Resume & API Key</h2>

      <form onSubmit={handleSubmit} className="form-wrapper">
        {/* Resume Upload */}
        <div className="form-group">
          <label htmlFor="resume">Resume (PDF):</label>
          <input
            type="file"
            id="resume"
            accept=".pdf"
            onChange={handleResumeChange}
            disabled={loading}
          />
          {existingResumeName && (
            <p className="resume-name">📄 {existingResumeName}</p>
          )}
        </div>

        {/* API Key Input */}
        <div className="form-group">
          <label htmlFor="apikey">Google Gemini API Key:</label>
          
          {showInstructions && (
            <div style={{
              background: "#f0f8ff",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "10px",
              fontSize: "14px",
              border: "1px solid #4a90e2"
            }}>
              <p style={{margin: "0 0 12px 0", fontWeight: "bold", fontSize: "15px"}}>📝 Step-by-Step Guide:</p>
              <ol style={{margin: 0, paddingLeft: "20px", lineHeight: "1.8"}}>
                <li>Click <strong>"🔑 Get API Key"</strong> button below</li>
                <li>Sign in with your Google account</li>
                <li>
                  <strong>If you see "No projects":</strong>
                  <ul style={{marginTop: "4px", paddingLeft: "20px"}}>
                    <li>Click <strong>"Create a Google Cloud project"</strong></li>
                    <li>Accept the terms and click <strong>"Continue"</strong></li>
                  </ul>
                </li>
                <li>Click <strong>"Create API Key"</strong> (blue button)</li>
                <li>Copy the key that appears</li>
                <li>Paste it in the field below</li>
              </ol>
              <div style={{
                marginTop: "12px",
                padding: "10px",
                background: "#e8f5e9",
                borderRadius: "6px",
                fontSize: "13px"
              }}>
                <p style={{margin: 0, fontWeight: "bold", color: "#2e7d32"}}>✨ 100% Free!</p>
                <p style={{margin: "4px 0 0 0", color: "#555"}}>
                  • No credit card required<br/>
                  • 1,500 requests per day<br/>
                  • Takes less than 2 minutes
                </p>
              </div>
            </div>
          )}

          <input
            type="text"
            id="apikey"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Paste your API key here"
            disabled={loading}
            style={{fontFamily: "monospace"}}
          />
          
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {showInstructions ? "Hide" : "Show"} Instructions
          </button>
        </div>

        {/* Buttons */}
        <div className="form-buttons">
          <button
            type="button"
            onClick={() =>
              window.open("https://aistudio.google.com/app/apikey", "_blank")
            }
            disabled={loading}
            style={{
              background: "#4285f4",
              color: "white",
              fontWeight: "bold"
            }}
          >
            🔑 Get API Key
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "💾 Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
