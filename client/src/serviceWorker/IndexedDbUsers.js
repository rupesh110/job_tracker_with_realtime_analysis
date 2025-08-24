import { getDB } from "./IndexDb.js";

const USERS_STORE = "usersData";
const DEFAULT_USER_ID = "default_user";

export const DEFAULT_USER_DATA = {
  GeminiAPIKey: "",
  IsAPIKey: false,
  resume: "",
  resumeName: "",
  IsResume: false,
};

// Check if the default user data exists
export function isUserDataAvailable() {
  return getDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(USERS_STORE, "readonly");
      const store = tx.objectStore(USERS_STORE);
      const request = store.get(DEFAULT_USER_ID);

      request.onsuccess = () => {
        const result = request.result;
        const isAvailable = !!(
          result &&
          result.value &&
          (
            result.value.GeminiAPIKey?.trim() || 
            result.value.resume?.trim()
          ) // at least one meaningful field present
        );

        resolve(isAvailable);
      };

      request.onerror = () => reject(request.error);
    });
  });
}


// Overwrite user data completely
export function setUserData(value) {
  console.log("From db set users data:", value)
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(USERS_STORE, "readwrite");
      const store = tx.objectStore(USERS_STORE);
      const request = store.put({ id: DEFAULT_USER_ID, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}


// Get user data (returns defaults if not found)
export function getUserData() {
  return getDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(USERS_STORE, "readonly");
      const store = tx.objectStore(USERS_STORE);
      const request = store.get(DEFAULT_USER_ID);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.value);
        } else {
          resolve(DEFAULT_USER_DATA);
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

