import { addJob, fetchAllJobs, updateJobStatus, updateJobNotes, getAllJobsStatus } from "./jobsHelper";

export async function handleJobsMessage({ action, data, requestId }, port) {
  try {
    let result;

    switch (action) {
      case "Job_AddJob": {
        const response = await addJob(data);
        result = response;
        break;
      }

      case "Job_FetchAllJobs": {
        const response = await fetchAllJobs();
        result = response;
        break; // use break, not return
      }

      case "Job_GetAllJobStatus": {
        const response = await getAllJobsStatus()
        result = response
        break; // use break, not return
      }

      case "Job_UpdateStatus":{
        const response = await updateJobStatus(data)
        result = response
        break;
      }
      case "Job_UpdateNotes":{
        const response = await updateJobNotes(data)
        result = response
        break;
      }


      default: {
        //result = { error: "Unknown Job action: " + action };
        break;
      }
    }

    // Always respond through the port
    port.postMessage({ requestId, result });
  } catch (err) {
    console.error("Error in handleJobsMessage:", err);
    port.postMessage({ requestId, error: err.message });
  }
}
