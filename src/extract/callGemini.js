export async function callGemini(jobText) {
  const STORAGE_KEY = "REALTIMEANALYSISEXTENSION";
  const userDataRaw = localStorage.getItem(STORAGE_KEY);
  const userData = userDataRaw ? JSON.parse(userDataRaw) : {};
  const GEMINI_API_KEY = userData.GeminiAPIKey;

  console.log(GEMINI_API_KEY)
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not found. Please add it in the settings.");
  }

  const resume = userData.resume || "";

  const prompt = `
    I need help finding job opportunities in Australia for a candidate with the following resume.
        Please provide links to job boards with current listings, suggest relevant search terms to use on those job boards,
        and identify specific companies that might be hiring. Also, please summarize the types of roles that would be a good fit,
        and industries that are actively hiring for these roles in Australia.

        Here is the candidate's resume:
  ${resume}
--- RESUME TEXT END --

--- JOB DESCRIPTION START ---

${jobText}

--- JOB DESCRIPTION END ---


Respond only with a JSON object.
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log("Gemini:",data)
  if (!rawText) throw new Error("No response from Gemini.");

  try {
    const cleaned = rawText.replace(/^```json\s*|\s*```$/g, "");
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Failed to parse Gemini JSON:", rawText);
    throw new Error("Gemini returned invalid JSON");
  }
}
