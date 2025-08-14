export function getSpreadsheetIdFromUrl(url) {
  if (!url) return null;

  // Match the part between /d/ and the next /
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)(\/|$)/);
  return match ? match[1] : null;
}
