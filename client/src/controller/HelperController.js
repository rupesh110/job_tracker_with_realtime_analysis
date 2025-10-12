export function pollSelectedText(callback, interval = 500, timeout = 10000) {
  let elapsed = 0;
  const intervalId = setInterval(() => {
    chrome.runtime.sendMessage({ action: "GetLastSelectedText" }, (response) => {
      if (response) {
        //console.log("Received selected text from background:", response);
        callback(response.data); // pass data to wherever you want
        clearInterval(intervalId);
      } else {
        //console.log("No selected text yet, waiting...");
      }
    });

    elapsed += interval;
    if (elapsed >= timeout) {
      //console.warn("Polling timed out, no selected text received.");
      clearInterval(intervalId);
    }
  }, interval);

  return () => clearInterval(intervalId); // return cleanup function
}
