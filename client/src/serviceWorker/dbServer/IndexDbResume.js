
import {getDB} from "./IndexDb.js"

const RESUME_STORE = "resumeData";


export async function getPDFBlob() {
  const db = await getDB();
  const tx = db.transaction("usersResume", "readonly");
  const store = tx.objectStore("usersResume");
  const record = await store.get("resumePDF");
  return record?.blob || null;
}
// Save PDF Blob in resumeData
export async function saveResumeBlob(file) {
  //console.log("From resume storage:", file);
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RESUME_STORE, "readwrite");
    const store = tx.objectStore(RESUME_STORE);

    const request = store.put(file, "resumePDF");

    request.onsuccess = () => {
      //console.log("✅ Resume saved in IndexedDB");
      resolve();
    };

    request.onerror = () => {
      console.error("❌ Failed to save resume:", request.error);
      reject(request.error);
    };
  });
}

// Get PDF Blob from resumeData
export async function getResumeBlob() {
  const db = await getDB();
  const tx = db.transaction(RESUME_STORE, "readonly");
  const store = tx.objectStore(RESUME_STORE);
  const file = await store.get("resumePDF");
  return file || null;
}

// Remove PDF (if needed)
export async function clearResumeBlob() {
  const db = await getDB();
  const tx = db.transaction(RESUME_STORE, "readwrite");
  const store = tx.objectStore(RESUME_STORE);
  await store.delete("resumePDF");
}
