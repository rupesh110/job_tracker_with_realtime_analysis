// backgroundJobs.js
import { setJobItem, getAllJobs, updateJobStatus, getJobStatusCounts } from "../dbServer/IndexedDbJobs";

export async function handleJobMessage({ action, data, requestId }, port) {
  try {
    let result;

    switch (action) {
      case "Job_AddJob":
        if (!data) throw new Error("No job data provided");
        const key = `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        result = await setJobItem(key, data);
        console.log("from backgorund jobs addjobs:", result)
        break;

      case "Job_FetchAllJobs":
        result = await getAllJobs();
        console.log("from backgorund jobs fetchalljobs:", result)
        break;

      case "Job_UpdateStatus":
        console.log("Job_UpdateStatus handler triggered with:", data);
        console.trace(); // show the call stack
        if (!data?.key || !data?.newStatus) {
          console.warn("⚠️ Missing key or newStatus in payload:", data);
          break; // stop instead of throwing
        }
        result = await updateJobStatus(data.key, data.newStatus);
        break;


      case "Job_GetAllJobStatus":
        result = await getJobStatusCounts();
        break;

      default:
        port.postMessage({ requestId, error: "Unknown Job action: " + action });
        return true; // handled, response sent
    }

    port.postMessage({ requestId, result });
    return true;
  } catch (err) {
    console.error("Error in Job handler:", err);
    port.postMessage({ requestId, error: err.message });
    return true;
  }
}
