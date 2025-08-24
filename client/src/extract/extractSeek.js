import { detectWorkType } from "./helper.js";
import { getGeminiAnalysis } from "../Feeder/GeminiJobFeeder.js";

export async function extractSeekData() {
  const titleEl = document.querySelector('[data-automation="job-detail-title"]');
  const companyEl = document.querySelector('[data-automation="advertiser-name"]');
  const locationEl = document.querySelector('[data-automation="job-detail-location"]');

  if (!titleEl) return null;

  const fullText = document.body.innerText.toLowerCase();
  // const geminiResponse = await getGeminiAnalysis(fullText) || {};

  const dateObj = new Date();
  const formattedDate = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`;

  return {
    title: titleEl.innerText.trim() || "Unknown",
    company: companyEl?.childNodes[0]?.nodeValue?.trim() || companyEl?.innerText?.trim() || "Unknown",
    location: locationEl?.innerText.trim() || "Unknown",
    platform: "Seek",
    url: window.location.href,
    workType: detectWorkType(fullText),
    status: "Applied",
    date: formattedDate,
    syncStatus: "pending",
    //gemini: geminiResponse
  };
}
