import {getDB} from "./IndexDb.js"

const JOBS_STORE = "jobsData";

// Store a job, but only if URL doesn't exist already
export function setJobItem(key, value) {
  return getDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(JOBS_STORE, "readwrite");
      const store = tx.objectStore(JOBS_STORE);

      // Get all jobs and check if URL already exists
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        const existingJob = getAllReq.result.find(job => job.value.url === value.url);

        if (existingJob) {
          // URL already exists
          resolve({ key: existingJob.key, existing: true });
        } else {
          // Insert new job
          const putReq = store.put({ key, value });
          putReq.onsuccess = () => resolve({ key, existing: false });
          putReq.onerror = (event) => reject(event.target.error);
        }
      };

      getAllReq.onerror = (event) => reject(event.target.error);
    });
  });
}


// Get all jobs
export function getAllJobs() {
  return getDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(JOBS_STORE, "readonly");
      const store = tx.objectStore(JOBS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

// Update only the status field of a job
export function updateJobStatus(key, newStatus) {
  return getDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(JOBS_STORE, "readwrite");
      const store = tx.objectStore(JOBS_STORE);

      const getReq = store.get(key);

      getReq.onsuccess = () => {
        const record = getReq.result;
        if (!record) return reject(new Error(`Job with key ${key} not found`));

        record.value.status = newStatus;
        const putReq = store.put(record);

        putReq.onsuccess = () => resolve({ key, newStatus });
        putReq.onerror = (event) => reject(event.target.error);
      };

      getReq.onerror = (event) => reject(event.target.error);
    });
  });
}

// Get count of jobs by status
export function getJobStatusCounts() {
  return getDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(JOBS_STORE, "readonly");
      const store = tx.objectStore(JOBS_STORE);

      let index;
      try {
        index = store.index("statusIndex");
      } catch (e) {
        reject(new Error("statusIndex not found — make sure DB version is upgraded"));
        return;
      }

      const counts = { Applied: 0, "In Progress": 0, "Follow Up": 0, Rejected: 0, Offer: 0 };

      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const status = cursor.value.value.status;
          counts[status] = (counts[status] || 0) + 1;
          cursor.continue();
        } else {
          resolve(counts);
        }
      };

      request.onerror = (event) => reject(event.target.error);
    });
  });
}

