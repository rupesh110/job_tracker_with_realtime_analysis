import { sanitizeJobDescription } from "./gemini/sanitizeJobDescription";

let latestData = null;
let ports = []; // connected popup ports
let deliveredDataIds = new Set(); // track acknowledged data IDs

/** Generate a UTF-8 safe Base64 ID */
const generateDataId = (data) => {
  const json = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json))); // handles Unicode safely
};

/** Send message to all connected popup ports safely */
function sendToAllPorts(message) {
  ports = ports.filter((p) => p && p.sender); // prune disconnected ports

  ports.forEach((p) => {
    try {
      p.postMessage(message);
    } catch (err) {
      console.warn("Port disconnected, removing it");
      ports = ports.filter((port) => port !== p);
    }
  });
}

/** Setup Gemini context menu & connection handler safely */
export function setupGeminiContextMenu() {
  // 🧹 Remove existing menu items to prevent duplicate ID error
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "sendToGemini",
      title: "Job Tracker with Realtime Analysis",
      contexts: ["selection"],
    });
  });

  // Prevent duplicate click listeners on reload
  chrome.contextMenus.onClicked.removeListener(handleMenuClick);
  chrome.contextMenus.onClicked.addListener(handleMenuClick);

  // Prevent duplicate onConnect listeners
  chrome.runtime.onConnect.removeListener(handlePortConnection);
  chrome.runtime.onConnect.addListener(handlePortConnection);
}

/** Handles right-click menu action */
async function handleMenuClick(info, tab) {
  if (info.menuItemId !== "sendToGemini" || !info.selectionText) return;

  try {
    const sanitizedJD = await sanitizeJobDescription(info.selectionText);

    if (!sanitizedJD || Object.keys(sanitizedJD).length === 0) {
      console.warn("Empty sanitized data, skipping send.");
      return;
    }

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
      deliveredDataIds.delete(newData.id);
      sendToAllPorts({ action: "Client_UpdateText", data: latestData });
    }

    // Optional content script injection (with guards)
    if (
      tab &&
      tab.id &&
      typeof tab.id === "number" &&
      tab.url &&
      !tab.url.startsWith("chrome://") &&
      !tab.url.startsWith("chrome-extension://")
    ) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["assets/content.js"], // ensure this path is correct relative to manifest
        });
      } catch (err) {
        console.warn("Script injection failed:", err.message);
      }
    } else {
      console.warn("No valid tab or restricted URL:", tab?.url);
    }
  } catch (err) {
    console.warn("Sanitization failed:", err);
  }
}

/** Handles popup connection ports */
function handlePortConnection(port) {
  if (port.name !== "feeder-port") return;

  if (!ports.includes(port)) ports.push(port);

  // Listen for acknowledgment messages
  port.onMessage.addListener((msg) => {
    if (msg.action === "Client_DataReceived" && msg.dataId) {
      deliveredDataIds.add(msg.dataId);
    }
  });

  port.onDisconnect.addListener(() => {
    ports = ports.filter((p) => p !== port);
  });

  // Immediately send latest data if pending
  if (latestData && !deliveredDataIds.has(latestData.id)) {
    try {
      port.postMessage({ action: "Client_UpdateText", data: latestData });
    } catch (err) {
      ports = ports.filter((p) => p !== port);
    }
  }
}
