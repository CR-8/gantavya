import eventsData from '@/data/events.json';
import { supabase } from './supabase';

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
 * Tries to fetch from Supabase first, falls back to JSON if not found
 * @param slug - The event slug to fetch
 * @returns Sanitized event data or null if not found
 */
export async function getEventBySlug(slug: string): Promise<EventData | null> {
  // Sanitize slug - remove any special characters and convert to lowercase
  const sanitizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  
  // Try to fetch from Supabase first
  try {
    const { data: eventFromDb, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', sanitizedSlug)
      .eq('status', 'published')
      .single();

    if (eventFromDb && !error) {
      // Convert Supabase event to EventData format
      return {
        slug: sanitizedSlug,
        title: sanitizeString(eventFromDb.title),
        category: sanitizeString(eventFromDb.category || eventFromDb.event_type),
        date: sanitizeString(eventFromDb.date_from || eventFromDb.date || ''),
        time: sanitizeString(eventFromDb.event_start_time || eventFromDb.time || ''),
        location: sanitizeString(eventFromDb.venue || eventFromDb.location || ''),
        poster: sanitizePath(eventFromDb.poster_url || eventFromDb.poster || ''),
        shortDescription: sanitizeString(eventFromDb.description || eventFromDb.shortDescription || ''),
        readTime: '5 min read', // Default or calculate from content
        participationFee: sanitizeString(eventFromDb.registration_fee?.toString() || eventFromDb.participationFee || '0'),
        teamSize: sanitizeString(eventFromDb.team_size || `${eventFromDb.team_size_min}-${eventFromDb.team_size_max}` || '1-4'),
        prizePool: sanitizeString(eventFromDb.prize_pool || eventFromDb.prizePool || ''),
        prizes: eventFromDb.prize_distribution || {
          first: sanitizeString(eventFromDb.prizes?.first || ''),
          second: sanitizeString(eventFromDb.prizes?.second || ''),
          third: sanitizeString(eventFromDb.prizes?.third || ''),
        },
        content: sanitizeMarkdown(eventFromDb.content || ''),
      };
    }
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    // Fall through to JSON fallback
  }
  
  // Fallback to JSON data
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
 * Fetches from Supabase first, merges with JSON data
 * @returns Array of sanitized event data
 */
export async function getAllEvents(): Promise<EventData[]> {
  const allEvents: EventData[] = [];
  
  // Try to fetch from Supabase
  try {
    const { data: eventsFromDb, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .eq('is_visible', true)
      .order('date_from', { ascending: true });

    if (eventsFromDb && !error) {
      // Convert Supabase events to EventData format
      const dbEvents = eventsFromDb.map((event) => ({
        slug: sanitizeString(event.slug),
        title: sanitizeString(event.title),
        category: sanitizeString(event.category || event.event_type),
        date: sanitizeString(event.date_from || ''),
        time: sanitizeString(event.event_start_time || ''),
        location: sanitizeString(event.venue || ''),
        poster: sanitizePath(event.poster_url || ''),
        shortDescription: sanitizeString(event.description || ''),
        readTime: '5 min read',
        participationFee: sanitizeString(event.registration_fee?.toString() || '0'),
        teamSize: sanitizeString(event.team_size || `${event.team_size_min}-${event.team_size_max}` || '1-4'),
        prizePool: sanitizeString(event.prize_pool || ''),
        prizes: event.prize_distribution || {
          first: '',
          second: '',
          third: '',
        },
        content: sanitizeMarkdown(event.content || ''),
      }));
      
      allEvents.push(...dbEvents);
    }
  } catch (error) {
    console.error('Error fetching events from Supabase:', error);
  }
  
  // Add events from JSON that aren't already in the database
  const jsonEvents = Object.entries(eventsData).map(([slug, event]) => ({
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
  
  // Merge: only add JSON events that don't exist in DB
  const dbSlugs = new Set(allEvents.map(e => e.slug));
  const uniqueJsonEvents = jsonEvents.filter(e => !dbSlugs.has(e.slug));
  allEvents.push(...uniqueJsonEvents);
  
  return allEvents;
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
 * Checks both Supabase and JSON data
 * @param slug - The event slug to validate
 * @returns Boolean indicating if event exists
 */
export async function eventExists(slug: string): Promise<boolean> {
  const sanitizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  
  // Check Supabase first
  try {
    const { data, error } = await supabase
      .from('events')
      .select('slug')
      .eq('slug', sanitizedSlug)
      .eq('status', 'published')
      .single();
    
    if (data && !error) {
      return true;
    }
  } catch {
    // Fall through to JSON check
  }
  
  // Check JSON data
  return sanitizedSlug in eventsData;
}

/**
 * Gets event categories for filtering
 * Fetches from both Supabase and JSON
 * @returns Array of unique categories
 */
export async function getEventCategories(): Promise<string[]> {
  const categories = new Set<string>();
  
  // Get from Supabase
  try {
    const { data: eventsFromDb, error } = await supabase
      .from('events')
      .select('category, event_type')
      .eq('status', 'published');

    if (eventsFromDb && !error) {
      eventsFromDb.forEach(event => {
        if (event.category) categories.add(sanitizeString(event.category));
        if (event.event_type) categories.add(sanitizeString(event.event_type));
      });
    }
  } catch (error) {
    console.error('Error fetching categories from Supabase:', error);
  }
  
  // Add from JSON
  Object.values(eventsData).forEach(event => {
    categories.add(sanitizeString(event.category));
  });
  
  return Array.from(categories).sort();
}
