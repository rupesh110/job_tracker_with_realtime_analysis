import { safeSendMessage } from "./helper";

export async function isUserAvailable() {
  try {
    const response = await safeSendMessage({ action: "User_isUserDataAvailable" });
    return response?.available === true;
  } catch (err) {
    console.warn("isUserAvailable failed:", err.message);
    return false; 
  }
}

export async function getUserData() {
  try {
    const response = await safeSendMessage({ action: "User_GetUserData" });
    return response || {};
  } catch (err) {
    console.warn("getUserData failed:", err.message);
    return {}; 
  }
}

export async function setUserData(value) {
  try {
    const response = await safeSendMessage({ action: "User_SetUserData", data: value });
    return response || {};
  } catch (err) {
    console.warn("setUserData failed:", err.message);
    return {}; 
  }
}
