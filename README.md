# Job Feeder Chrome Extension

A Chrome extension for managing job applications and automating interactions with Gemini services.  
Users can:

- Track job applications
- Update job statuses
- Generate cover letters and job analysis via Gemini
- Communicate seamlessly with the background service worker


**Get it on the Chrome Web Store:** [Job Tracker with Realtime Analysis](https://chromewebstore.google.com/detail/job-tracker-with-realtime/enokaggipfjhcdfioegochdgphbejepm)

---

## Architecture Overview

+------------------+       +---------------------+       +--------------------+
|   Content Script  | <---> |  Background Worker  | <---> | Gemini API / Logic |
+------------------+       +---------------------+       +--------------------+
        |                           |
        v                           v
   JobDataFeeder.js            MainFeeder.js
   GeminiJobFeeder.js

Content Script – Interacts with page/UI.

Background Worker – Handles persistent communication.

Gemini API / Logic – Provides automated job analysis and cover letter generation.

## Features

Job Data Management

    - Add, fetch, and update job applications

    - Track job status changes

Gemini Integration

    - Automated analysis of job postings

    - Cover letter generation

Reliable Background Communication

    - Persistent connection between content scripts and background worker

    - Handles asynchronous requests with fallback for errors


## Installation

1. Clone the repository:

git clone https://github.com/rupesh110/jobtrackerwithrealtimeanalysis.git
cd client


2. Load the extension in Chrome:

    Go to chrome://extensions/

    Enable Developer mode

    Click Load unpacked and select the project folder


## Contributing

    - Fork the repository
    - Create a branch: git checkout -b YourFeature
    - Make your changes
    - Commit: git commit -am 'Add new feature'
    - Push: git push origin YourFeature
    - Open a Pull Request