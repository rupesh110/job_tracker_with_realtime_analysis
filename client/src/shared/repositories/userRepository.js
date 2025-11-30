/**
 * User Repository
 */

import * as db from "./db/indexedDb.js";
import { DB_CONFIG, API_CONFIG } from "../config/index.js";
import { createUser } from "../models/User.js";

const STORE_NAME = DB_CONFIG.STORES.USERS;
const USER_ID = "current";

export async function saveToLocal(userData) {
  const existing = await getFromLocal();
  
  const merged = {
    id: USER_ID,
    ...existing,
    ...userData,
    resume: {
      ...(existing?.resume || {}),
      ...(userData?.resume || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  await db.put(STORE_NAME, merged);
  return merged;
}

export async function getFromLocal() {
  const user = await db.get(STORE_NAME, USER_ID);
  return user || createUser();
}

export async function clearLocal() {
  await db.remove(STORE_NAME, USER_ID);
}