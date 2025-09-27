export function safeSendMessage(message, tries = 3, delay = 500) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          if (n > 0) {
            console.warn("Retrying sendMessage:", chrome.runtime.lastError.message);
            setTimeout(() => attempt(n - 1), delay);
          } else {
            reject(new Error(chrome.runtime.lastError.message));
          }
          return;
        }
        if (!response) {
          reject(new Error("No response from background"));
        } else {
          resolve(response);
        }
      });
    };
    attempt(tries);
  });
}
