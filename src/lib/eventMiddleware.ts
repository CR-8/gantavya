import eventsData from '@/data/events.json';

export interface EventData {
  slug: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  poster: string;
  shortDescription: string;
  readTime: string;
  participationFee: string;
  teamSize: string;
  prizePool: string;
  prizes: {
    first: string;
    second: string;
    third: string;
  };
  content: string;
}

/**
 * Sanitizes and validates event data
 * @param slug - The event slug to fetch
 * @returns Sanitized event data or null if not found
 */
export function getEventBySlug(slug: string): EventData | null {
  // Sanitize slug - remove any special characters and convert to lowercase
  const sanitizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  
  // Check if event exists
  const event = eventsData[sanitizedSlug as keyof typeof eventsData];
  
  if (!event) {
    return null;
  }
  
  // Return sanitized and validated event data
  return {
    slug: sanitizedSlug,
    title: sanitizeString(event.title),
    category: sanitizeString(event.category),
    date: sanitizeString(event.date),
    time: sanitizeString(event.time),
    location: sanitizeString(event.location),
    poster: sanitizePath(event.poster),
    shortDescription: sanitizeString(event.shortDescription),
    readTime: sanitizeString(event.readTime),
    participationFee: sanitizeString(event.participationFee),
    teamSize: sanitizeString(event.teamSize),
    prizePool: sanitizeString(event.prizePool),
    prizes: {
      first: sanitizeString(event.prizes.first),
      second: sanitizeString(event.prizes.second),
      third: sanitizeString(event.prizes.third),
    },
    content: sanitizeMarkdown(event.content),
  };
}

/**
 * Gets all events with sanitized data
 * @returns Array of sanitized event data
 */
export function getAllEvents(): EventData[] {
  return Object.entries(eventsData).map(([slug, event]) => ({
    ...event,
    slug: sanitizeString(slug),
    title: sanitizeString(event.title),
    category: sanitizeString(event.category),
    date: sanitizeString(event.date),
    time: sanitizeString(event.time),
    location: sanitizeString(event.location),
    poster: sanitizePath(event.poster),
    shortDescription: sanitizeString(event.shortDescription),
    readTime: sanitizeString(event.readTime),
    participationFee: sanitizeString(event.participationFee),
    teamSize: sanitizeString(event.teamSize),
    prizePool: sanitizeString(event.prizePool),
    prizes: {
      first: sanitizeString(event.prizes.first),
      second: sanitizeString(event.prizes.second),
      third: sanitizeString(event.prizes.third),
    },
    content: sanitizeMarkdown(event.content),
  }));
}

/**
 * Sanitizes a string by escaping HTML and trimming
 * @param str - String to sanitize
 * @returns Sanitized string
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes a file path or URL
 * @param path - Path string to sanitize
 * @returns Sanitized path string
 */
function sanitizePath(path: string): string {
  if (typeof path !== 'string') return '';
  
  // Remove any potentially dangerous characters but keep valid path characters
  return path
    .trim()
    .replace(/[<>"|?*]/g, '') // Remove invalid filename characters
    .replace(/\\/g, '/'); // Normalize backslashes to forward slashes
}

/**
 * Sanitizes markdown content while preserving markdown syntax
 * @param markdown - Markdown string to sanitize
 * @returns Sanitized markdown string
 */
function sanitizeMarkdown(markdown: string): string {
  if (typeof markdown !== 'string') return '';
  
  // For markdown, we do minimal sanitization since react-markdown handles it
  // Just remove any potential script tags or dangerous content
  return markdown
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Validates if an event slug exists
 * @param slug - The event slug to validate
 * @returns Boolean indicating if event exists
 */
export function eventExists(slug: string): boolean {
  const sanitizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  return sanitizedSlug in eventsData;
}

/**
 * Gets event categories for filtering
 * @returns Array of unique categories
 */
export function getEventCategories(): string[] {
  const categories = Object.values(eventsData).map(event => 
    sanitizeString(event.category)
  );
  return [...new Set(categories)];
}
