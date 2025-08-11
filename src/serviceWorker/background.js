const SPREADSHEET_APP_URL = "https://script.google.com/macros/s/AKfycbwBPo7z2F6iRbjz8KZeHjMsvjxFMAQfBd2G01oIwxEir8PdFDZHsOFVpDiRCnFusz1a/exec";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "trigger") {
    console.log("Trigger received in background!", request.data);

    // Add action property inside the payload sent to Apps Script
    const payload = {
      ...request.data,
      action: "saveJob"
    };

    fetch(SPREADSHEET_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Response from Apps Script:", data);
      sendResponse({ status: "success", data });
    })
    .catch(error => {
      console.error("Error sending to Apps Script:", error);
      sendResponse({ status: "error", error: error.message });
    });

    return true; // Keep sendResponse alive for async call
  }
});
