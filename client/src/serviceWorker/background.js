import * as Jobs from "./backgroundServer/backgroundJobs.js";
import * as Users from "./backgroundServer/backgroundUsers.js";
import * as Geminis from "./backgroundServer/backgroundGemini.js"
import {setupGeminiContextMenu } from "./fetchSelectedText.js"

setupGeminiContextMenu();

chrome.runtime.onConnect.addListener((port) => {
  

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
        // console.warn("Unhandled action:", action);
        port.postMessage({ requestId, error: "Unhandled action: " + action });
      }
    } catch (err) {
      // console.error("Background error:", err);
      port.postMessage({ requestId, error: err.message });
    }
  });

  // port.onDisconnect.addListener(() => {
  //   
  // });
});
