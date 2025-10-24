import { detailedAnalysis } from "./geminiDetailedAnalysis";
import { geminiCoverLetter } from "./geminiCoverLetter";
import { generateCoverLetter } from "./textConvert"; // <-- our SW PDF function

export async function handleGeminiMessage({ action, data, requestId }, port) {
  try {
    let result;

    switch (action) {
      case "Gemini_CallAnalysis":
        console.log("Handling Gemini_CallAnalysis action with data:", data);
        result = await detailedAnalysis(data);
        
        break;

      case "Gemini_CoverLetter":
        
        result = await geminiCoverLetter(data);
        

        // ✅ Generate PDF and download directly from Service Worker
        await generateCoverLetter(result, "CoverLetter.pdf");
        break;

      default:
        //console.warn("Unknown Gemini action:", action);
        port.postMessage({ requestId, error: "Unknown Gemini action: " + action });
        return true; // handled, response sent
    }

    // Send back the result (text only, PDF already downloaded)
    port.postMessage({ requestId, result });
    return true;
  } catch (err) {
    //console.error("Error in Gemini handler:", err);
    port.postMessage({ requestId, error: err.message });
    return true;
  }
}
