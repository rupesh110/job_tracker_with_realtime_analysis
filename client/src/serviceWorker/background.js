import * as Jobs from "./backgroundJobs.js";
import * as Users from "./backgroundUsers.js";
import * as Geminis from "./backgroundGemini.js"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request.action, "from", sender);

  let handled = false;

  try {
    if (request.action.startsWith("Job")) {
      handled = Jobs.handleJobMessage(request, sender, sendResponse);
    } else if (request.action.startsWith("User")) {
      handled = Users.handleUserMessage(request, sender, sendResponse);
    } else if (request.action.startsWith("Gemini")) {
      handled = Geminis.handleGeminiMessage(request, sender, sendResponse);
    }
  } catch (err) {
    console.error("Background error:", err);
    sendResponse({ error: err.message });
    return false; // stop further processing
  }

  // Default response if nothing handled it
  if (!handled) {
    console.warn("Unhandled action:", request.action);
    sendResponse({ error: "Unhandled action: " + request.action });
  }

  return true; // keep the message channel open for async responses
});
