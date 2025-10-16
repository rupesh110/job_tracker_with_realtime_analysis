import * as Jobs from "./backgroundServer/backgroundJobs.js";
import * as Users from "./backgroundServer/backgroundUsers.js";
import * as Geminis from "./backgroundServer/backgroundGemini.js";
import { setupGeminiContextMenu } from "./fetchSelectedText.js";

/* ----------------------------------------------
   INITIALIZATION
---------------------------------------------- */

// Prevent multiple installs of listeners on reload
if (!globalThis.__JOB_TRACKER_INITIALIZED__) {
  globalThis.__JOB_TRACKER_INITIALIZED__ = true;

  // ✅ Create context menu safely (removes duplicates internally)
  setupGeminiContextMenu();

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

    try {
      if (action.startsWith("Job")) {
        await Jobs.handleJobMessage({ action, data, requestId }, port);
      } else if (action.startsWith("User")) {
        await Users.handleUserMessage({ action, data, requestId }, port);
      } else if (action.startsWith("Gemini")) {
        await Geminis.handleGeminiMessage({ action, data, requestId }, port);
      } else {
        port.postMessage({ requestId, error: "Unhandled action: " + action });
      }
    } catch (err) {
      port.postMessage({ requestId, error: err.message });
    }
  });
}
