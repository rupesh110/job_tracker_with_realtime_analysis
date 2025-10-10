import { sanitizeJobDescription } from "./gemini/sanitizeJobDescription";

let latestData = null;
let ports = []; // connected popup ports
let deliveredDataIds = new Set(); // track which data has been delivered

// Utility: generate unique ID for each job selection
function generateDataId(data) {
  return btoa(JSON.stringify(data)); // simple base64 hash
}

export function setupGeminiContextMenu() {
  // Remove previous menu safely
  chrome.contextMenus.remove("sendToGemini", () => {
    chrome.contextMenus.create({
      id: "sendToGemini",
      title: "Job Tracker with Realtime Analysis",
      contexts: ["selection"],
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Menu creation failed:", chrome.runtime.lastError.message);
      } else {
        console.log("Context menu created successfully.");
      }
    });
  });

  // Handle menu click
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "sendToGemini" && info.selectionText) {
      console.log("Selected text:", info.selectionText);

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

        // Generate unique ID for this job data
        const dataId = generateDataId(newData);
        newData.id = dataId;

        // Only update if new data is different
        if (JSON.stringify(latestData) !== JSON.stringify(newData)) {
          latestData = newData;
          deliveredDataIds.delete(dataId); // reset delivered flag for new data

          // Send to all connected popups that haven't acknowledged it
          ports.forEach(p => {
            p.postMessage({ action: "Client_UpdateText", data: latestData });
          });
        }

        // Optionally inject content script
        if (tab && tab.id) {
          chrome.scripting.executeScript(
            { target: { tabId: tab.id }, files: ["assets/content.js"] },
            () => {
              if (chrome.runtime.lastError) {
                console.warn("Failed to inject content script:", chrome.runtime.lastError.message);
              }
            }
          );
        }
      } catch (err) {
        console.error("Error sanitizing text:", err);
      }
    }
  });

  // Handle popup port connections
  chrome.runtime.onConnect.addListener((p) => {
    if (p.name === "feeder-port") {
      ports.push(p);
      console.log("Popup connected to feeder-port");

      // Handle acknowledgement messages
      p.onMessage.addListener((msg) => {
        if (msg.action === "Client_DataReceived" && msg.dataId) {
          console.log("Background received acknowledgement for dataId:", msg.dataId);
          deliveredDataIds.add(msg.dataId); // mark as delivered
        }
      });

      // Cleanup on disconnect
      p.onDisconnect.addListener(() => {
        ports = ports.filter(port => port !== p);
        console.log("Popup disconnected");
      });

      // Immediately send latest data if it exists and hasn't been acknowledged
      if (latestData && !deliveredDataIds.has(latestData.id)) {
        p.postMessage({ action: "Client_UpdateText", data: latestData });
      }
    }
  });
}
