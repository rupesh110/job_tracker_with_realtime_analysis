// src/utils/getPageData.js
import { testFunction } from "../script/test.js";
import { extractSeekData } from "../script/extractSeek.js";
import {extractLinkedInData } from "../script/extractLinkedin.js";

export async function getPageData() {
  const url = window.location.href;

  if(url.includes("seek.com.au/job/")) {
    return await extractSeekData();
  }

 if (url.includes("linkedin.com/jobs/")) {
  await new Promise(resolve => setTimeout(resolve, 4000)); // wait 3 seconds
  const data = await extractLinkedInData();
  console.log("Linkedin datta:", data)
  return data;
}

  return await testFunction(); // fallback or default
}
