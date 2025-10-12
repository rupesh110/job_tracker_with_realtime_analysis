// background.js
import { getUserData } from "../dbServer/IndexedDbUsers.js";
;

/**
 * Calls Gemini API to analyze a resume against a job description.
 * @param {string} jobText - The job description text.
 * @returns {Promise<Object>} - JSON object with match score, strengths, gaps, and action steps.
 */
export async function detailedAnalysis({ jobTitle, jobDescription }) {
  
  const usersData = await getUserData();
  const GEMINI_API_KEY = usersData.GeminiAPIKey;
  const resume = usersData.resume;


  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not found. Please add it in the settings.");
  }

  const prompt = `
  You are an expert in resume optimization, ATS alignment, and job-candidate matching. 
  I will provide a job description (JD) and a resume.

  Perform your analysis in THREE STRICT STEPS and include all results in a single JSON object:

  Step 1 — Title Analysis:
  - Extract the main job title from the JD.
  - Extract the most relevant title or role from the resume (if available).
  - Determine if the resume title is closely related to the job title.
  - Provide a recommendation:
    - If related: "Run full analysis"
    - If unrelated: suggest certifications, courses, or degrees from university that could help improve alignment.

  Step 2 — Resume Extraction:
  - Identify and list all programming languages, frameworks, platforms, cloud services, databases, methodologies, certifications, and projects with dates.
  - Quote every item verbatim from the resume.
  - Group extracted items into categories: Languages, Frameworks, Platforms, Cloud/DevOps, Databases, Methodologies, Certifications, Projects.
  - Identify Domain-Level Analysis :
    - Group JD skills into broader domains such as:
      - Technical
      - Non-technical
    - For each domain:
      - requiredSkills: most important JD skills in the domain
      - matchedSkills: skills present in the resume (include synonyms/equivalents)
      - matchPercentage = (matchedSkills ÷ requiredSkills × 100, integer)

  Step 3 — Skill Comparison:
  - Identify all required or preferred skills, technologies, and qualifications from the JD.
  - For each skill, classify as:
    - CLEAR: explicitly present in the resume
    - PARTIAL: mentioned but lacks sufficient detail
    - MISSING: not mentioned at all
  - If MISSING, provide **exact wording** to add to the resume.
  - Give higher weight to CRITICAL skills (70%) than PREFERRED skills (30%) for matchScore.
  - Highlight the top 3–5 most critical requirements and how well the resume addresses them.

  Output strictly in this JSON structure:

  {
    "titleAnalysis": {
      "jobTitle": "[Extracted job title from JD]",
      "resumeTitle": "[Extracted title from resume]",
      "related": [true/false],
      "recommendation": "[Actionable suggestion if unrelated]"
    },
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
      {"skill": "[Skill]", "priority": "[CRITICAL or PREFERRED]", "status": "[CLEAR / PARTIAL / MISSING]", "notes": "[Quote resume if relevant and provide exact wording to fix]"}
    ],
    "actionStep": "[1 high-impact improvement step]"
  }

  Job Title
  ${jobTitle} || 'N/A'

  Job Description:
  ${jobDescription}

  Resume:
  ${resume}

  Respond only with a JSON object.
  `;


  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }],
       generationConfig: {
        temperature: 0.4,
      } 
    }),
    }
  );

  const data = await response.json();
  let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  


  if (!rawText) throw new Error("No response from Gemini.");

  const maxRetries = 5;

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
      //console.warn(`❌ Failed to parse Gemini JSON (attempt ${attempt}):`, rawText);

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
