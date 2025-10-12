import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Load worker via chrome.runtime.getURL to bypass CSP
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("pdf/pdf.worker.js");

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let textContent = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      textContent += content.items.map(item => item.str).join(" ") + "\n";
    }

    return textContent.trim();
  } catch (err) {
    //console.error("PDF extraction faileds:", err);
    return null;
  }
}
