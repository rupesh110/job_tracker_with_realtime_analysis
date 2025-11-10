
import * as Users from "./backgroundWorker/users/usersProxy.js";
import * as Gemini from "./backgroundWorker/gemini/_gemini_Proxy.js";
import * as Jobs from "./backgroundWorker/jobs/_jobs_proxy.js";



// Prevent multiple installs of listeners on reload
if (!globalThis.__JOB_TRACKER_INITIALIZED__) {
  globalThis.__JOB_TRACKER_INITIALIZED__ = true;


  // ✅ Handle incoming port connections (e.g., popup or content)
  chrome.runtime.onConnect.removeListener(handlePortConnection);
  chrome.runtime.onConnect.addListener(handlePortConnection);
}

/* ----------------------------------------------
   PORT HANDLER
---------------------------------------------- */
function handlePortConnection(port) {
  port.onMessage.addListener(async (msg) => {
    const { requestId, action, data } = msg;
    console.log("Received message on port from background:", action, data);

    try {
      if (action.startsWith("User")) {
        await Users.handleUserMessage({ action, data, requestId }, port);
        console.log("Handled User action: testing", action);
      } 
      else if (action.startsWith("1Gemini")) {
        await Gemini.handleGeminiMessage({ action, data, requestId }, port);
        console.log("Handled Gemini action:", action, data);
      } 
      else if (action.startsWith("Job")) {
        await Jobs.handleJobsMessage({ action, data, requestId}, port);
        console.log("Handled JObs action: testing", action, data )
      }
      else {
        port.postMessage({ requestId, error: "Unhandled action: " + action });
      }
    } catch (err) {
      port.postMessage({ requestId, error: err.message });
    }
  });
}
