// backgroundJobs.js
import { setJobItem, getAllJobs, updateJobStatus, getJobStatusCounts, updateJobNotes } from "../dbServer/IndexedDbJobs";

export function handleJobMessage({ action, data, requestId }, port) {
  switch (action) {
    case "Job_AddJob": {
      const key = `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      setJobItem(key, data)
        .then(() => port.postMessage({ requestId, result: { status: "ok", storedKey: key } }))
        .catch((err) => port.postMessage({ requestId, error: err.message }));
      break;
    }

    case "Job_FetchAllJobs": {
      getAllJobs()
        .then((items) => port.postMessage({ requestId, result: { items: items || [] } }))
        .catch((err) => port.postMessage({ requestId, error: err.message }));
      break;
    }

    case "Job_UpdateStatus": {
      const { key, newStatus, updatedDate } = data;
      console.log("🚀 ~ handleJobMessage ~ data:", data)
      console.log("from serviceworker background udpdate:", data)
      updateJobStatus(key, newStatus)
        .then(() => port.postMessage({ requestId, result: { status: "ok", key, newStatus, updatedDate } }))
        .catch((err) => port.postMessage({ requestId, error: err.message }));
      break;
    }

    case "Job_UpdateNotes": {
      const { key, notes } = data;
      console.log("From backgorun josb notes:", data)
      updateJobNotes(key, notes)
        .then(() => port.postMessage({ requestId, result: { status: "ok", key, notes } }))
        .catch((err) => port.postMessage({ requestId, error: err.message }));
      break;
    }

    case "Job_GetAllJobStatus": {
      getJobStatusCounts()
        .then((items) => port.postMessage({ requestId, result: { items: items || {} } }))
        .catch((err) => port.postMessage({ requestId, error: err.message }));
      break;
    }

    default:
      port.postMessage({ requestId, error: "Unknown Job action" });
  }
}

