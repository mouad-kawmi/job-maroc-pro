const ARABIC_POSTS_RE = /^(\d+)\s*(?:منصب|مناصب)$/;
const FRENCH_POSTS_RE = /^(\d+)\s*poste(?:s)?$/i;
const DIGITS_ONLY_RE = /^\d+$/;

function formatCount(count: number, lang: 'ar' | 'fr'): string {
  if (lang === 'fr') {
    return `${count} ${count === 1 ? 'poste' : 'postes'}`;
  }

  return `${count} ${count === 1 ? 'منصب' : 'مناصب'}`;
}

export function formatPostsLabel(posts: string, lang: 'ar' | 'fr'): string {
  const normalized = posts?.trim();

  if (!normalized || normalized.toUpperCase() === 'N/A') {
    return lang === 'fr' ? 'Non precise' : 'غير محدد';
  }

  const arabicMatch = normalized.match(ARABIC_POSTS_RE);
  if (arabicMatch) {
    return formatCount(Number(arabicMatch[1]), lang);
  }

  const frenchMatch = normalized.match(FRENCH_POSTS_RE);
  if (frenchMatch) {
    return formatCount(Number(frenchMatch[1]), lang);
  }

  if (DIGITS_ONLY_RE.test(normalized)) {
    return formatCount(Number(normalized), lang);
  }

  return normalized;
}
