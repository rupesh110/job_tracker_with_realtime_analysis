// backgroundJobs.js
import { setJobItem, getAllJobs, updateJobStatus, getJobStatusCounts } from "../dbServer/IndexedDbJobs";

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
      const { key, newStatus } = data;
      updateJobStatus(key, newStatus)
        .then(() => port.postMessage({ requestId, result: { status: "ok", key, newStatus } }))
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

