import { getUserData } from "../dbServer/IndexedDbUsers.js";


export async function sanitizeJobDescription(jobsDetailsText) {


  const usersData = await getUserData();
  const GEMINI_API_KEY = usersData.GeminiAPIKey;

  if (!GEMINI_API_KEY) throw new Error("Gemini API key not found.");
  if (!jobsDetailsText) throw new Error("Job details text is required.");

  const prompt = `
You are an assistant that extracts structured job data from a raw job posting.

Extract the following fields in JSON format:

{
  "title": "",
  "company": "",
  "location": "",
  "workType": "",
  "description": ""
}

Job posting text:
"""
${jobsDetailsText}
"""
Only return valid JSON with these keys. Do not add extra text.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0 },
      }),
    }
  );

  const data = await response.json();
  let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;


  if (!rawText) throw new Error("No response from Gemini.");

  // Clean and parse JSON
  rawText = rawText.replace(/^```(?:json|text)?\s*/i, "").replace(/```$/i, "").trim();

  let jobData;
  try {
    jobData = JSON.parse(rawText);
  } catch (err) {
    throw new Error("Failed to parse Gemini output as JSON: " + err.message + "\nOutput was:\n" + rawText);
  }

  return jobData;
}
