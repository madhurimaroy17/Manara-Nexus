// Shared by the intro-call form (Footer.tsx) and /api/contact so the two can't drift
export const MAX_SUMMARY_WORDS = 250;
export const DOMAIN_RE = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const countWords = (s: string) => (s.match(/\S+/g) || []).length;
