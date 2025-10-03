let port = null;
let requestIdCounter = 0;
const pendingRequests = new Map();

function getPort() {
  if (!port) {
    port = chrome.runtime.connect({ name: "feeder-port" });

    port.onMessage.addListener((msg) => {
      const { requestId, result, error } = msg;
      if (pendingRequests.has(requestId)) {
        const { resolve, reject } = pendingRequests.get(requestId);
        pendingRequests.delete(requestId);
        if (error) reject(new Error(error));
        else resolve(result);
      }
    });

    port.onDisconnect.addListener(() => {
      //console.warn("Port disconnected, reconnecting...");
      port = null;
    });
  }
  return port;
}

export function safeSendMessage({ action, data }) {
 
  return new Promise((resolve, reject) => {
    const port = getPort();
    const requestId = ++requestIdCounter;

    pendingRequests.set(requestId, { resolve, reject });
    port.postMessage({ requestId, action, data });

    // Optional timeout gg
    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error("Port request timed out"));
      }
    }, 15000);
  });
}
