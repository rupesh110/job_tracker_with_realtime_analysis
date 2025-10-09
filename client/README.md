# 🧠 RealTime Job Analyzer (React + Vite Chrome Extension)

**RealTimeAnalysis** is a Chrome Extension built with **React + Vite** that helps job applicants instantly evaluate how well their resume matches a job description in real time — right from platforms like **Seek** and **LinkedIn**.

The extension uses **Gemini AI** to analyze job descriptions, extract required skills, and compare them against your resume to calculate a **Job Match Percentage**, along with detailed strengths and improvement suggestions.

---

## 🚀 Features

- 🔍 **Real-Time Job Analysis**
  - Automatically reads job descriptions on supported platforms (Seek, LinkedIn, etc.)
  - Provides instant feedback with **Job Match %**, **Skill Gaps**, and **Improvement Tips**

- 💾 **Local Data Storage**
  - All analyzed job data is securely stored in your browser’s **IndexedDB**

- ⚙️ **AI-Powered Matching**
  - Uses **Gemini API** for skill extraction and resume–JD comparison
  - Generates a clean summary with technical and non-technical match scores

---

## 🧩 Architecture Overview

**Extension Components:**

- **Popup UI (React + Vite):** User interface to view and manage analyzed jobs  
- **Service Worker:** Handles message passing, AI requests, and IndexedDB storage  
- **Gemini API:** Provides the job-resume comparison and generates insights  
- **IndexedDB:** Stores job analysis results and metadata locally  

