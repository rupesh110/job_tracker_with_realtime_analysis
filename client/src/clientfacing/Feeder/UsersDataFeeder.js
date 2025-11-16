// feederUsers.js
import { safeSendMessage } from "./MainFeeder";

export async function isUserDataAvailable() {
  try {
    const response = await safeSendMessage({ 
      action: "User_isUserDataAvailable" 
    });
    return !!response
    console.log("User_isueserdata")
  } catch (err) {
    return false;
  }
}

export async function getUserData() {
  try {
    const response = await safeSendMessage({ 
      action: "User_GetUserData" 
    });
    
    return response?.user || {};
  } catch (err) {
    // console.warn("getUserData failed:", err.message);
    return {};
  }
}

export async function setUserData(value) {
  try {
    const response = await safeSendMessage({ action: "User_SetUserData", data: value });    
    return response?.user || {};
  } catch (err) {
    // console.warn("setUserData failed:", err.message);
    return {};
  }
}
