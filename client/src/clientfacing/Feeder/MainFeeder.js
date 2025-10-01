// content.js
let port = null;
let requestIdCounter = 0;
const pendingRequests = new Map();

// Get or create port connection
function getPort() {
  if (!port) {
    port = chrome.runtime.connect({ name: "feeder-port" });

    port.onMessage.addListener((msg) => {
      const { requestId, result, error, action, data } = msg;

      // Handle response to requests
      if (requestId && pendingRequests.has(requestId)) {
        const { resolve, reject } = pendingRequests.get(requestId);
        pendingRequests.delete(requestId);
        if (error) reject(new Error(error));
        else resolve(result);
      }

      // Handle push events from background (e.g., Gemini update)
      if (action === "Client_UpdateText" && data) {
        // Dispatch a custom event so your React components can listen
        const event = new CustomEvent("GeminiUpdate", { detail: data });
        window.dispatchEvent(event);
      }
    });

    port.onDisconnect.addListener(() => {
      console.warn("Port disconnected, reconnecting...");
      port = null;
    });
  }
  return port;
}

// Middleware to send request to background with automatic requestId
export function safeSendMessage({ action, data }) {
  return new Promise((resolve, reject) => {
    const port = getPort();
    const requestId = ++requestIdCounter;

    pendingRequests.set(requestId, { resolve, reject });
    port.postMessage({ requestId, action, data });

    // Optional timeout
    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error("Port request timed out"));
      }
    }, 15000);
  });
}

// Optional helper to push Gemini updates manually if needed
export function sendGeminiUpdate(data) {
  const port = getPort();
  port.postMessage({ action: "Client_UpdateText", data });
}

// Example usage in React:
// window.addEventListener("GeminiUpdate", (e) => {
//   console.log("Received Gemini update:", e.detail);
// });
