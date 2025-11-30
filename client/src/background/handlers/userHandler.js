import {
  userLogin,
  getUserData,
  setUserData,
  isUserDataAvailable,
} from "@services/userService.js";

export async function handleUserMessage({ action, data, requestId }, port) {
  try {
    let result;
    switch (action) {
    
      case "User_isUserDataAvailable": {
        let available = await isUserDataAvailable();
        
        if (!available) {
          const loginSuccess = await userLogin();
          available = !!loginSuccess;
        }

        if (available) {
          const user = await getUserData();
          const hasAuth = !!(user?.email && user?.token);
          const hasSetup = !!(user?.resume?.text && user?.geminiApiKey);

          available = hasAuth && hasSetup;
        }

        result = available;
        break;
      }

      case "User_GetUserData": {
        const user = await getUserData();
        result = { user };
        break;
      }

      case "User_SetUserData": {
        const user = await setUserData(data);
        result = { user };
        break;
      }

      default:
        port.postMessage({
          requestId,
          error: "Unknown User action: " + action,
        });
        return;
    }

    port.postMessage({ requestId, result });
  } catch (err) {
    port.postMessage({ requestId, error: err.message });
  }
}
