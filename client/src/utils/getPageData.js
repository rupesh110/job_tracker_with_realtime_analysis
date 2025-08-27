import { extractSeekData } from "../extract/extractSeek.js";
import { extractLinkedInData } from "../extract/extractLinkedin.js";

let lastProcessedUrl = null;
let lastJobTitle = null;

export async function getPageData() {
  const url = window.location.href;

  // Only handle Seek and LinkedIn job pages
  if (!url.includes("seek.com.au") && !url.includes("linkedin.com/jobs/")) {
    return null;
  }

  // Extract job data based on platform
  let jobData = null;
  if (url.includes("seek.com.au")) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    jobData = await extractSeekData();
  } else if (url.includes("linkedin.com/jobs/")) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    jobData = await extractLinkedInData();
  }

  console.log("from extracted data:", jobData)
  // Check if new data
  if (!jobData) return null;
  if (jobData.url === lastProcessedUrl && jobData.title === lastJobTitle) {
    return null; // same job, no need to process
  }

  lastProcessedUrl = jobData.url;
  lastJobTitle = jobData.title;

  return jobData;
}
