

export async function testBackground(data) {
  console.log("testbackground:", data);

  try {
    const spreadsheetId = "123"

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { 
          action: "saveToSpreadsheet", 
          data: { ...data, spreadsheetId } 
        }, 
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError.message);
            reject(chrome.runtime.lastError.message);
          } else if (response?.status === "error") {
            console.error("Apps Script error:", response.error);
            reject(response.error);
          } else {
            console.log("Response from background:", response);
            resolve(response);
          }
        }
      );
    });
  } catch (error) {
    console.error("Failed to retrieve spreadsheet ID:", error);
    throw error;
  }
}
