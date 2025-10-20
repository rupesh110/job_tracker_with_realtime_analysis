
export async function isUserDataAvailable() {
  try {
    const response = await fetch("http://localhost:8080/test");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json(); // or response.text() if plain text
    console.log("✅ API Response:", data);

    // Example logic — check if data contains something meaningful
    return data?.status === "ok";
  } catch (error) {
    console.error("❌ API call failed:", error);
    return false;
  }
}

export async function getUserData() {
    return { name: "Demo User", preferences: { theme: "dark" } };
}

export async function setUserData(data) {
    
    return data; 
}   