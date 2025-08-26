export function safeSendMessage(message, tries = 3, delay = 5000) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Extension not ready:", chrome.runtime.lastError.message);

          // Retry if we still have attempts left
          if (tries > 0) {
            setTimeout(() => {
              safeSendMessage(message, tries - 1, delay)
                .then(resolve)
                .catch(reject);
            }, delay);
          } else {
            reject(chrome.runtime.lastError);
          }
          return;
        }

        // If no response at all, treat as error
        if (!response) return reject(new Error("No response from service worker"));
        resolve(response);
      });
    } catch (err) {
      reject(err);
    }
  });
}
