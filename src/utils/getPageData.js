import { testFunction } from "../script/test.js";
import { extractSeekData } from "../script/extractSeek.js";

export async function getPageData() {
  const url = window.location.href;
  console.log("Current URL:", url);

  if (url.includes("seek.com.au")) {
    console.log("Using extractSeekData for seek.com.au");
    return await extractSeekData();
  }

  console.log("Using default testFunction");
  return await testFunction(); // fallback or default
}
