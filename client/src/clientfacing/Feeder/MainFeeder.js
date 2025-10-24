let port = null;
let requestIdCounter = 0;
const pendingRequests = new Map();
let reconnectCooldown = false;

/* ----------------------------------------------
   Utility: Reject and clear all pending requests
---------------------------------------------- */
function cleanupPendingRequests(errorMsg = "Port disconnected") {
  for (const { reject } of pendingRequests.values()) {
    reject(new Error(errorMsg));
  }
  pendingRequests.clear();
}

/* ----------------------------------------------
   Get (or create) a stable port connection
---------------------------------------------- */
function getPort() {
  // If we're currently in cooldown, wait until it resets
  if (reconnectCooldown) return null;

  if (!port) {
    try {
      port = chrome.runtime.connect({ name: "feeder-port" });

      port.onMessage.addListener((msg) => {
        const { requestId, result, error } = msg;
        if (pendingRequests.has(requestId)) {
          const { resolve, reject } = pendingRequests.get(requestId);
          pendingRequests.delete(requestId);
          error ? reject(new Error(error)) : resolve(result);
        }
      });

      port.onDisconnect.addListener(() => {
        console.warn("[MainFeeder] Port disconnected — cleaning pending requests");
        cleanupPendingRequests("Service worker disconnected");

        // Prevent immediate reconnect storm
        reconnectCooldown = true;
        setTimeout(() => {
          reconnectCooldown = false;
          port = null;
        }, 500);
      });
    } catch (err) {
      console.error("[MainFeeder] Failed to establish port:", err);
      port = null;
    }
  }

  return port;
}

/* ----------------------------------------------
   Safe message send (Promise-based RPC)
---------------------------------------------- */
export function safeSendMessage({ action, data }) {
  return new Promise((resolve, reject) => {
    try {
      const port = getPort();

      if (!port) {
        console.warn("[MainFeeder] Port unavailable, retrying...");
        setTimeout(() => {
          const retryPort = getPort();
          if (!retryPort) return reject(new Error("Background port unavailable"));
          sendWithPort(retryPort);
        }, 200);
      } else {
        sendWithPort(port);
      }

      function sendWithPort(activePort) {
        const requestId = ++requestIdCounter;
        pendingRequests.set(requestId, { resolve, reject });

        try {
          activePort.postMessage({ requestId, action, data });
          // Timeout fallback
          setTimeout(() => {
            if (pendingRequests.has(requestId)) {
              pendingRequests.delete(requestId);
              reject(new Error(`Port request timed out: ${action}`));
            }
          }, 10000); // 10s timeout
        } catch (err) {
          pendingRequests.delete(requestId);
          reject(err);
        }
      }
    } catch (err) {
      reject(err);
    }
  });
}
