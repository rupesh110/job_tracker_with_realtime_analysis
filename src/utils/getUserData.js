const MY_EXTENSION_KEY = "REALTIMEANALYSISEXTENSION";

const DEFAULT_USER_DATA = {
  resume: "",
  resumeName: "",
  IsResume: false,
  GeminiAPIKey: "",
  IsAPIKey: false
};

export async function isUserDataAvailable() {
  const stored = localStorage.getItem(MY_EXTENSION_KEY);

  if (!stored) {
    localStorage.setItem(MY_EXTENSION_KEY, JSON.stringify(DEFAULT_USER_DATA));
    return false;
  }

  console.log(stored);
  try {
    const parsed = JSON.parse(stored);

    if (parsed.IsResume === true && parsed.IsAPIKey === true) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("Corrupted user data:", err);
    localStorage.setItem(MY_EXTENSION_KEY, JSON.stringify(DEFAULT_USER_DATA));
    return false;
  }
}
