export function detectWorkType(text) {
  if (text.includes("remote") || text.includes("work from home") || text.includes("wfh")) {
    return "Remote";
  } else if (
    text.includes("hybrid") ||
    text.includes("2 days office") ||
    text.includes("3 days remote") ||
    text.includes("split week")
  ) {
    return "Hybrid";
  } else if (
    text.includes("onsite") ||
    text.includes("in-office") ||
    text.includes("at our office") ||
    text.includes("office-based")
  ) {
    return "In-office";
  } else {
    return "Unknown";
  }
}
