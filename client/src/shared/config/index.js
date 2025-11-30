/**
 * Application Configuration
 * Centralized configuration for the entire application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL:
    location.hostname === "localhost"
      ? "http://localhost:8080/api"
      : "https://jobtracker-backend-299028719782.australia-southeast1.run.app/api",
  TIMEOUT: 10000, // 10 seconds
};

// Chrome Extension Configuration
export const CHROME_CONFIG = {
  PORT_NAME: "job-tracker-port",
  RECONNECT_DELAY: 500, // milliseconds
  MESSAGE_TIMEOUT: 10000, // 10 seconds
};

// IndexedDB Configuration
export const DB_CONFIG = {
  NAME: "JobTrackerDB",
  VERSION: 5,
  STORES: {
    JOBS: "jobsData",
    USERS: "userData",
    RESUME: "resumeData",
  },
};

// Business Logic Configuration
export const BUSINESS_CONFIG = {
  FOLLOW_UP_THRESHOLD_DAYS: 21, // 3 weeks
  IN_PROGRESS_STATUSES: ["Recruiters call", "1st Round", "Interview"],
};

// Job Status Options
export const JOB_STATUSES = {
  APPLIED: "Applied",
  IN_PROGRESS: "In Progress",
  FOLLOW_UP: "Follow Up",
  REJECTED: "Rejected",
  OFFER: "Offer",
  UNKNOWN: "Unknown",
};
