export async function addJob(data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "Job_AddJob", data }, (response) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      if (!response) return reject(new Error("No response from service worker"));
      resolve(response);
    });
  });
}

export async function fetchAllJobs() {
  console.log("Fetch all jobs from Feeder");
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "Job_FetchAllJobs" }, (response) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(response || []);
    });
  });
}

export async function updateJobStatus({ id, newStatus }) {
  console.log("Update status", id, newStatus);
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "Job_UpdateStatus", data: { id, newStatus } },
      (response) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(response || []);
      }
    );
  });
}

export async function getAllJobStatus() {
  console.log("Get All job status");
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "Job_GetAllJobStatus" }, (response) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(response || []);
    });
  });
}
