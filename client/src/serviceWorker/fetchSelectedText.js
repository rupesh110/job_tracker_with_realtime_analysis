import { sanitizeJobDescription } from "./gemini/sanitizeJobDescription";

let latestData = null; // store latest processed job data

export function setupGeminiContextMenu() {
  // Remove previous menu safely
  chrome.contextMenus.remove("sendToGemini", () => {
    if (chrome.runtime.lastError) {
      console.log("No previous menu to remove, creating new one...");
    }

    // Create new menu
    chrome.contextMenus.create(
      {
        id: "sendToGemini",
        title: "Job Tracker with Realtime Analysis",
        contexts: ["selection"],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Menu creation failed:", chrome.runtime.lastError.message);
        } else {
          console.log("Context menu created successfully.");
        }
      }
    );
  });

  // Only add listener once
  if (!setupGeminiContextMenu.listenerAdded) {
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === "sendToGemini" && info.selectionText) {
        console.log("Selected text:", info.selectionText);

        try {
          const sanitizedJD = await sanitizeJobDescription(info.selectionText);
          console.log("Sanitized (background):", sanitizedJD);

          // Build structured object
          latestData = {
            ...sanitizedJD,
            url: tab?.url || null,
            date: new Date().toLocaleDateString("en-GB"), 
            status: "Applied",
            syncStatus: "pending",
            platform: "Company Website",
          };

          // Notify popup (and any other listeners)
          chrome.runtime.sendMessage({
            action: "Client_UpdateText",
            data: latestData,
          });

          // Optional: send to content script if needed
          if (tab && tab.id) {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                files: ["assets/content.js"], // inject if not present
              },
              () => {
                chrome.tabs.sendMessage(
                  tab.id,
                  { action: "SelectedText_Test", data: latestData },
                  (resp) => {
                    if (chrome.runtime.lastError) {
                      console.warn(
                        "Failed to send message to tab:",
                        chrome.runtime.lastError.message
                      );
                    } else {
                      console.log("Message sent to content script:", resp);
                    }
                  }
                );
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

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "Request_LatestData") {
    sendResponse({ data: latestData || null });
  }
});
