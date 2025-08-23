export async function isUserAvailable() {
  console.log("Feeder user data");
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "User_isUserDataAvailable" }, (response) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(response?.available === true);
    });
  });
}


export async function getUserData() {
  console.log("Get users data");
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "User_GetUserData" }, (response) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(response || {});
    });
  });
}

export async function setUserData(value) {
  console.log("Set users data:", value);
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "User_SetUserData", data: value }, (response) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(response || {});
    });
  });
}
