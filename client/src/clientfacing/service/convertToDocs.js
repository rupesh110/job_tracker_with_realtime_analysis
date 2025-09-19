import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Document, Packer, Paragraph } from "docx";

let quill;

export function generateCoverLetterDoc(initialText) {
  // Create container if it doesn't exist
  let container = document.getElementById("coverLetterEditor");
  if (!container) {
    container = document.createElement("div");
    container.id = "coverLetterEditor";
    container.style.height = "500px";
    container.style.border = "1px solid #ccc";
    container.style.margin = "10px 0";
    document.body.appendChild(container);

    // Download button
    const downloadBtn = document.createElement("button");
    downloadBtn.innerText = "Download as DOCX";
    downloadBtn.onclick = downloadDocx;
    document.body.appendChild(downloadBtn);
  }

  // Initialize Quill editor
  if (!quill) {
    quill = new Quill("#coverLetterEditor", { theme: "snow" });
  }

  quill.root.innerText = initialText || "";
}

// Function to get editor content and download as DOCX
async function downloadDocx() {
  if (!quill) return;
  const content = quill.root.innerText;
  const lines = content.split("\n");

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: lines.map(line => (line.trim() === "" ? new Paragraph("") : new Paragraph(line))),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "CoverLetter.docx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Optional: function to get content back from editor
export function getEditedCoverLetter() {
  return quill ? quill.root.innerText : "";
}
