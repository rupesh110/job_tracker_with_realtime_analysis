import { sanitizeJobDescription } from "./gemini/sanitizeJobDescription";

let latestData = null;
let ports = []; // connected popup ports
let deliveredDataIds = new Set(); // track acknowledged data IDs

const generateDataId = (data) => btoa(JSON.stringify(data));

// Safe send function: posts to all live ports only
function sendToAllPorts(message) {
  // Remove disconnected ports
  ports = ports.filter(p => p && p.sender);

  ports.forEach((p) => {
    try {
      p.postMessage(message);
    } catch (err) {
      console.warn("Port disconnected, removing it");
      ports = ports.filter(port => port !== p);
    }
  });
}

export function setupGeminiContextMenu() {
  // Create menu idempotently
  try {
    chrome.contextMenus.create({
      id: "sendToGemini",
      title: "Job Tracker with Realtime Analysis",
      contexts: ["selection"],
    });
  } catch (err) {
    if (!err.message.includes("already exists")) console.error(err);
  }

  // Menu click handler
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "sendToGemini" || !info.selectionText) return;

    try {
      const sanitizedJD = await sanitizeJobDescription(info.selectionText);

      const newData = {
        ...sanitizedJD,
        url: tab?.url || null,
        date: new Date().toLocaleDateString("en-GB"),
        status: "Applied",
        syncStatus: "pending",
        platform: "Company Website",
      };

      newData.id = generateDataId(newData);

      // Only send if data changed
      if (JSON.stringify(latestData) !== JSON.stringify(newData)) {
        latestData = newData;
        deliveredDataIds.delete(newData.id); // reset acknowledgment

        sendToAllPorts({ action: "Client_UpdateText", data: latestData });
      }

      // Optional content script injection
      if (tab?.id) {
        chrome.scripting.executeScript(
          { target: { tabId: tab.id }, files: ["assets/content.js"] },
          () => {} // ignore injection errors
        );
      }
    } catch (err) {
      console.warn("Sanitization failed:", err);
    }
  });

  // Handle popup connections
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== "feeder-port") return;

    if (!ports.includes(port)) ports.push(port);

    // Listen for acknowledgments
    port.onMessage.addListener((msg) => {
      if (msg.action === "Client_DataReceived" && msg.dataId) {
        deliveredDataIds.add(msg.dataId);
      }
    });

    port.onDisconnect.addListener(() => {
      ports = ports.filter((p) => p !== port);
    });

    // Immediately send latest data if not acknowledged
    if (latestData && !deliveredDataIds.has(latestData.id)) {
      try {
        port.postMessage({ action: "Client_UpdateText", data: latestData });
      } catch (err) {
        ports = ports.filter((p) => p !== port);
      }
    }
  });
}
