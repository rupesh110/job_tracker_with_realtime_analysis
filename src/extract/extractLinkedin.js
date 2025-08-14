import {callGemini} from "./callGemini.js"

export async function extractLinkedInData() {
  const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title');
  const companyAnchor = document.querySelector('.job-details-jobs-unified-top-card__company-name a');
  const companySpanFallback = document.querySelector('.job-details-jobs-unified-top-card__company-name');
  const companyFallbackSpan = document.querySelector('.job-details-jobs-unified-top-card__primary-description span span');
  const locationEl = document.querySelector('.job-details-jobs-unified-top-card__tertiary-description-container span.tvm__text--low-emphasis');
 
  const fullText = document.body.innerText.toLowerCase();
  const geminiResponse = await callGemini(fullText);
  console.log(geminiResponse);

  return {
    title: titleEl?.innerText?.trim() || 'N/A',
    company:
      companyAnchor?.innerText?.trim() ||
      companyFallbackSpan?.innerText?.trim() ||
      companySpanFallback?.innerText?.trim() ||
      'N/A',
    platform: 'LinkedIn',
    url: window.location.href,
    location: locationEl?.innerText?.trim() || 'N/A',
      gemini: geminiResponse

  };
}






