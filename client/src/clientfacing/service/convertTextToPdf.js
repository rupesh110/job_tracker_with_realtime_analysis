export async function generateCoverLetterPDF(data) {
  if (!data || !data.available) return;
}

// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// export async function generateCoverLetterPDF(data) {
//   if (!data || !data.available) return;

//   const content = data.available;

//   // Create PDF
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595, 842]); // A4
//   const { width: pageWidth, height: pageHeight } = page.getSize();

//   const leftMargin = 22;
//   const rightMargin = 22;
//   const topMargin = 17;
//   const lineHeight = 16;
//   const paragraphSpacing = 5;
//   let y = pageHeight - topMargin;

//   const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//   function addWrappedText(page, text, x, y, maxWidth, font, fontSize, isBullet = false) {
//     const words = text.split(/\s+/);
//     let line = "";
//     const indent = isBullet ? 10 : 0;

//     for (let word of words) {
//       const testLine = line ? line + " " + word : word;
//       const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

//       if (lineWidth + indent > maxWidth) {
//         page.drawText(line, { x: x + indent, y, size: fontSize, font });
//         y -= lineHeight;
//         line = word;
//       } else {
//         line = testLine;
//       }
//     }
//     if (line) {
//       page.drawText(line, { x: x + indent, y, size: fontSize, font });
//       y -= lineHeight;
//     }

//     return y;
//   }

//   const allLines = content.split("\n").map(l => l.trim()).filter(Boolean);

//   // --- HEADER ---
//   const headerLines = allLines.slice(0, 3);
//   const nameFontSize = 21;
//   const contactFontSize = 12;

//   const nameWidth = helveticaBold.widthOfTextAtSize(headerLines[0], nameFontSize);
//   page.drawText(headerLines[0], { x: (pageWidth - nameWidth) / 2, y, size: nameFontSize, font: helveticaBold });
//   y -= lineHeight + 2;

//   const contactInfo = headerLines.slice(1).join(" | ");
//   const contactWidth = helveticaFont.widthOfTextAtSize(contactInfo, contactFontSize);
//   page.drawText(contactInfo, { x: (pageWidth - contactWidth) / 2, y, size: contactFontSize, font: helveticaFont });
//   y -= lineHeight + paragraphSpacing;

//   // --- BODY ---
//   const bodyLines = allLines.slice(3);
//   bodyLines.forEach((line) => {
//     const isBullet = line.startsWith("•");
//     y = addWrappedText(page, line, leftMargin, y, pageWidth - leftMargin - rightMargin, helveticaFont, 12, isBullet);
//     y -= paragraphSpacing;
//   });

//   // --- Save and download PDF ---
//   const pdfBytes = await pdfDoc.save();
//   const blob = new Blob([pdfBytes], { type: "application/pdf" });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "Cover Letter.pdf";
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// }
