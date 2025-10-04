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
    console.log("From feeder client fetchall jobs:", response)
    return response || [];
  } catch (err) {
    console.warn("fetchAllJobs failed:", err.message);
    return []; // fallback
  }
}

export async function updateJobStatus({ key, newStatus, updatedDate }) {
  try {
    const response = await safeSendMessage({
      action: "Job_UpdateStatus",
      data: { key, newStatus, updatedDate }  
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

export async function updateJobNotes({ key, notes }) {
  console.log("from update notes:", key, notes)
  try {
    const response = await safeSendMessage({
      action: "Job_UpdateNotes",
      data: { key, notes }
    });
    return response || {};
  } catch (err) {
    console.warn("updateJobNotes failed:", err.message);
    return {}; // fallback
  }
}
