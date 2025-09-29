// feederUsers.js
import { safeSendMessage } from "./MainFeeder";

export async function isUserAvailable() {
  try {
    const response = await safeSendMessage({ action: "User_isUserDataAvailable" });
    await console.log("Response from isUserAvailable:", {response});
    return response?.available === true;
  } catch (err) {
    console.warn("isUserAvailable failed:", err.message);
    return false;
  }
}

export async function getUserData() {
  try {
    const response = await safeSendMessage({ action: "User_GetUserData" });
    console.log("Response from getUserData:", response);
    return response?.user || {};
  } catch (err) {
    console.warn("getUserData failed:", err.message);
    return {};
  }
}

export async function setUserData(value) {
  try {
    const response = await safeSendMessage({ action: "User_SetUserData", data: value });
    console.log("Response from setUserData:", response);
    return response?.user || {};
  } catch (err) {
    console.warn("setUserData failed:", err.message);
    return {};
  }
}
