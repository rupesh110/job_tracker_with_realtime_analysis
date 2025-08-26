import { detectWorkType } from "./helper.js";

export async function extractSeekData() {
  // Basic elements
  const titleEl = document.querySelector('[data-automation="job-detail-title"]');
  const companyEl = document.querySelector('[data-automation="advertiser-name"]');
  const locationEl = document.querySelector('[data-automation="job-detail-location"]');
  const descriptionEl = document.querySelector('[data-automation="job-description"]');

  if (!titleEl) {
    console.log("No title element found. Skipping extraction.");
    return null;
  }

  // Format today's date
  const dateObj = new Date();
  const formattedDate = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`;

  // Extract full text from body for work type detection
  const fullText = document.body.innerText.toLowerCase();

  // Construct job data
  const jobData = {
    title: titleEl.innerText.trim() || "Unknown",
    company: companyEl?.childNodes[0]?.nodeValue?.trim() || companyEl?.innerText?.trim() || "Unknown",
    location: locationEl?.innerText.trim() || "Unknown",
    platform: "Seek",
    url: window.location.href,
    workType: detectWorkType(fullText),
    status: "Applied",
    date: formattedDate,
    syncStatus: "pending",
    description: descriptionEl?.innerText
      .replace(/\n{2,}/g, '\n')   // collapse multiple newlines
      .trim() || "",
  };

  console.log("Extracted job data for DB/Gemini:", jobData);

  return jobData;
}
