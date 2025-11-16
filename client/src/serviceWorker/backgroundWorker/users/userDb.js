// userDb.js
import { UserModel } from "../models/userModel.js";
// --- Constants ---
const DB_NAME = "JobTrackerDB";
const STORE_NAME = "user";

/* -----------------------------------------------------------
   Open IndexedDB Connection
----------------------------------------------------------- */
export async function openUserDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 3);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/* -----------------------------------------------------------
   Save (Create or Update) User Data
----------------------------------------------------------- */
export async function setUserDataDB(data) {
  const db = await openUserDB();
  const now = new Date().toISOString();

  // Get existing user to preserve fields
  const existing = await getUserDataDB();

  const merged = {
    id: "current",
    ...structuredClone(UserModel),
    ...existing,
    ...data,
    resume: {
      ...structuredClone(UserModel.resume),
      ...(existing?.resume || {}),
      ...(data?.resume || {}),
    },
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(merged);
    tx.oncomplete = () => resolve(merged);
    tx.onerror = (e) => reject(e.target.error);
  });
}


/* -----------------------------------------------------------
   Retrieve User Data (Always returns valid object)
----------------------------------------------------------- */
export async function getUserDataDB() {
  const db = await openUserDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get("current");

    req.onsuccess = () => {
      const stored = req.result || {};
      console.log('stored: ', stored);

      const user = {
        ...structuredClone(UserModel),
        ...stored,
        resume: {
          ...structuredClone(UserModel.resume),
          ...(stored?.resume || {}),
        },
      };
      
      console.log('user from indexDB: ', user);

      resolve(user);
    };

    req.onerror = (e) => reject(e.target.error);
  });
}

/* -----------------------------------------------------------
   Clear Stored User (Logout)
----------------------------------------------------------- */
export async function clearUserDataDB() {
  const db = await openUserDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete("current");
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}
