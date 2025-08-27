import { detectWorkType } from "./helper.js";

export async function extractSeekData() {
  // Basic elements
  const titleEl = document.querySelector('[data-automation="job-detail-title"]');
  const companyEl = document.querySelector('[data-automation="advertiser-name"]');
  const locationEl = document.querySelector('[data-automation="job-detail-location"]');
  // Fallback selector for description
  const descriptionEl = document.querySelector('[data-automation="job-description"]') 
                      || document.querySelector('[data-automation="jobAdDetails"]');
  const buttonEl = document.querySelector('#newTabButton');

  if (!titleEl) {
    console.log("No title element found. Skipping extraction.");
    return null;
  }

  // Format today's date
  const dateObj = new Date();
  const formattedDate = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`;

  // Extract full text from body for work type detection
  const fullText = document.body.innerText.toLowerCase();

  // Get real job URL from <a> wrapping the button
  let jobUrl = window.location.href; // fallback
  if (buttonEl) {
    const linkEl = buttonEl.closest('a');
    if (linkEl) {
      // Convert relative URL to absolute
      jobUrl = new URL(linkEl.getAttribute('href'), window.location.origin).href;
    }
  }

  // Extract description as clean raw text
  const rawDescription = descriptionEl?.innerText
    .split('\n')                 // split into lines
    .map(line => line.trim())    // trim each line
    .filter(line => line)        // remove empty lines
    .join('\n') || "";

  // Construct job data
  const jobData = {
    title: titleEl.innerText.trim() || "Unknown",
    company: companyEl?.childNodes[0]?.nodeValue?.trim() || companyEl?.innerText?.trim() || "Unknown",
    location: locationEl?.innerText.trim() || "Unknown",
    platform: "Seek",
    url: jobUrl,
    workType: detectWorkType(fullText),
    status: "Applied",
    date: formattedDate,
    syncStatus: "pending",
    description: rawDescription,
  };

  console.log("Extracted job data for DB/Gemini:", jobData);

  return jobData;
}
