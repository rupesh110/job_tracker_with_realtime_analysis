

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveToSpreadsheet") {
  try {
    chrome.runtime.sendMessage({ action: "test" }, (res) => console.log(res));
  } catch (e) {
    console.error("Failed to send message:", e);
  }
}

});
