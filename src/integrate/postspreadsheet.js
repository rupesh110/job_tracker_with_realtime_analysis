export async function testBackground(data) {
  console.log("Test background data");
  chrome.runtime.sendMessage({ action: "trigger", data: data }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError.message);
    } else {
      console.log("Response from background:", response);
    }
  });
}

