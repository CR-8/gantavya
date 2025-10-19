# Event Posters Directory

This directory should contain event poster images referenced in the events.json file.

## Required Images

Based on the events.json configuration, the following images are expected:

- `tech-innovation.jpg` - Tech Innovation Workshop poster
- `cultural-night.jpg` - Cultural Night event poster
- `hackathon.jpg` - Hackathon Finals 2025 poster

## Image Specifications

### Recommended Dimensions
- **Aspect Ratio**: 16:9 (widescreen)
- **Resolution**: 1920x1080px or higher
- **Format**: JPG, PNG, or WebP
- **File Size**: Under 500KB for optimal performance

### Design Guidelines
- High contrast for better visibility
- Include event name prominently
- Add date and venue information
- Use brand colors from Gantavya theme
- Ensure text is readable at various sizes

## Adding New Events

When adding a new event to events.json:

1. Create a high-quality poster image
2. Optimize the image (use tools like TinyPNG or ImageOptim)
3. Save it to this directory with a descriptive filename
4. Update the `poster` field in events.json with the path: `/events/your-image.jpg`

## Fallback Behavior

If an image is missing or fails to load, the event detail page will display:
- A gradient background (blue → purple → pink)
- The event title as an overlay
- This provides a consistent user experience even without custom posters

## Next.js Image Optimization

All images in this directory will be automatically optimized by Next.js:
- Automatic format conversion (WebP when supported)
- Responsive image sizing
- Lazy loading
- Blur placeholder generation

No additional configuration needed!
