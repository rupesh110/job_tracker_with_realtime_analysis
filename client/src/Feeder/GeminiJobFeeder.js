export async function getGeminiAnalysis(data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "Gemini_GetGeminiAnalysis", data}, (response) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      if (!response) return reject(new Error("No response from service worker"));
      resolve(response);
    });
  });
}
