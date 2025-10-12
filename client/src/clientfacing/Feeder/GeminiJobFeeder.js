import { safeSendMessage } from "./MainFeeder";

export async function getGeminiAnalysis({ data }) {
  try {
    const response = await safeSendMessage({ action: "Gemini_CallAnalysis", data });

    return response;
  } catch (err) {
    //console.warn("getGeminiAnalysis failed:", err.message);
    return {}; // fallback
  }
}

export async function getCoverLetter(data) {
  try {
    const response = await safeSendMessage({ action: "Gemini_CoverLetter", data });
    return response;
  } catch (err) {
    //console.warn("getCoverLetter failed:", err.message);
    return {}; // fallback
  }
}