// --- Job Tracker WorkOS Login Flow ---

import { getUserDataDB, setUserDataDB, clearUserDataDB } from "./userDb.js";

const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:8080/api"
    : "https://jobtracker-backend-299028719782.australia-southeast1.run.app/api";


/**
 * Starts login by asking backend to create a session and open WorkOS login tab.
 */
export async function userLogin() {
  console.log("🔐 Initiating user login...");
  try {
    const res = await fetch(`${API_BASE}/auth/session/start`);
    const { session_id, login_url } = await res.json();

    if (!session_id || !login_url) {
      throw new Error("Backend did not return a session_id or login_url");
    }

    console.log("🌀 Starting WorkOS login session:", session_id);
    chrome.tabs.create({ url: login_url });

    const userData = await pollForSession(session_id);

    // ✅ Store in IndexedDB
    await setUserDataDB(userData);

    console.log("✅ Logged in and saved user:", userData.email);
    return true;
  } catch (err) {
    console.error("❌ Failed to start sign-in:", err);
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
  if (!userData || !userData.token) {
    return { error: "Not logged in" };
  }
  return userData;
}

/**
 * Updates user data (e.g., preferences).
 */
export async function setUserData(data) {
  console.log("Updating user data in IndexedDB:", data);
  await setUserDataDB(data);
  return data;
}

/**
 * Checks if user data is available.
 */
export async function isUserDataAvailable() {
  const userData = await getUserDataDB();
  console.log("User data availability check:", userData);
  return !!(userData && userData.token);
}

/**
 * Clears user data (logout)
 */
export async function clearUserData() {
  await clearUserDataDB();
  console.log("🧹 Cleared user data from IndexedDB");
}
