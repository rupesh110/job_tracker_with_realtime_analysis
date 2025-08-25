import { detectWorkType } from "./helper";

export async function extractLinkedInData() {
  const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title');
  const companyAnchor = document.querySelector('.job-details-jobs-unified-top-card__company-name a');
  const companySpanFallback = document.querySelector('.job-details-jobs-unified-top-card__company-name');
  const companyFallbackSpan = document.querySelector('.job-details-jobs-unified-top-card__primary-description span span');
  const locationEl = document.querySelector('.job-details-jobs-unified-top-card__tertiary-description-container span.tvm__text--low-emphasis');
 
  const fullText = document.body.innerText.toLowerCase();
  
  const dateObj = new Date();
  const formattedDate = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`;

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
    workType: detectWorkType(fullText),
    status: "Applied",
    date: formattedDate,
    syncStatus: "pending",
  };
}






