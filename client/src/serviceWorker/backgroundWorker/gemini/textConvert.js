import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 * Generate a professional cover letter PDF with full justification, bullets, and page breaks
 * @param {string} text - The full cover letter text
 * @param {string} filename - Optional filename
 */
export async function generateCoverLetter(text, filename = "CoverLetter.pdf") {
  if (!text) return;

  const pdfDoc = await PDFDocument.create();
  const pageSize = [595, 842]; // A4
  let page = pdfDoc.addPage(pageSize);
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const leftMargin = 40;
  const rightMargin = 40;
  const topMargin = 50;
  const bottomMargin = 40;
  const lineHeight = 16;
  const paragraphSpacing = 10;

  let y = pageHeight - topMargin;

  // --- Add wrapped text with justification and page breaks ---
  function addWrappedText(text, font, fontSize = 12, isBullet = false) {
    const maxWidth = pageWidth - leftMargin - rightMargin;
    const words = text.split(/\s+/);
    const lines = [];
    let lineWords = [];
    let lineWidth = 0;
    const indent = isBullet ? 20 : 0; // bullet indent

    words.forEach((word, idx) => {
      const wordWidth = font.widthOfTextAtSize(word + " ", fontSize);
      if (lineWidth + wordWidth + indent > maxWidth && lineWords.length > 0) {
        lines.push([...lineWords]);
        lineWords = [];
        lineWidth = 0;
      }
      lineWords.push(word);
      lineWidth += wordWidth;
      if (idx === words.length - 1 && lineWords.length) lines.push([...lineWords]);
    });

    lines.forEach((wordsInLine, lineIdx) => {
      if (y - lineHeight < bottomMargin) {
        page = pdfDoc.addPage(pageSize);
        y = pageHeight - topMargin;
      }

      const isLastLine = lineIdx === lines.length - 1;
      const lineText = wordsInLine.join(" ");
      const lineWidth = font.widthOfTextAtSize(lineText, fontSize);

      if (isLastLine) {
        // Last line: left-aligned
        page.drawText(lineText, { x: leftMargin + indent, y, size: fontSize, font });
      } else {
        // Full justification
        const extraSpace = maxWidth - lineWidth - indent;
        const spaceCount = wordsInLine.length - 1;
        const spaceWidth = spaceCount > 0 ? extraSpace / spaceCount : 0;
        let x = leftMargin + indent;
        wordsInLine.forEach((w) => {
          page.drawText(w, { x, y, size: fontSize, font });
          x += font.widthOfTextAtSize(w + " ", fontSize) + spaceWidth;
        });
      }

      y -= lineHeight;
    });

    y -= paragraphSpacing / 2;
  }

  // --- Add centered text with page breaks ---
  function addCenteredText(text, font, fontSize = 12) {
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    if (y - lineHeight < bottomMargin) {
      page = pdfDoc.addPage(pageSize);
      y = pageHeight - topMargin;
    }
    page.drawText(text, { x: (pageWidth - textWidth) / 2, y, size: fontSize, font });
    y -= lineHeight;
  }

  // --- Process text lines ---
  const allLines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // --- Centered header ---
  addCenteredText(allLines[0], helveticaBold, 21); // Name
  addCenteredText(allLines[1], helvetica, 12);     // Phone
  addCenteredText(allLines[2], helvetica, 12);     // Email
  y -= paragraphSpacing;

  // --- Date & Company Info (left-aligned) ---
  let currentIndex = 3;
  while (currentIndex < allLines.length && !allLines[currentIndex].toLowerCase().startsWith("subject:")) {
    addWrappedText(allLines[currentIndex], helvetica);
    currentIndex++;
  }

  // --- Centered Subject ---
  if (currentIndex < allLines.length) {
    addCenteredText(allLines[currentIndex], helveticaBold, 12);
    currentIndex++;
    y -= paragraphSpacing;
  }

  // --- Body and bullets ---
  const signatureStartIndex = allLines.findIndex((line) => line.toLowerCase().startsWith("sincerely,"));
  const bodyEndIndex = signatureStartIndex !== -1 ? signatureStartIndex : allLines.length;

  for (let i = currentIndex; i < bodyEndIndex; i++) {
    const isBullet = allLines[i].startsWith("•"); // Respect existing bullets
    addWrappedText(allLines[i], helvetica, 12, isBullet);
  }

  // --- Signature ---
  if (signatureStartIndex !== -1) {
    y -= paragraphSpacing;
    for (let i = signatureStartIndex; i < allLines.length; i++) {
      addWrappedText(allLines[i], helvetica, 12);
    }
  }

  // --- Save PDF and download ---
  const pdfBytes = await pdfDoc.save();
  const base64 = btoa(pdfBytes.reduce((data, byte) => data + String.fromCharCode(byte), ""));
  if (chrome?.downloads?.download) {
    chrome.downloads.download({
      url: "data:application/pdf;base64," + base64,
      filename,
      saveAs: true,
    });
  } else {
    //console.error("Downloads API not available");
  }
}
