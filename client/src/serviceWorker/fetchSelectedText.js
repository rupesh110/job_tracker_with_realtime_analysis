import { sanitizeJobDescription } from "./gemini/sanitizeJobDescription";

let latestData = null;
let port = null;

export function setupGeminiContextMenu() {
  // Remove previous menu safely
  chrome.contextMenus.remove("sendToGemini", () => {
    if (chrome.runtime.lastError) {
      console.log("No previous menu to remove, creating new one...");
    }

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

  if (!setupGeminiContextMenu.listenerAdded) {
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === "sendToGemini" && info.selectionText) {
        console.log("Selected text:", info.selectionText);

        try {
          const sanitizedJD = await sanitizeJobDescription(info.selectionText);
          console.log("Sanitized (background):", sanitizedJD);

          latestData = {
            ...sanitizedJD,
            url: tab?.url || null,
            date: new Date().toLocaleDateString("en-GB"),
            status: "Applied",
            syncStatus: "pending",
            platform: "Company Website",
          };

          // Send via port if connected
          if (port) {
            port.postMessage({ action: "Client_UpdateText", data: latestData });
          }

          // Optional: inject content script
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

    setupGeminiContextMenu.listenerAdded = true;
  }
}

// Listen for port connections from popup/content
chrome.runtime.onConnect.addListener((p) => {
  if (p.name === "feeder-port") {
    console.log("Port connected for Gemini updates");
    port = p;

    // Immediately send latest data if exists
    if (latestData) {
      port.postMessage({ action: "Client_UpdateText", data: latestData });
    }

    p.onDisconnect.addListener(() => {
      console.log("Port disconnected");
      port = null;
    });
  }
});
