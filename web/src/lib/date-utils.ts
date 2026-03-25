/**
 * Morocco Job Portal - Date Parsing Utils
 */

const monthMap: Record<string, number> = {
  'يناير': 0, 'يناير ': 0, 'جانفي': 0,
  'فبراير': 1, 'فبراير ': 1, 'فيفري': 1,
  'مارس': 2, 'مارس ': 2,
  'أبريل': 3, 'ابريل': 3, 'أفريل': 3,
  'ماي': 4, 'ماي ': 4,
  'يونيو': 5, 'جوان': 5,
  'يوليوز': 6, 'جويلية': 6,
  'غشت': 7, 'أوت': 7,
  'شتنبر': 8, 'سبتمبر': 8,
  'أكتوبر': 9, 'اكتوبر': 9,
  'نونبر': 10, 'نوفمبر': 10,
  'دجنبر': 11, 'ديسمبر': 11
};

export function isExpired(deadlineStr: string): boolean {
  if (!deadlineStr || deadlineStr === 'N/A') return false;

  try {
    // Current date (now)
    const now = new Date();
    
    // Parse deadline string: "31 مارس 2026 - 16:30" or "22 مارس 2026"
    // Normalize string (remove leading/trailing, single spaces)
    const normalized = deadlineStr.replace(/\s+/g, ' ').trim();
    
    // Extract parts
    // Split by spaces, hyphens, or colons
    const parts = normalized.split(/[\s\-:]+/);
    
    // Day, Month (Arabic), Year
    const day = parseInt(parts[0]);
    const monthName = parts[1];
    const year = parseInt(parts[2]);
    
    // Hours and Minutes if present
    const hours = parts.length > 3 ? parseInt(parts[3]) : 23; 
    const minutes = parts.length > 4 ? parseInt(parts[4]) : 59;

    const monthIndex = monthMap[monthName];
    
    if (monthIndex === undefined || isNaN(day) || isNaN(year)) {
      // Fallback for relative strings like "2 أيام متبقية" (not handled here yet, but usually we hide those early)
      return false; 
    }

    const deadlineDate = new Date(year, monthIndex, day, hours, minutes);
    
    return now > deadlineDate;
  } catch (e) {
    return false;
  }
}
