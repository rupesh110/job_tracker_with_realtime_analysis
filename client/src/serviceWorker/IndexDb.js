const DB_NAME = "RealtimeAnalysisDBTest";
const DB_VERSION = 14;

let dbPromise = null;
const JOBS_STORE = "jobsData";
const USERS_STORE = "usersData";


// Open the database once and cache it
export function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create jobsData store if it doesn't exist
        if (!db.objectStoreNames.contains(JOBS_STORE)) {
          const jobsStore = db.createObjectStore(JOBS_STORE, { keyPath: "key" });
          jobsStore.createIndex("statusIndex", "value.status", { unique: false });
          jobsStore.createIndex("syncStatusIndex", "value.syncStatus", { unique: false });
        }

        // Create usersData store if it doesn't exist
        if (!db.objectStoreNames.contains(USERS_STORE)) {
          db.createObjectStore(USERS_STORE, { keyPath: "id" }); // "id" as key for users
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(request.error);
    });
  }
  return dbPromise;
}