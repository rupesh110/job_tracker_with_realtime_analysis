const GEMINI_API_KEY = "AIzaSyD2Trat6hWCKwRmrE0xTuBhvK5P37OrJns"; 

export async function callGemini(jobText) {
  const prompt = `
You are an assistant that reviews job posts. Analyze the job description below and return a JSON object with the following fields:

- "summary": A short summary of the job in plain English in 100 words.
- "key_requirements": A list of 3–5 major requirements or responsibilities.
- "is_junior_friendly": true or false — based on whether the job suits a junior developer.
- "reasoning": Why you think it's junior friendly or not.

Here is the job description:
${jobText}

Respond only with a valid JSON object.
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

  if (!rawText) {
    throw new Error("No response from Gemini.");
  }

  try {
    const cleanedText = rawText.replace(/^```json\s*|\s*```$/g, "");
    return JSON.parse(cleanedText); // ✅ Return only the JSON result
  } catch (err) {
    console.error("❌ Failed to parse Gemini JSON:", rawText);
    throw new Error("Gemini returned invalid JSON");
  }
}
