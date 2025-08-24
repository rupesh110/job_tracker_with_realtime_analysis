import { callGemini } from "./callGemini";

export function handleUserMessage(request, sender, sendResponse) {
  switch (request.action) {
    case "Gemini_GetGeminiAnalysis": {
      callGemini(request.data)
        .then(available => sendResponse({ available }))
        .catch(err => sendResponse({ status: "error", error: err.message }));
      return true; // keep the port open for async response
    }

    default:
      console.warn("Unknown User action:", request.action);
      sendResponse({ status: "error", error: "Unknown User action" });
      return false; // no async operation here
  }
}
