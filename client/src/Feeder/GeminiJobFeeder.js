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


export async function getCoverLetter(data) {
  console.log("from feeder:", JSON.stringify(data))
  try {
    const response = await safeSendMessage({ action: "Gemini_CoverLetter", data });
    return response;
  } catch (err) {
    console.warn("Gemini_CoverLetter failed:", err.message);
    return {}; // fallback to prevent breakage
  }
}
