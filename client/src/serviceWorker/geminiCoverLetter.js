import { getUserData } from "./IndexedDbUsers.js";

/**
 * Generate a fully formatted plain text cover letter using Gemini.
 * Extract user info directly from resume, include subject, date, bullets, and spacing.
 * @param {Object} jobData - The job posting data object
 * @returns {Promise<string>} - Fully formatted plain text cover letter
 */
export async function geminiCoverLetter(jobData) {
  const usersData = await getUserData();
  const GEMINI_API_KEY = usersData.GeminiAPIKey;
  const resume = usersData.resume;

  if (!GEMINI_API_KEY) throw new Error("Gemini API key not found.");

  // Extract name, phone, email, and LinkedIn URL from resume
  const nameMatch = resume.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
  const phoneMatch = resume.match(/(\+?\d[\d\s\-]{8,}\d)/);
  const emailMatch = resume.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const linkedInMatch = resume.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s)]+/i);

  const fullName = nameMatch ? nameMatch[0] : "";
  const phone = phoneMatch ? phoneMatch[0] : "";
  const email = emailMatch ? emailMatch[0] : "";
  const linkedInUrl = linkedInMatch ? linkedInMatch[0] : "";

  // Today's date
  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const prompt = `
Generate a professional, single-page cover letter for the role "${jobData.title}" at "${jobData.company}".
Use the following job description to understand responsibilities, company, and location:
${JSON.stringify(jobData, null, 2)}

Use the following resume to extract all personal info (full name, email, phone, LinkedIn URL) and relevant experience/achievements:
${resume}

STRICT RULES:
1. At the top, include:
[Full Name]  
[Phone]  
[Email]  
${linkedInUrl ? `[${linkedInUrl}]` : ""}

${today}  
[Hiring Manager or Hiring Team]  
[Company Name]  
[Company Location]  

2. Include a **Subject line**:  
Subject: Application for ${jobData.title}

3. Write 2–3 tailored paragraphs describing your experience, skills, and how they match the job description. **Do not use placeholders**. If a detail is unknown, omit it.  

4. Include 3 bullets describing key skills or achievements from the resume that are relevant to the role, **2–3 lines each**, directly referencing your actual work experience. Example format:  
• Bullet 1: [Describe achievement or skill from resume, 2–3 lines]  
• Bullet 2: [Describe achievement or skill from resume, 2–3 lines]  
• Bullet 3: [Describe achievement or skill from resume, 2–3 lines]  

5. End with:
Sincerely,  
[Full Name]  
[Email]  
${linkedInUrl ? `[${linkedInUrl}]` : ""} 

6. STRICT Formatting rules and rules:
- Replace ALL placeholders. **Do not leave any brackets or hints.**
- If you don't have the hiring manager's name, use "Hiring Team".
- If specific details (like job board or project name) are unknown, omit that sentence completely.
- Do not invent personal info; use only what is provided above.
- Estimate years of experience from resume if not explicit.
- If skills are not mentioned on resume don't mention that in cover letter but you can add as if like transferable skills present in that way
- Use clean bullets ("• ") only.
- Keep spacing professional: one blank line between sections, one blank line after each paragraph.
- Output must be ready-to-use text, no brackets, no hints, no placeholders.

Ensure the letter is **ready to send**, factual, aligned with the job description, and clearly showcases your achievements and skills.
`;


  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 },
      }),
    }
  );

  const data = await response.json();
  let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) throw new Error("No response from Gemini.");

  // Cleanup
  rawText = rawText
    .replace(/^```(?:json|text)?\s*/i, "")
    .replace(/```$/i, "")
    .trim()
    .replace(/\\n/g, "\n")
    .replace(/\*\s+/g, "• ")
    .replace(/\n{3,}/g, "\n\n");

  return rawText;
}
