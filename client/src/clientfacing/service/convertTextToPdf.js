export function generateCoverLetterPDF(data) {
  console.log("from conver to cover letter:", data)
  return "ok"
}

// import { jsPDF } from "jspdf";

// export function generateCoverLetterPDF(data) {
//   if (!data || !data.available) return;

//   const content = data.available;
//   const doc = new jsPDF();
//   const leftMargin = 22;
//   const rightMargin = 22;
//   const topMargin = 17;
//   const lineHeight = 6;
//   const paragraphSpacing = 5;
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const maxWidth = pageWidth - leftMargin - rightMargin;
//   let y = topMargin;

//   // --- Helper: Justified paragraph / bullet text ---
//   function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
//     const isBullet = text.startsWith("•");
//     const textIndent = isBullet ? 10 : 0;
//     let cleanedText = isBullet ? text.replace(/^\s*/, "") : text;
//     const words = cleanedText.split(/\s+/);
//     let lineWords = [];
//     let lineWidth = 0;

//     for (let i = 0; i < words.length; i++) {
//       const word = words[i];
//       const wordWidth = doc.getTextWidth(word + " ");

//       if (lineWidth + wordWidth > maxWidth - textIndent && lineWords.length > 0) {
//         if (y > pageHeight - 25) {
//           doc.addPage();
//           y = topMargin;
//         }

//         let extraSpace = maxWidth - textIndent - lineWidth;
//         let gap = lineWords.length > 1 ? extraSpace / (lineWords.length - 1) : 0;

//         let curX = x + textIndent;
//         lineWords.forEach((w) => {
//           doc.text(w, curX, y);
//           curX += doc.getTextWidth(w + " ") + gap;
//         });

//         y += lineHeight;
//         lineWords = [];
//         lineWidth = 0;
//       }

//       lineWords.push(word);
//       lineWidth += wordWidth;
//     }

//     // Last line (not justified)
//     if (lineWords.length > 0) {
//       if (y > pageHeight - 25) {
//         doc.addPage();
//         y = topMargin;
//       }
//       let curX = x + textIndent;
//       lineWords.forEach((w) => {
//         doc.text(w, curX, y);
//         curX += doc.getTextWidth(w + " ");
//       });
//       y += lineHeight;
//     }

//     return y;
//   }

//   // --- HEADER ---
//   const allLines = content.split("\n").map(l => l.trim()).filter(Boolean);
//   const headerLines = allLines.slice(0, 3); // Name, Phone/Email
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(21); // slightly larger name

//   const nameWidth = doc.getTextWidth(headerLines[0]);
//   doc.text(headerLines[0], (pageWidth - nameWidth) / 2, y);
//   y += lineHeight + 1;

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(12);
//   const contactInfo = headerLines.slice(1).join(" | ");
//   const contactWidth = doc.getTextWidth(contactInfo);
//   doc.text(contactInfo, (pageWidth - contactWidth) / 2, y);
//   y += lineHeight + paragraphSpacing - 4;

//   // --- DATE, COMPANY INFO, SUBJECT ---
//   const bodyLines = allLines.slice(3);

//   // Add subtle horizontal line above date
//   const lineStartX = leftMargin;
//   const lineEndX = pageWidth - rightMargin;
//   const lineY = y - 1; // smaller gap
//   doc.setLineWidth(0.3);
//   doc.line(lineStartX, lineY, lineEndX, lineY);
//   y = lineY + 6; // gap after line

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(12);

//   if (bodyLines.length > 0) {
//     // Date
//     doc.text(bodyLines[0], leftMargin, y);
//     y += lineHeight + paragraphSpacing;

//     // --- Dynamic company lines ---
//     let subjectIndex = bodyLines.findIndex(line => line.toLowerCase().startsWith("subject:"));
//     subjectIndex = subjectIndex === -1 ? bodyLines.length : subjectIndex; // fallback if no subject
//     const companyLines = bodyLines.slice(1, subjectIndex);

//     companyLines.forEach(line => {
//       y = addWrappedText(doc, line, leftMargin, y, maxWidth, lineHeight);
//       y += paragraphSpacing / 2;
//     });

//     // Subject
//     if (subjectIndex < bodyLines.length) {
//       const subjectLine = bodyLines[subjectIndex];
//       const subjectIndent = leftMargin + 15;
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(12);
//       doc.text(subjectLine, subjectIndent, y);
//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(12);
//       y += lineHeight + paragraphSpacing;
//     }
//   }

//   // --- Remove original signature lines ---
//   let signatureIndex = bodyLines.findIndex(line => line.trim().toLowerCase() === "sincerely,");
//   let signatureLines = [];
//   if (signatureIndex !== -1) {
//     signatureLines = bodyLines.splice(signatureIndex, bodyLines.length - signatureIndex);
//   }

//   // --- MAIN BODY: paragraphs & bullets ---
//   for (let i = 5; i < bodyLines.length; i++) {
//     const line = bodyLines[i];
//     if (!line) {
//       y += paragraphSpacing;
//       continue;
//     }
//     y = addWrappedText(doc, line, leftMargin, y, maxWidth, lineHeight);
//     y += paragraphSpacing;
//   }

//   // --- PRINT DYNAMIC SIGNATURE ---
//   if (signatureLines.length > 0) {
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(12);
//     signatureLines.forEach((line) => {
//       if (!line.trim()) return;
//       doc.text(line.trim(), leftMargin, y);
//       y += lineHeight;
//     });
//   }

//   // --- DOWNLOAD PDF ---
//   const pdfBlob = doc.output("blob");
//   const filename = "Cover Letter.pdf";
//   const url = URL.createObjectURL(pdfBlob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.dispatchEvent(new MouseEvent("click", { view: window, bubbles: true, cancelable: true }));
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// }
