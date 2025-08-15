export const STORAGE_KEY = "REALTIMEANALYSISEXTENSION";

export function setUserData(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const current = result[STORAGE_KEY] || {};
      const updated = { ...current, usersData: data }; // store raw object, no need to JSON.stringify
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving user data:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log("User data saved successfully");
          resolve();
        }
      });
    });
  });
}

export function getUserData() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const stored = result[STORAGE_KEY] || {};
      resolve(stored.usersData || {});
    });
  });
}

export function getGeminiApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const stored = result[STORAGE_KEY] || {};
      resolve(stored.usersData?.GeminiAPIKey || "");
    });
  });
}

export function getUsersResume() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const stored = result[STORAGE_KEY] || {};
      resolve(stored.usersData?.resume || "");
    });
  });
}

export function getSpreadSheetId() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const stored = result[STORAGE_KEY] || {};
      resolve(stored.usersData?.spreadSheetId || "");
    });
  });
}
