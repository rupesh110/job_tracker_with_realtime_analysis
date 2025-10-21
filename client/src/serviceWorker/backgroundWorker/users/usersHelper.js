// --- Job Tracker WorkOS Login Flow ---
// Base API URL (update for production)
const API_BASE = "http://localhost:8080";

/**
 * Starts login by asking backend to create a session and open WorkOS login tab.
 */
export async function userLogin() {
  try {
    // 1️⃣ Start session on backend
    const res = await fetch(`${API_BASE}/auth/session/start`);
    const { session_id, login_url } = await res.json();

    if (!session_id || !login_url) {
      throw new Error("Backend did not return a session_id or login_url");
    }

    console.log("🌀 Starting WorkOS login session:", session_id);

    // 2️⃣ Open WorkOS login page in a new tab
    chrome.tabs.create({ url: login_url });
    console.log("🔑 Opened WorkOS login tab via:", login_url);

    // 3️⃣ Poll backend until login completes
    const userData = await pollForSession(session_id);

    // 4️⃣ Store credentials locally
    await chrome.storage.local.set(userData);

    console.log("✅ Logged in and saved user:", userData.email);
    return true;
  } catch (err) {
    console.error("❌ Failed to start sign-in:", err);
    return false;
  }
}

/**
 * Poll backend for session completion.
 * This checks /auth/session/:id every 2 seconds until complete.
 */
async function pollForSession(sessionId) {
  const maxAttempts = 60; // ~2 minutes
  const delay = 2000; // 2 seconds

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${API_BASE}/auth/session/${sessionId}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Session check failed");
    const data = await res.json();

    if (data.status === "complete") {
      // console.log("✅ Session complete!");
      // console.log("👤 Email:", data.email);
      // console.log("🔐 Access Token:", data.token); // <-- debug here
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
 * Reads stored user data (email + token) from chrome.storage.
 */
export async function getUserData() {
  const { email, token } = await chrome.storage.local.get(["email", "token"]);
  if (!token) {
    return { error: "Not logged in" };
  }
  return { email, token };
}

/**
 * Updates user data (if needed, e.g., preferences).
 */
export async function setUserData(data) {
  await chrome.storage.local.set(data);
  return data;
}
