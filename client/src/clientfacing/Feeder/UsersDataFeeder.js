// feederUsers.js
import { safeSendMessage } from "./MainFeeder";

export async function isUserDataAvailable() {
  try {
    const response = await safeSendMessage({ 
      action: "User_isUserDataAvailable" 
    });
    console.log("isUserDataAvailable response form frontend feeder:", response);
    return !!response
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
    console.log("setUserData called with value:", value);
    const response = await safeSendMessage({ action: "User_SetUserData", data: value });
    console.log("setUserData response from frontend feeder:", response);
    
    return response?.user || {};
  } catch (err) {
    // console.warn("setUserData failed:", err.message);
    return {};
  }
}
