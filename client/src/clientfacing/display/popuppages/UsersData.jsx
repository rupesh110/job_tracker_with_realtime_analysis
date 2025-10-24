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

  // 📄 Handle resume upload
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setExistingResumeName(file.name);
      setIsResumeRequired(false);
    }
  };

  // 🔑 Handle API key input
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
    setIsApiKeyRequired(!e.target.value.trim());
  };

  // 💾 Save user data
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

      // 🔍 Extract text from PDF (if uploaded)
      if (resumeFile && resumeFile.type === "application/pdf") {
        try {
          extractedText = await extractTextFromPDF(resumeFile);
          if (!extractedText) throw new Error("No text extracted from resume");
        } catch (err) {
          console.error("PDF extraction failed:", err);
          alert("Failed to extract text from PDF.");
        }
      }

      // 🧠 Prepare payload for storage
      const newData = {
        resume:{
          name: existingResumeName || resumeFile?.name || "",
          text: extractedText,
        },
        geminiApiKey: apiKey,
      };

      await setUserData(newData);
      alert("User data saved successfully!");
      onDataSaved?.(); // 🔄 Tell PopupController to reload
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
          <label htmlFor="apikey">Google API Key:</label>
          <input
            type="text"
            id="apikey"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your Google API key"
            disabled={loading}
          />
        </div>

        {/* Buttons */}
        <div className="form-buttons">
          <button
            type="button"
            onClick={() =>
              window.open("https://aistudio.google.com/app/apikey", "_blank")
            }
            disabled={loading}
          >
            Get New KEY
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
