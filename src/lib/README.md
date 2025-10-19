# Event Middleware Documentation

## Overview
The Event Middleware provides a centralized sanitization and validation layer for event data throughout the application. This ensures consistent data handling and security.

## Location
`src/lib/eventMiddleware.ts`

## Key Functions

### 1. `getEventBySlug(slug: string): EventData | null`
Fetches and sanitizes a single event by its slug.

**Features:**
- Sanitizes the input slug (removes special characters, converts to lowercase)
- Validates event existence
- Returns sanitized event data with all fields cleaned
- Returns `null` if event not found

**Usage:**
```typescript
import { getEventBySlug } from '@/lib/eventMiddleware';

const event = getEventBySlug('tech-innovation');
if (!event) {
  // Handle event not found
}
```

### 2. `getAllEvents(): EventData[]`
Fetches all events with sanitized data.

**Features:**
- Returns array of all events
- Each event is fully sanitized
- Maintains slug as part of the data structure

**Usage:**
```typescript
import { getAllEvents } from '@/lib/eventMiddleware';

const events = getAllEvents();
```

### 3. `eventExists(slug: string): boolean`
Checks if an event exists without fetching all data.

**Usage:**
```typescript
import { eventExists } from '@/lib/eventMiddleware';

if (eventExists('tech-innovation')) {
  // Event exists
}
```

### 4. `getEventCategories(): string[]`
Returns unique event categories.

**Usage:**
```typescript
import { getEventCategories } from '@/lib/eventMiddleware';

const categories = getEventCategories();
```

## Security Features

### String Sanitization
- Escapes HTML entities (`<`, `>`, `&`, `"`, `'`, `/`)
- Trims whitespace
- Prevents XSS attacks

### Markdown Sanitization
- Removes `<script>` tags
- Removes `<iframe>` tags
- Strips `javascript:` protocol
- Removes inline event handlers (`onclick`, `onload`, etc.)
- Preserves markdown syntax for react-markdown

### Slug Sanitization
- Converts to lowercase
- Removes all non-alphanumeric characters except hyphens
- Prevents path traversal attacks

## Type Safety

### EventData Interface
```typescript
interface EventData {
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
```

## Implementation Examples

### In Event Detail Page
```typescript
import { getEventBySlug } from '@/lib/eventMiddleware';

const event = getEventBySlug(slug);
if (!event) {
  return <NotFound />;
}
```

### In Event Grid
```typescript
import { getAllEvents } from '@/lib/eventMiddleware';

const events = getAllEvents();
```

## Benefits

1. **Centralized Security**: All sanitization happens in one place
2. **Consistency**: Same sanitization rules across the app
3. **Type Safety**: TypeScript interfaces ensure data structure
4. **Maintainability**: Easy to update sanitization logic
5. **Performance**: Efficient data processing
6. **Testability**: Functions can be easily unit tested

## Best Practices

1. Always use middleware functions instead of direct data access
2. Check for `null` returns when fetching single events
3. Don't bypass sanitization for "trusted" data
4. Keep markdown sanitization balanced (security vs functionality)
5. Update sanitization rules as security requirements evolve

## Future Enhancements

Potential improvements:
- Caching layer for frequently accessed events
- Rate limiting for API endpoints
- Input validation schemas (Zod/Yup)
- Logging and monitoring
- Search and filtering utilities
