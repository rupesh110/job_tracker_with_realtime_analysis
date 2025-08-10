export const SPREADSHEET_APP_URL = "https://script.google.com/macros/s/AKfycbwBPo7z2F6iRbjz8KZeHjMsvjxFMAQfBd2G01oIwxEir8PdFDZHsOFVpDiRCnFusz1a/exec";


export async function saveJobDataSpreadsheet(pageData) {
  chrome.runtime.sendMessage(
    { action: "saveJob", data: pageData },
    (response) => {
      if (response.error) {
        alert("Save failed: " + response.error);
      } else {
        alert("Saved successfully!");
      }
    }
  );
}