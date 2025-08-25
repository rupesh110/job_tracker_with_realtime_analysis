import * as Jobs from "./backgroundJobs.js";
import * as Users from "./backgroundUsers.js";
import * as Geminis from "./backgroundGemini.js"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action.startsWith("Job")) {
    return Jobs.handleJobMessage(request, sender, sendResponse);
  }
  if (request.action.startsWith("User")) {
    return Users.handleUserMessage(request, sender, sendResponse);
  }

  if (request.action.startsWith("Gemini")) {
    return Geminis.handleUserMessage(request, sender, sendResponse);
  }
  return true;
});
