// background.js
import { getUserData } from "./IndexedDbUsers.js";

/**
 * Calls Gemini API to analyze a resume against a job description.
 * @param {string} jobText - The job description text.
 * @returns {Promise<Object>} - JSON object with match score, strengths, gaps, and action steps.
 */
export async function callGemini(jobText) {
  console.log("From Gemini:", await jobText)
  const usersData = await getUserData();
  const GEMINI_API_KEY = usersData.GeminiAPIKey;
  const resume = usersData.resume;

  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not found. Please add it in the settings.");
  }

  const prompt = `
  You are an expert in resume optimization, ATS alignment, and job-candidate matching. 
  I will provide a job description (JD) and a resume.

  Perform your analysis in TWO STRICT STEPS:

  Step 1 — Extract everything from the resume:
  - Identify and list all programming languages, frameworks, platforms, cloud services, databases, methodologies, certifications, and projects with dates.
  - Quote every item verbatim from the resume. Do not infer or assume anything beyond what is explicitly stated.
  - Group extracted items into categories: Languages, Frameworks, Platforms, Cloud/DevOps, Databases, Methodologies, Certifications, Projects.

  Step 2 — Compare extracted resume data to the job description:
  - Identify all required or preferred skills, technologies, and qualifications from the JD.
  - For each skill, classify as:
    - CLEAR: explicitly present in the resume,
    - PARTIAL: mentioned but lacks sufficient detail or context,
    - MISSING: not mentioned at all.
  - If MISSING, provide **exact wording** to add to the resume to address the gap.
  - Give higher weight to CRITICAL skills (70%) than PREFERRED skills (30%) when computing the overall matchScore.
  - Highlight the top 3–5 most critical requirements and how well the resume addresses them.

  Additionally — **Domain-Level Analysis (update only this part)**:
  - Group all JD skills into broader domains:
    - Technical domains: Frontend, Backend, Cloud/DevOps, Database, Testing, System Design
    - Non-technical domains: Client Handling, Customer Service, Project Management, Leadership, Communication
  - For each domain, provide:
    - requiredSkills: all JD skills in the domain
    - matchedSkills: skills present in the resume (include semantic matches, synonyms, or equivalent terminology)
    - matchPercentage = (matchedSkills ÷ requiredSkills × 100, integer)
  - Ensure only the domainMatch array is updated; do not modify strengths, gaps, or actionStep.

  Output strictly in this JSON structure (do not change it):
  {
    "matchScore": [0-100 integer],
    "summary": "[1–2 sentences of alignment analysis]",
    "analysis": {
      "domainMatch": [
        {
          "domain": "[Domain name]",
          "requiredSkills": ["Skill1", "Skill2"],
          "matchedSkills": ["Skill1"],
          "matchPercentage": [0-100 integer]
        }
      ]
    },
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

  await console.log("From Gemini:", rawText)
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
