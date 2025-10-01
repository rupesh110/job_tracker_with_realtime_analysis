import { detailedAnalysis } from "../gemini/geminiDetailedAnalysis";
import { geminiCoverLetter } from "../gemini/geminiCoverLetter";

export async function handleGeminiMessage({ action, data, requestId }, port) {
  try {
    let result;

    switch (action) {
      case "Gemini_CallAnalysis":
        result = await detailedAnalysis(data);
        console.log("From backgorund gemini:", result)
        break;

      case "Gemini_CoverLetter":
        result = await geminiCoverLetter(data);
        console.log("From backgorund cover lettter:", result)
        break;

      default:
        console.warn("Unknown Gemini action:", action);
        port.postMessage({ requestId, error: "Unknown Gemini action: " + action });
        return true; // handled, response sent
    }

    // Send back the result
    port.postMessage({ requestId, result });
    return true;
  } catch (err) {
    console.error("Error in Gemini handler:", err);
    port.postMessage({ requestId, error: err.message });
    return true;
  }
}
