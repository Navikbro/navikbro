export function sanitizeText(text: string): string {
  if (!text) return "";

  return text
    .replace(/\u00A0/g, " ")   // Unicode non-breaking spaces
    .replace(/&nbsp;/gi, " ")  // HTML non-breaking spaces
    .replace(/\r\n/g, "\n")    // Windows newlines
    .replace(/\t/g, " ")       // Tabs → spaces
    .replace(/[ ]{2,}/g, " ")  // Multiple spaces → single
    .trim();
}