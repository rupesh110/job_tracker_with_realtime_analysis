import {callGemini} from "./callGemini.js"

export async function extractSeekData() {
  const titleEl = document.querySelector('[data-automation="job-detail-title"]');
  const companyEl = document.querySelector('[data-automation="advertiser-name"]');
  const locationEl = document.querySelector('[data-automation="job-detail-location"]');

  if (!titleEl) return null;

  const fullText = document.body.innerText.toLowerCase();
  const geminiResponse = await callGemini(fullText);
  console.log(geminiResponse
    
  )

  return {
    title: titleEl.innerText.trim(),
    company: companyEl?.childNodes[0]?.nodeValue?.trim() || companyEl?.innerText?.trim() || "Unknown",
    location: locationEl?.innerText.trim() || "Unknown",
    gemini: geminiResponse
  };
}

