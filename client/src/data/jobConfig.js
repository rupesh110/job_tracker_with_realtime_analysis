import { STORAGE_KEY } from "./config.js";

// Utility to generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Save jobs to Chrome storage
export async function setJobData(jobsArray) {
  // Ensure jobsArray is actually an array
  if (!Array.isArray(jobsArray)) {
    jobsArray = [jobsArray];
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const current = result[STORAGE_KEY] || {};
      const existingJobs = Array.isArray(current.jobData) ? current.jobData : [];

      // Process new jobs
      const newJobs = jobsArray.map(job => ({
        id: generateId(),
        url: job.url,
        company: job.company,
        title: job.title,
        location: job.location,
        platform: job.platform,
        workType: job.workType || 'N/A',
        status: "Applied",
        createdAt: Date.now()
      }));

      // Combine with existing jobs, avoiding duplicates by URL
      const combinedJobs = [...existingJobs];
      newJobs.forEach(job => {
        if (!existingJobs.some(existing => existing.url === job.url)) {
          combinedJobs.push(job);
        }
      });

      // Save to storage
      chrome.storage.local.set({ [STORAGE_KEY]: { ...current, jobData: combinedJobs } }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving job data:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve(combinedJobs);
        }
      });
    });
  });
}

// Retrieve jobs
export async function getJobData() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const stored = result[STORAGE_KEY] || {};
      resolve(Array.isArray(stored.jobData) ? stored.jobData : []);
    });
  });
}


export async function updateJobData(jobId, field, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const current = result[STORAGE_KEY] || {};
      const existingJobs = Array.isArray(current.jobData) ? current.jobData : [];

      const updatedJobs = existingJobs.map(job =>
        job.id === jobId ? { ...job, [field]: value } : job
      );

      chrome.storage.local.set({ [STORAGE_KEY]: { ...current, jobData: updatedJobs } }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error updating job data:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve(updatedJobs);
        }
      });
    });
  });
}


export async function getJobStatusCounts() {
  const allJobs = await getJobData();

  // Initialize counts
  const counts = {
    Applied: 0,
    "In Progress": 0,
    "Follow Up": 0,
  };

  allJobs.forEach(job => {
    const status = job.status || "Unknown";

    if (status === "Applied") {
      counts.Applied++;
    } else if (status === "Interview" || status === "Offer") {
      counts["In Progress"]++;
    } else {
      // Unknown, Rejected, or other statuses go to Follow Up
      counts["Follow Up"]++;
    }
  });

  return counts;
}
