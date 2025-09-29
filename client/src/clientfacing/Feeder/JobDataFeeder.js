import { safeSendMessage } from "./MainFeeder.js";

export async function addJob(data) {
  try {
    const response = await safeSendMessage({ action: "Job_AddJob", data });
    return response;
  } catch (err) {
    console.warn("addJob failed:", err.message);
    return {}; // fallback
  }
}

export async function fetchAllJobs() {
  try {
    const response = await safeSendMessage({ action: "Job_FetchAllJobs" });
    return response || [];
  } catch (err) {
    console.warn("fetchAllJobs failed:", err.message);
    return []; // fallback
  }
}

export async function updateJobStatus({ id, newStatus }) {
  try {
    const response = await safeSendMessage({
      action: "Job_UpdateStatus",
      data: { id, newStatus }
    });
    return response || {};
  } catch (err) {
    console.warn("updateJobStatus failed:", err.message);
    return {}; // fallback
  }
}

export async function getAllJobStatus() {
  try {
    const response = await safeSendMessage({ action: "Job_GetAllJobStatus" });
    return response || [];
  } catch (err) {
    console.warn("getAllJobStatus failed:", err.message);
    return []; // fallback
  }
}
