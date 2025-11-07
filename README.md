# Job Feeder Chrome Extension

A full-stack Chrome Extension built to **streamline job application management** and **automate AI-assisted workflows** using **Gemini**, **Go (Gin)**, **PostgreSQL**, and **WorkOS**.

---

## Overview

**Job Feeder** is a smart Chrome extension that helps users manage and analyze job applications directly from job portals.  
It integrates with **Gemini AI** to generate tailored **cover letters**, analyze **job descriptions**, and suggest **next actions** — all while syncing data securely to a **Go backend** with **PostgreSQL** persistence.

The extension aims to reduce manual tracking and improve job-seeking productivity through automation, AI insights, and real-time synchronization.

---

## Core Features

### Job Data Management
- Add, fetch, and update job applications
- Auto-detect and capture job postings from career sites
- Track status changes (Applied, Interview, Offer, etc.)
- Sync with backend (Go + PostgreSQL) for persistence

### Gemini AI Integration
- Automated **job posting analysis**
- **Cover letter generation** using contextual understanding
- AI-driven insights for job fit and recommendations

### Reliable Background Communication
- Persistent connection between content scripts and background worker
- Async request handling with retry and error fallback

### Authentication and Security
- Secure authentication using **WorkOS**
- User-level data separation and encryption in transit

---

## Architecture Overview

```
+------------------+       +---------------------+       +--------------------+
|   Content Script  | <---> |  Background Worker  | <---> | Gemini API / Logic |
+------------------+       +---------------------+       +--------------------+
        |                           |
        v                           v
   JobDataFeeder.js            MainFeeder.js
   GeminiJobFeeder.js
```

**Frontend (Chrome Extension):** React/Vue UI for job management  
**Backend (Go + Gin):** RESTful APIs handling user data and AI requests  
**Database:** PostgreSQL for storing job metadata, AI outputs, and user sessions  
**AI Layer:** Gemini (for NLP and content generation)  
**Auth:** WorkOS for secure sign-in and org-based user management  

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React / Vue (Manifest V3) |
| **Backend** | Go (Gin Framework) |
| **Database** | PostgreSQL |
| **AI Engine** | Gemini (Google AI) |
| **Auth / Identity** | WorkOS |
| **Storage** | Local Chrome Storage + PostgreSQL sync |
| **Communication** | Chrome Runtime Messaging API |

---

## Folder Structure

```
job-feeder-extension/
├── client/                     # Chrome extension (React/Vue)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── background/
│   │   ├── content/
│   │   └── services/
│   └── manifest.json
├── server/                     # Go (Gin) backend
│   ├── main.go
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── utils/
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/rupesh110/jobtrackerwithrealtimeanalysis.git
cd client
```

### 2. Load the Extension in Chrome

- Open `chrome://extensions/`
- Enable **Developer Mode**
- Click **Load unpacked**
- Select the `/client` folder

### 3. Run Backend (Go Gin API)

```bash
cd server
go mod tidy
go run main.go
```

Ensure you have **PostgreSQL** and **WorkOS** credentials configured in `.env`.

---

## Usage

1. Visit any seek job board or LinkedIn job page.  
2. Click the **Job Feeder icon** to analyze the job.  
3. Let Gemini generate a **cover letter draft** or **analysis summary**.  
4. Save and track progress directly in the extension dashboard.  

> Data is automatically synced between your browser and the backend for continuity across devices.

---

## Future Enhancements

- AI-based resume tailoring per job description  
- Integration with additional AI models (Gemini 2.0, Claude, etc.)  
- Smart notifications for job follow-ups  
- Analytics dashboard for job application insights  
- Cloud sync for multi-device usage  

---

## Contributing

1. Fork the repository  
2. Create a branch: `git checkout -b YourFeature`  
3. Implement and test your feature  
4. Commit changes: `git commit -am 'Add new feature'`  
5. Push to your branch: `git push origin YourFeature`  
6. Open a Pull Request 

---

## Chrome Web Store

**[Job Tracker with Realtime Analysis](https://chromewebstore.google.com/detail/job-tracker-with-realtime/enokaggipfjhcdfioegochdgphbejepm)**

---

## License

MIT License © 2025 Rupesh  
Use freely with attribution.
