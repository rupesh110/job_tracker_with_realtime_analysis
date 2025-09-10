import React, { useState, useEffect } from "react";
import { getUserData, setUserData } from "../../Feeder/UsersDataFeeder.js";
import { extractTextFromPDF } from "./helper.js";
import "./UsersData.css";

export default function UsersData({ onClose }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [existingResumeName, setExistingResumeName] = useState("");
  const [isResumeRequired, setIsResumeRequired] = useState(true);
  const [isApiKeyRequired, setIsApiKeyRequired] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const savedData = await getUserData();
      if (savedData?.IsResume && savedData?.resumeName) {
        setIsResumeRequired(false);
        setExistingResumeName(savedData.resumeName);

        // Convert base64 back to File object for local display if needed
        const blob = await (await fetch(savedData.resume)).blob();
        const file = new File([blob], savedData.resumeName, { type: blob.type });
        setResumeFile(file);
      }
      if (savedData?.IsAPIKey && savedData?.GeminiAPIKey) {
        setIsApiKeyRequired(false);
        setApiKey(savedData.GeminiAPIKey);
      }
    }
    fetchData();
  }, []);

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setExistingResumeName(file.name);
    }
  };

  const handleApiKeyChange = (e) => setApiKey(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isResumeRequired && !resumeFile) {
      alert("Please upload your resume.");
      return;
    }

    if (isApiKeyRequired && !apiKey.trim()) {
      alert("Please enter your Google API key.");
      return;
    }

    let extractedText = null;

    if (resumeFile && resumeFile.type === "application/pdf") {
      try {
        extractedText = await extractTextFromPDF(resumeFile);
        if (!extractedText) throw new Error("No text extracted");
        console.log("PDF text extracted:", extractedText);
      } catch (err) {
        console.error("Failed to extract PDF text:", err);
        alert("Failed to extract text from PDF.");
      }
    }

    const newData = {
      resume: extractedText,
      resumeName: existingResumeName,
      IsResume: !!resumeFile,
      GeminiAPIKey: apiKey,
      IsAPIKey: !!apiKey.trim(),
    };

    try {
      await setUserData(newData);
      alert("✅ User data saved!");
      onClose();
    } catch (error) {
      alert("❌ Failed to save user data.");
      console.error(error);
    }
  };

  return (
    <div id="react-extension-popup" className="popup-container">
      <button className="close-btn" onClick={onClose} aria-label="Close popup">✖</button>
      <h2 className="popup-title">Upload Resume & API Key</h2>

      <form onSubmit={handleSubmit} className="form-wrapper">
        <div className="form-group">
          <label htmlFor="resume">Resume (PDF):</label>
          <input type="file" id="resume" accept=".pdf" onChange={handleResumeChange} />
          {existingResumeName && <p className="resume-name">📄 {existingResumeName}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="apikey">Google API Key:</label>
          <input
            type="text"
            id="apikey"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder={isApiKeyRequired ? "Enter your Google API key" : ""}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button type="button" onClick={() => window.open("https://aistudio.google.com/app/apikey", "_blank")}>
            Get New KEY
          </button>
          <button type="submit" className="submit-btn">Save</button>
        </div>
      </form>
    </div>
  );
}
