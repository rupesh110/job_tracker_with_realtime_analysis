// --- Job Tracker WorkOS Login Flow ---

import { getUserDataDB, setUserDataDB, clearUserDataDB } from "./userDb.js";

const API_BASE =  "https://jobtracker-backend-299028719782.australia-southeast1.run.app/api"
//const API_BASE =  "http://localhost:8080/api"

/**
 * Starts login by asking backend to create a session and open WorkOS login tab.
 */
export async function userLogin() {
  try {
    const res = await fetch(`${API_BASE}/auth/session/start`);
    const { session_id, login_url } = await res.json();

    if (!session_id || !login_url) {
      throw new Error("Backend did not return a session_id or login_url");
    }

    chrome.tabs.create({ url: login_url });

    const userData = await pollForSession(session_id);
    await setUserDataDB(userData);

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Poll backend for session completion.
 */
async function pollForSession(sessionId) {
  const maxAttempts = 60;
  const delay = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${API_BASE}/auth/session/${sessionId}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Session check failed");
    const data = await res.json();

    if (data.status === "complete") {
      return { email: data.email, token: data.token };
    }

    if (data.status === "error") {
      throw new Error("Login failed");
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error("Login timed out");
}

/**
 * Reads stored user data from IndexedDB.
 */
export async function getUserData() {
  const userData = await getUserDataDB();
  console.log("from getUSer data:", userData)
  if (!userData || !userData.token) {
    return { error: "Not logged in" };
  }
  return userData;
}

/**
 * Updates user data (e.g., preferences).
 */
export async function setUserData(data) {
  await setUserDataDB(data);
  return data;
}

/**
 * Checks if user data is available.
 */
export async function isUserDataAvailable() {
   console.log("from users data from usershelper:")
  const userData = await getUserDataDB();
 
  return !!(userData && userData.token);
}

/**
 * Clears user data (logout)
 */
export async function clearUserData() {
  await clearUserDataDB();
}
