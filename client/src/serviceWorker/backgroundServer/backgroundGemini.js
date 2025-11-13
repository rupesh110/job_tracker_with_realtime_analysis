import { detailedAnalysis } from "../gemini/geminiDetailedAnalysis";
import { geminiCoverLetter } from "../gemini/geminiCoverLetter";
import { generateCoverLetter } from "../gemini/textConvert"; 

export async function handleGeminiMessage({ action, data, requestId }, port) {
  try {
    let result;

    switch (action) {
      case "Gemini_CallAnalysis":
        result = await detailedAnalysis(data);
        break;

      case "Gemini_CoverLetter":
        
        result = await geminiCoverLetter(data);
        await generateCoverLetter(result, "CoverLetter.pdf");
        break;

      default:
        //console.warn("Unknown Gemini action:", action);
        port.postMessage({ requestId, error: "Unknown Gemini action: " + action });
        return true; // handled, response sent
    }

    port.postMessage({ requestId, result });
    return true;
  } catch (err) {
    //console.error("Error in Gemini handler:", err);
    port.postMessage({ requestId, error: err.message });
    return true;
  }
}
