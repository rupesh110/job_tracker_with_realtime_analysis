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
    You are a strict resume analysis tool. Your task is to compare the resume and the job description by extracting and comparing key skills only.

    Here’s what you must do:
    1. Extract all **technical** and **soft skills** from the resume.
    2. Extract all **required skills** from the job description.
    3. Normalize common aliases.
    4. Match skills using **case-insensitive**.
    5. DO NOT invent skills that are not mentioned.
    6. Get the domain of company or which team yu are supposed to work with

    Then, output this as a valid JSON object:

    {
      "job_skills": [...], top 5 skills
      "missing_skills": [...], top 5 skills
      "match_percentage": number,  // percent of job_skills found in resume_skills,
      "domain: 
    }

  --- RESUME TEXT START ---
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
  //console.log(data)
  if (!rawText) throw new Error("No response from Gemini.");

  try {
    const cleaned = rawText.replace(/^```json\s*|\s*```$/g, "");
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Failed to parse Gemini JSON:", rawText);
    throw new Error("Gemini returned invalid JSON");
  }
}
