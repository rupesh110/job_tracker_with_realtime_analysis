import { getUserData, setUserData } from "../data/config.js";
import {DEFAULT_USER_DATA } from "../models/userData.js"

export async function isUserDataAvailable() {
  const stored = await getUserData();

  if (!stored || Object.keys(stored).length === 0) {
    console.log("User data not found, initializing with default data");
    await setUserData(DEFAULT_USER_DATA);  // await saving default data
    return false;
  }

  try {
    if (stored.IsResume === true && stored.IsAPIKey === true) {
      return true;
    }
    return false;
  } catch (err) {
    console.error("Corrupted user data:", err);
    await setUserData(DEFAULT_USER_DATA);  // reset with default data on error
    return false;
  }
}
