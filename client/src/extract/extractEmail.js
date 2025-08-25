export async function extractMailData() {
  const fullText = document.body.innerText.toLowerCase(); // normalize text
  console.log("From email: ", fullText);

  // 1. Extract company name
  // Look for common patterns like "at <company>" or sender email domain
  let company = null;
  const companyMatch = fullText.match(/apply for .* at ([\w\s]+)/i);
  if (companyMatch) {
    company = companyMatch[1].trim();
  } else {
    // fallback: extract domain from "from:" line
    const fromMatch = fullText.match(/from\s*[:]?[\s\S]*<.*@([\w-]+)\./i);
    if (fromMatch) company = fromMatch[1];
  }

  // 2. Extract job title
  // Look for "apply for <title> at <company>"
  let title = null;
  const titleMatch = fullText.match(/apply for (.*?) at [\w\s]+/i);
  if (titleMatch) title = titleMatch[1].trim();

  // 3. Determine status
  let status = "applied"; // default
  if (/regret|not moving forward|decided to move forward with other candidates|we won'?t be moving forward/i.test(fullText)) {
    status = "rejected";
  } else if (/interview|next phase|phone call|technical assessment/i.test(fullText)) {
    status = "interview";
  }

  return { company, title, status };
}
