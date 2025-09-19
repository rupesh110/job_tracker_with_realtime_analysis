import { safeSendMessage } from "./helper";

export async function addJob(data) {
  return safeSendMessage({ action: "Job_AddJob", data });
}

export async function fetchAllJobs() {
  return safeSendMessage({ action: "Job_FetchAllJobs" })
    .catch(err => {
      console.warn("Fetch jobs failed:", err.message);
      return []; // fallback to prevent breakage
    });
}

export async function updateJobStatus({ id, newStatus }) {
  return safeSendMessage({
    action: "Job_UpdateStatus",
    data: { id, newStatus }
  }).catch(err => {
    console.warn("Update job status failed:", err.message);
    return [];
  });
}

export async function getAllJobStatus() {
  return safeSendMessage({ action: "Job_GetAllJobStatus" })
    .catch(err => {
      console.warn("Get job status failed:", err.message);
      return [];
    });
}
