import { detailedAnalysis } from "../gemini/geminiDetailedAnalysis";
import { geminiCoverLetter } from "../gemini/geminiCoverLetter";
import { generateCoverLetter } from "../gemini/textConvert"; // <-- our SW PDF function

export async function handleGeminiMessage({ action, data, requestId }, port) {
  try {
    let result;

    switch (action) {
      case "Gemini_CallAnalysis":
        result = await detailedAnalysis(data);
        console.log("From gemini_callNaalusis:", result)
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
