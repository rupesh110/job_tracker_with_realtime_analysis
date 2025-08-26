// background.js
import { getUserData } from "./IndexedDbUsers.js";

/**
 * Calls Gemini API to analyze a resume against a job description.
 * @param {string} jobText - The job description text.
 * @returns {Promise<Object>} - JSON object with match score, strengths, gaps, and action steps.
 */
export async function callGemini(jobText) {
  console.log("From Gemini:", jobText)
  const usersData = await getUserData();
  const GEMINI_API_KEY = usersData.GeminiAPIKey;
  const resume = usersData.resume;

  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not found. Please add it in the settings.");
  }

  const prompt = `
You are an expert in resume optimization and ATS alignment. 
I will provide a job description and a resume. 

Perform your analysis in TWO STRICT STEPS:

Step 1 — Extract everything from the resume:
- List every programming language, framework, platform, cloud service, methodology, certificate, and project with dates.
- Quote each item verbatim from the resume. Do not infer or assume.

Step 2 — Compare to the job description:
- Identify every required skill or qualification in the JD.
- For each, classify as:
  - CLEAR (explicitly present in resume),
  - PARTIAL (mentioned but not well-detailed or quantified),
  - MISSING (no evidence at all).
- If MISSING, provide *exact example wording* to fix it.
- Weight CRITICAL skills more heavily than PREFERRED skills.
- Calculate matchScore out of 100 with weighting: 
  CRITICAL skills = 70%, PREFERRED skills = 30%.

Output strictly in this JSON structure:
{
  "matchScore": [0-100 integer],
  "summary": "[1–2 sentences of alignment analysis]",
  "strengths": [
    {"skill": "[Skill]", "evidence": "[Exact quote from resume]"}
  ],
  "gaps": [
    {"skill": "[Skill]", "priority": "[CRITICAL or PREFERRED]", "status": "[CLEAR / PARTIAL / MISSING]", "notes": "[Why it's a gap — quote resume if relevant, and give exact wording to fix it]"}
  ],
  "actionStep": "[1 high-impact improvement step]"
}

Job Description:
${jobText}

Resume:
${resume}

Respond only with a JSON object.
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  const data = await response.json();
  let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) throw new Error("No response from Gemini.");

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Attempt to extract JSON strictly from the text
      const cleaned = rawText
        .replace(/^```json\s*|\s*```$/g, "") // remove code fences
        .trim();

      // If the response has extra commentary around JSON, extract {...}
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in Gemini response");

      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.warn(`❌ Failed to parse Gemini JSON (attempt ${attempt}):`, rawText);

      if (attempt === maxRetries) {
        throw new Error("Gemini returned invalid JSON after multiple retries");
      }

      // Remove extra backticks or stray characters for next attempt
      rawText = rawText.replace(/```/g, "").trim();

      // Wait a bit before retrying
      await new Promise((res) => setTimeout(res, 500));
    }
  }
}
