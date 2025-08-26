import { safeSendMessage } from "./helper";

export async function addJob(data) {
  console.log("Jobs feeder:", data);
  return safeSendMessage({ action: "Job_AddJob", data });
}

export async function fetchAllJobs() {
  console.log("Fetch all jobs from Feeder");
  return safeSendMessage({ action: "Job_FetchAllJobs" })
    .catch(err => {
      console.warn("Fetch jobs failed:", err.message);
      return []; // fallback to prevent breakage
    });
}

export async function updateJobStatus({ id, newStatus }) {
  console.log("Update status", id, newStatus);
  return safeSendMessage({
    action: "Job_UpdateStatus",
    data: { id, newStatus }
  }).catch(err => {
    console.warn("Update job status failed:", err.message);
    return [];
  });
}

export async function getAllJobStatus() {
  console.log("Get All job status");
  return safeSendMessage({ action: "Job_GetAllJobStatus" })
    .catch(err => {
      console.warn("Get job status failed:", err.message);
      return [];
    });
}
