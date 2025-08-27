// backgroundJobs.js
import { setJobItem, getAllJobs, updateJobStatus, getJobStatusCounts } from "./IndexedDbJobs.js";

export function handleJobMessage(request, sender, sendResponse) {
  switch (request.action) {
    case "Job_AddJob": {
      const key = `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      setJobItem(key, request.data)
        .then(() => sendResponse({ status: "ok", storedKey: key }))
        .catch((err) => sendResponse({ status: "error", error: err.message }));
      return true;
    }

    case "Job_FetchAllJobs": {
      getAllJobs()
        .then((items) => sendResponse({ items: items || [] }))
        .catch((err) => sendResponse({ status: "error", error: err.message }));
      return true;
    }

    case "Job_UpdateStatus": {
      const { id, newStatus } = request.data;
      updateJobStatus(id, newStatus)
        .then(() => sendResponse({ status: "ok", id, newStatus }))
        .catch((err) => sendResponse({ status: "error", error: err.message }));
      return true;
    }

    case "Job_GetAllJobStatus": {
      getJobStatusCounts()
        .then((items) => sendResponse({ items: items || {} }))
        .catch((err) => sendResponse({ status: "error", error: err.message }));
      return true;
    }

    default:
      sendResponse({ status: "error", error: "Unknown Job action" });
      return false;
  }
}
