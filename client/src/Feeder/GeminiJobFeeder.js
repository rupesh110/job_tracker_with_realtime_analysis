import { safeSendMessage } from "./helper";

export async function getGeminiAnalysis({data}) {
  try {
    const response = await safeSendMessage({ action: "Gemini_CallAnalysis", data });
    return response;
  } catch (err) {
    console.warn("getGeminiAnalysis failed:", err.message);
    return {}; // fallback to prevent breakage
  }
}
