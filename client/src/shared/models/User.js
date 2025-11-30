/**
 * User Domain Model
 */

export function createUser(data = {}) {
  return {
    id: data.id || "",
    email: data.email || "",
    name: data.name || "",
    token: data.token || "",
    GeminiAPIKey: data.GeminiAPIKey || "",
    IsAPIKey: data.IsAPIKey || false,
    resume: data.resume || "",
    resumeName: data.resumeName || "",
    IsResume: data.IsResume || false,
    preferences: data.preferences || {},
    createdAt: data.createdAt || Date.now(),
    lastLogin: data.lastLogin || Date.now(),
  };
}

export function isAuthenticated(user) {
  return !!(user && user.token);
}

export function hasGeminiKey(user) {
  return !!(user && user.IsAPIKey && user.GeminiAPIKey);
}

export function hasResume(user) {
  return !!(user && user.IsResume && user.resume);
}