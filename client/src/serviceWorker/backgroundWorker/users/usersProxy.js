import {
  userLogin,
  getUserData,
  setUserData,
  isUserDataAvailable,
} from "./usersHelper.js";

export async function handleUserMessage({ action, data, requestId }, port) {
  try {
    let result;

    switch (action) {
      /* ------------------------------------------------------
         ✅ Check user and auto-login if needed
      ------------------------------------------------------ */
      case "User_isUserDataAvailable": {
        let available = await isUserDataAvailable();
        
        if (!available) {
          console.log("⚠️ No user found — triggering login...");
          const loginSuccess = await userLogin();
          available = !!loginSuccess;
        }

        if (available) {
          const user = await getUserData();
          console.log("Fetched user data for validation:", user);
          const hasAuth = !!(user?.email && user?.token);
          const hasSetup = !!(user?.resume?.text && user?.geminiApiKey);

          available = hasAuth && hasSetup;

          console.log("🔍 User validation:", {
            hasAuth,
            hasSetup,
            available,
          });
        }

        result = available;
        break;
      }


      case "User_GetUserData": {
        const user = await getUserData();
        console.log("from background User_GetUserData:", user);
        result = { user };
        break;
      }

      /* ------------------------------------------------------
         ✅ Save/update user data
      ------------------------------------------------------ */
      case "User_SetUserData": {
        const user = await setUserData(data);
        result = { user };
        break;
      }

      /* ------------------------------------------------------
         ❌ Unknown action
      ------------------------------------------------------ */
      default:
        port.postMessage({
          requestId,
          error: "Unknown User action: " + action,
        });
        return;
    }

    port.postMessage({ requestId, result });
  } catch (err) {
    console.error("❌ Error in handleUserMessage:", err);
    port.postMessage({ requestId, error: err.message });
  }
}
