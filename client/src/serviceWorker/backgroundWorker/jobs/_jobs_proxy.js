import { addJob, fetchAllJobs, updateJobStatus, updateJobNotes, getAllJobsStatus } from "./jobsHelper";

export async function handleJobsMessage({ action, data, requestId }, port) {
  try {
    let result;

    switch (action) {
      case "Job_AddJob": {
        const response = await addJob(data);
        console.log("from jobs proxy:", response);
        result = response;
        break;
      }

      case "Job_FetchAllJobs": {
        const response = await fetchAllJobs();
        console.log("fetched jobs:", response);
        result = response;
        break; // use break, not return
      }

      case "Job_GetAllJobStatus": {
        const response = await getAllJobsStatus()
        console.log("Job_GetAllJobStatus:", response);
        result = response
        break; // use break, not return
      }

      case "Job_UpdateStatus":{
        const response = await updateJobStatus(data)
        console.log("from update status:", response)
        result = response
        break;
      }
      case "Job_UpdateNotes":{
        const response = await updateJobNotes(data)
        console.log("from update status:", response)
        result = response
        break;
      }


      default: {
        console.warn("[Jobs Proxy] Unknown action:", action);
        result = { error: "Unknown Job action: " + action };
        break;
      }
    }

    // ✅ Always respond through the port
    port.postMessage({ requestId, result });
  } catch (err) {
    console.error("Error in handleJobsMessage:", err);
    port.postMessage({ requestId, error: err.message });
  }
}
