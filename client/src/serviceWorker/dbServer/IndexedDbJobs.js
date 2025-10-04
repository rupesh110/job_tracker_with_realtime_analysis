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
export function updateJobStatus(key, newStatus, updatedDate) {
  const today = new Date();
  const formattedDate = updatedDate || 
    `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  console.log("Updating job status:", key, newStatus, formattedDate);

  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(JOBS_STORE, "readwrite");
      const store = tx.objectStore(JOBS_STORE);

      const getReq = store.get(key);
      getReq.onsuccess = () => {
        const record = getReq.result;
        if (!record) return reject(new Error(`Job with key ${key} not found`));

        record.value.status = newStatus;
        record.value.date = formattedDate;

        const putReq = store.put(record);

        putReq.onsuccess = () => {
          console.log("Update successful:", record);
          resolve(record);
        };
        putReq.onerror = (event) => reject(event.target.error);
      };

      getReq.onerror = (event) => reject(event.target.error);
    });
  });
}

export function updateJobNotes(key, notes) {
  console.log("Updating job notes:", key, notes);

  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(JOBS_STORE, "readwrite");
      const store = tx.objectStore(JOBS_STORE);

      const getReq = store.get(key);
      getReq.onsuccess = () => {
        const record = getReq.result;
        if (!record) return reject(new Error(`Job with key ${key} not found`));

        record.value.notes = notes;
        const putReq = store.put(record);

        putReq.onsuccess = () => {
          console.log("Update successful:", record);
          resolve(record);
        };
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
      const tx = db.transaction(JOBS_STORE, "readwrite"); // readwrite to update Follow Up
      const store = tx.objectStore(JOBS_STORE);

      let index;
      try {
        index = store.index("statusIndex");
      } catch (e) {
        reject(new Error("statusIndex not found — make sure DB version is upgraded"));
        return;
      }

      const counts = {
        Applied: 0,
        "In Progress": 0,
        "Follow Up": 0,
        Rejected: 0,
        Offer: 0,
        Unknown: 0
      };

      const IN_PROGRESS_STATUSES = ["Recruiters call", "1st Round", "Interview"];
      const FOLLOW_UP_THRESHOLD_DAYS = 21; // 3 weeks

      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const jobEntry = cursor.value;
          const job = jobEntry.value;
          let status = job.status || "Unknown";

          if (IN_PROGRESS_STATUSES.includes(status)) {
            counts["In Progress"] += 1;
          } else if (status === "Applied") {
            if (job.date) {
              const appliedDate = new Date(job.date.split("/").reverse().join("-"));
              const now = new Date();
              const diffDays = (now - appliedDate) / (1000 * 60 * 60 * 24);

              if (diffDays > FOLLOW_UP_THRESHOLD_DAYS) {
                counts["Follow Up"] += 1;

                // update job status in IndexedDB
                job.status = "Follow Up";
                const putReq = store.put(jobEntry);
                putReq.onerror = (err) => console.error("Failed to update Follow Up:", err.target.error);
              } else {
                counts["Applied"] += 1;
              }
            } else {
              counts["Applied"] += 1;
            }
          } else if (status === "Follow Up") {
            counts["Follow Up"] += 1;
          } else if (["Offer", "Rejected"].includes(status)) {
            counts[status] += 1;
          } else {
            counts["Unknown"] += 1;
          }

          cursor.continue();
        } else {
          resolve(counts);
        }
      };

      request.onerror = (event) => reject(event.target.error);
    });
  });
}
