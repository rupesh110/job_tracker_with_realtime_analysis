├── README.md
├── dist.zip
├── index.html
├── package-lock.json
├── package.json
├── public
│   ├── icons
│   │   ├── icon128.png
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon48.webp
│   ├── manifest.json
│   └── pdf
│       └── pdf.worker.js
├── src
│   ├── clientfacing
│   │   ├── Feeder
│   │   │   ├── GeminiJobFeeder.js
│   │   │   ├── JobDataFeeder.js
│   │   │   ├── MainFeeder.js
│   │   │   ├── UsersDataFeeder.js
│   │   │   └── helper.js
│   │   ├── detect
│   │   │   ├── detectApplyLinkedin.js
│   │   │   └── detectApplySeek.js
│   │   ├── display
│   │   │   ├── floatingpages
│   │   │   │   ├── FloatingMain.css
│   │   │   │   ├── FloatingMain.jsx
│   │   │   │   ├── JobsTable.css
│   │   │   │   ├── JobsTable.jsx
│   │   │   │   ├── MainContent.css
│   │   │   │   └── MainContent.jsx
│   │   │   ├── injectButton
│   │   │   │   ├── InjectButtonLinkedin.js
│   │   │   │   └── InjectButtonSeek.js
│   │   │   ├── popuppages
│   │   │   │   ├── App.css
│   │   │   │   ├── App.jsx
│   │   │   │   ├── ExtractedDataDisplay.css
│   │   │   │   ├── ExtractedDataDisplay.jsx
│   │   │   │   ├── UsersData.css
│   │   │   │   ├── UsersData.jsx
│   │   │   │   └── helper.js
│   │   │   └── usePageData.js
│   │   ├── extract
│   │   │   ├── extractEmail.js
│   │   │   ├── extractLinkedin.js
│   │   │   ├── extractSeek.js
│   │   │   ├── helper.js
│   │   │   └── test.js
│   │   ├── models
│   │   │   ├── jobsData.js
│   │   │   └── userData.js
│   │   ├── service
│   │   │   └── convertToDocs.js
│   │   └── utils
│   │       ├── filterUsersData.js
│   │       ├── getPageData.js
│   │       └── getUserData.js
│   ├── content.jsx
│   ├── controller
│   │   ├── FloatingController.jsx
│   │   ├── HelperController.js
│   │   ├── PopupController.jsx
│   │   ├── helper.js
│   │   └── mainController.jsx
│   └── serviceWorker
│       ├── background.js
│       ├── backgroundServer
│       │   ├── backgroundGemini.js
│       │   ├── backgroundJobs.js
│       │   └── backgroundUsers.js
│       ├── backgroundWorker
│       │   ├── gemini
│       │   │   ├── _gemini_Proxy.js
│       │   │   ├── geminiCoverLetter.js
│       │   │   ├── geminiDetailedAnalysis.js
│       │   │   ├── sanitizeJobDescription.js
│       │   │   └── textConvert.js
│       │   ├── jobs
│       │   │   ├── _jobs_proxy.js
│       │   │   └── jobsHelper.js
│       │   ├── models
│       │   │   └── userModel.js
│       │   └── users
│       │       ├── encryption.js
│       │       ├── userDb.js
│       │       ├── usersHelper.js
│       │       └── usersProxy.js
│       ├── dbServer
│       │   ├── IndexDb.js
│       │   ├── IndexDbResume.js
│       │   ├── IndexedDbJobs.js
│       │   └── IndexedDbUsers.js
│       ├── fetchSelectedText.js
│       └── helper.js
├── vite.config.background.js
└── vite.config.content.js





