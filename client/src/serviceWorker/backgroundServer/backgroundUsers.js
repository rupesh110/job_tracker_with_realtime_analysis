// backgroundUsers.js
import { isUserDataAvailable, getUserData, setUserData } from "../dbServer/IndexedDbUsers";

export async function handleUserMessage({ action, data, requestId }, port) {
  try {
    let result;

    switch (action) {
      case "User_isUserDataAvailable": {
        const available = await isUserDataAvailable();
        await console.log("from background User_isUserDataAvailable:", {available})
        result = { available }; // ✅ always inside result
        break;
      }

      case "User_GetUserData": {
        const user = await getUserData();
        await console.log("from background User_GetUserData:", {user})
        result = { user }; // ✅ always inside result
        break;
      }

      case "User_SetUserData": {
        const user = await setUserData(data);
        result = { user }; // ✅ always inside result
        break;
      }

      default:
        port.postMessage({ requestId, error: "Unknown User action: " + action });
        return;
    }


    port.postMessage({ requestId, result });
  } catch (err) {
    console.error("Error in User handler:", err);
    port.postMessage({ requestId, error: err.message });
  }
}
