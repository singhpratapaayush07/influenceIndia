/**
 * Content filter to detect and mask contact information in messages.
 * Prevents users from sharing direct contact details to bypass the platform.
 */

const PHONE_PATTERNS = [
  /(\+91[\s\-.]?)?[6-9]\d{9}/g,                    // Indian mobile
  /\+\d{1,3}[\s\-.]?\d{6,14}/g,                     // International
  /\b\d{3}[\s\-.]?\d{3}[\s\-.]?\d{4}\b/g,           // Generic 10-digit
];

const EMAIL_PATTERN = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi;

const SOCIAL_URL_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+/gi,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/[@a-zA-Z0-9_.]+/gi,
  /(?:https?:\/\/)?(?:www\.)?twitter\.com\/[a-zA-Z0-9_]+/gi,
  /(?:https?:\/\/)?(?:www\.)?x\.com\/[a-zA-Z0-9_]+/gi,
  /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[a-zA-Z0-9_.]+/gi,
  /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-]+/gi,
  /(?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com)\/\+?\d+/gi,
  /(?:https?:\/\/)?(?:t\.me|telegram\.me)\/[a-zA-Z0-9_]+/gi,
];

const GENERIC_URL_PATTERN = /https?:\/\/[^\s]+/gi;

const OBFUSCATION_PATTERNS = [
  /[a-zA-Z0-9._%+\-]+\s*(?:\[at\]|\{at\}|\(at\)|<at>)\s*[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi,
  /[a-zA-Z0-9._%+\-]+\s*(?:\[dot\]|\{dot\}|\(dot\))\s*[a-zA-Z]{2,}/gi,
];

const REPLACEMENT = "[contact info hidden by platform]";

interface FilterResult {
  detected: boolean;
  types: string[];
}

export function detectContactInfo(text: string): FilterResult {
  const types: string[] = [];

  if (EMAIL_PATTERN.test(text)) types.push("email");
  EMAIL_PATTERN.lastIndex = 0;

  for (const pattern of PHONE_PATTERNS) {
    if (pattern.test(text)) { types.push("phone"); break; }
    pattern.lastIndex = 0;
  }

  for (const pattern of SOCIAL_URL_PATTERNS) {
    if (pattern.test(text)) { types.push("social_url"); break; }
    pattern.lastIndex = 0;
  }

  if (GENERIC_URL_PATTERN.test(text)) types.push("url");
  GENERIC_URL_PATTERN.lastIndex = 0;

  for (const pattern of OBFUSCATION_PATTERNS) {
    if (pattern.test(text)) { types.push("obfuscated"); break; }
    pattern.lastIndex = 0;
  }

  return { detected: types.length > 0, types: Array.from(new Set(types)) };
}

export function maskContactInfo(text: string): string {
  let result = text;

  // Mask emails first (most specific)
  result = result.replace(EMAIL_PATTERN, REPLACEMENT);

  // Mask social URLs
  for (const pattern of SOCIAL_URL_PATTERNS) {
    result = result.replace(pattern, REPLACEMENT);
  }

  // Mask generic URLs
  result = result.replace(GENERIC_URL_PATTERN, REPLACEMENT);

  // Mask phone numbers
  for (const pattern of PHONE_PATTERNS) {
    result = result.replace(pattern, REPLACEMENT);
  }

  // Mask obfuscation attempts
  for (const pattern of OBFUSCATION_PATTERNS) {
    result = result.replace(pattern, REPLACEMENT);
  }

  return result;
}
