import { isUserDataAvailable, getUserData, setUserData } from "./IndexedDbUsers.js";

export function handleUserMessage(request, sender, sendResponse) {
  switch (request.action) {
    case "User_isUserDataAvailable": {
      console.log("User_isUserDataAvailable");
      isUserDataAvailable()
        .then(available => sendResponse({ available }))
        .catch(err => sendResponse({ status: "error", error: err.message }));
      return true; // keep the port open for async response
    }

    case "User_GetUserData": {
      console.log("User_GetUserData");
      getUserData()
        .then(user => sendResponse({ user }))
        .catch(err => sendResponse({ status: "error", error: err.message }));
      return true; // keep the port open for async response
    }

    case "User_SetUserData": {
      console.log("User_SetUserData");
      setUserData(request.data)
        .then(user => sendResponse({ user }))
        .catch(err => sendResponse({ status: "error", error: err.message }));
      return true; // keep the port open for async response
    }


    default:
      console.warn("Unknown User action:", request.action);
      sendResponse({ status: "error", error: "Unknown User action" });
      return false; // no async operation here
  }
}
