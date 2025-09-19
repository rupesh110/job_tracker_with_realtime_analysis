// backgroundUsers.js
import { isUserDataAvailable, getUserData, setUserData } from "../dbServer/IndexedDbUsers";

export function handleUserMessage(request, sender, sendResponse) {
  switch (request.action) {
    case "User_isUserDataAvailable":
      isUserDataAvailable()
        .then((available) => sendResponse({ available }))
        .catch((err) => sendResponse({ status: "error", error: err.message }));
      return true;

    case "User_GetUserData":
      getUserData()
        .then((user) => sendResponse({ user: user || {} }))
        .catch((err) => sendResponse({ status: "error", error: err.message }));
      return true;

    case "User_SetUserData":
      setUserData(request.data)
        .then((user) => sendResponse({ user: user || {} }))
        .catch((err) => sendResponse({ status: "error", error: err.message }));
      return true;

    default:
      sendResponse({ status: "error", error: "Unknown User action" });
      return false;
  }
}
