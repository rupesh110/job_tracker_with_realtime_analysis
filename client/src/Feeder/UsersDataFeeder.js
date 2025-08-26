import { safeSendMessage } from "./helper";

export async function isUserAvailable() {
  console.log("Feeder user data");
  try {
    const response = await safeSendMessage({ action: "User_isUserDataAvailable" });
    return response?.available === true;
  } catch (err) {
    console.warn("isUserAvailable failed:", err.message);
    return false; // fallback
  }
}

export async function getUserData() {
  console.log("Get users data");
  try {
    const response = await safeSendMessage({ action: "User_GetUserData" });
    return response || {};
  } catch (err) {
    console.warn("getUserData failed:", err.message);
    return {}; // fallback
  }
}

export async function setUserData(value) {
  console.log("Set users data:", value);
  try {
    const response = await safeSendMessage({ action: "User_SetUserData", data: value });
    return response || {};
  } catch (err) {
    console.warn("setUserData failed:", err.message);
    return {}; // fallback
  }
}
