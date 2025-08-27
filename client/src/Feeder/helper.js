export function safeSendMessage(message, tries = 3, delay = 500) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
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
        if (!response) return reject(new Error("No response from background"));
        resolve(response);
      });
    } catch (err) {
      reject(err);
    }
  });
}
