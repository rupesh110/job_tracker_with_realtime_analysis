
export async function isUserDataAvailable() {
  try {
    // ✅ Opens a tab to your Go backend login route (triggers WorkOS AuthKit)
    chrome.tabs.create({ url: "http://localhost:8080/auth/login" });

    console.log("🔑 Triggered sign-in test via new tab");
    return true;
  } catch (error) {
    console.error("❌ Failed to start sign-in test:", error);
    return false;
  }
}


export async function getUserData() {
    return { name: "Demo User", preferences: { theme: "dark" } };
}

export async function setUserData(data) {
    
    return data; 
}   