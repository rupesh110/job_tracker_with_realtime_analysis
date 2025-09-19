import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?raw";

// 👉 Create an inline Blob worker so no external script is loaded
pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(
  new Blob([workerSrc], { type: "application/javascript" })
);

export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}
