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

export function isUserDataAvailable(tries = 3, delay = 200) {
  return new Promise(async (resolve, reject) => {
    for (let attempt = 1; attempt <= tries; attempt++) {
      try {
        const db = await getDB();
        const tx = db.transaction(USERS_STORE, "readonly");
        const store = tx.objectStore(USERS_STORE);

        const result = await new Promise((res, rej) => {
          const request = store.get(DEFAULT_USER_ID);
          request.onsuccess = () => res(request.result);
          request.onerror = () => rej(request.error);
        });

        const isAvailable = !!(
          result &&
          result.value &&
          (result.value.GeminiAPIKey?.trim() || result.value.resume?.trim())
        );

        return resolve(isAvailable); 
      } catch (err) {
        if (err.message.includes("Extension context invalidated") && attempt < tries) {
          await new Promise(res => setTimeout(res, delay));
        } else {
          return reject(err);
        }
      }
    }
  });
}


export function setUserData(value) {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(USERS_STORE, "readwrite");
      const store = tx.objectStore(USERS_STORE);

      const payload = { id: DEFAULT_USER_ID, value };
      const request = store.put(payload);

      request.onsuccess = () => resolve(value); // return the saved value
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


