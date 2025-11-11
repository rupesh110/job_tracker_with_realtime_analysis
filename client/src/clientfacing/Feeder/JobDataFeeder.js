import { safeSendMessage } from "./MainFeeder.js";

export async function addJob(data) {
  try {
    const response = await safeSendMessage({ action: "Job_AddJob", data });
    return response;
  } catch (err) {
    //console.warn("addJob failed:", err.message);
    return {}; // fallback
  }
}

export async function fetchAllJobs() {
  try {
    const response = await safeSendMessage({ action: "Job_FetchAllJobs" });
    return response || [];
  } catch (err) {
    //console.warn("fetchAllJobs failed:", err.message);
    return []; // fallback
  }
}

export async function updateJobStatus({ id, newStatus, updatedDate }) {
  try {
    console.log("Sending update to background:", { id, newStatus, updatedDate });

    const response = await safeSendMessage({
      action: "Job_UpdateStatus",
      data: { id, newStatus, updatedDate },  // ✅ Use id instead of key
    });
    return response || {};
  } catch (err) {
    console.error(" updateJobStatus failed:", err.message);
    return {};
  }
}


export async function getAllJobStatus() {
  try {
    const response = await safeSendMessage({ action: "Job_GetAllJobStatus" });
    console.log("from feeder get all job status:", response)
    return response || [];
  } catch (err) {
    //console.warn("getAllJobStatus failed:", err.message);
    return []; // fallback
  }
}

export async function updateJobNotes({ id, notes }) {
  
  try {
    const response = await safeSendMessage({
      action: "Job_UpdateNotes",
      data: { id, notes }
    });
    return response || {};
  } catch (err) {
   // console.warn("updateJobNotes failed:", err.message);
    return {}; // fallback
  }
}
