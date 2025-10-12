export function parseGeminiCoverLetter(rawText) {
if (!rawText) return null;

try {
    // Remove ```json and ``` from the string
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    // Parse the JSON string
    const parsed = JSON.parse(cleaned);

    // Return the structured cover letter object
    return parsed.cover_letter;
} catch (err) {
    //console.error("Failed to parse Gemini cover letter JSON:", err);
    return null;
}
}