export const SPREADSHEET_APP_URL = "https://script.google.com/macros/s/AKfycbxIn0jsKo1_NAeJ2ILldjcOwJN_4O93dJ1Pd0BFwhZQvMav4KZcQ3yiAZm8nGj4nmPy/exec";
export const STORAGE_KEY = "REALTIMEANALYSISEXTENSION";

export function setUserData(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: JSON.stringify(data) }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving user data:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log("User data saved successfully");
        resolve();
      }
    });
  });
}

export function getUserData() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const userDataRaw = result[STORAGE_KEY];
      const userData = userDataRaw ? JSON.parse(userDataRaw) : {};
      resolve(userData);
    });
  });
}

export async function getGeminiApiKey() {
  const userData = await getUserData();
  console.log(userData)
  return userData.GeminiAPIKey || null;
}

export async function getUsersResume() {
  const userData = await getUserData();
  return userData.resume || null;
}

export async function getSpreadSheetId() {
  const userData = await getUserData();
  return userData.spreadSheetId || null;
}