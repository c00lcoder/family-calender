# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A privacy-focused family calendar wall display built with Next.js 15 for kiosk/tablet displays. The app fetches Google Calendar events via private ICS feeds (no OAuth), displays real-time weather, and provides a beautiful glanceable interface.

## Development Commands

### Local Development
```bash
npm run dev          # Start dev server with Turbopack (localhost:3000)
npm run build        # Production build with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
```

### Vercel Deployment
```bash
vercel               # Deploy to Vercel
```

## Environment Variables

Required environment variables (see `.env.local`):

- `ICS_URLS` - Comma-separated Google Calendar ICS URLs (secret addresses)
- `ZIP_CODE` - US ZIP code for weather (or use LAT/LON below)
- `WEATHER_LAT` / `WEATHER_LON` - Alternative to ZIP_CODE for weather location
- `DAYS_AHEAD` - Optional, defaults to 30 days

## Architecture

### App Structure (Next.js 15 App Router)

- **[app/page.tsx](app/page.tsx)** - Main client component with all UI logic
  - Real-time clock with auto-refresh
  - Weather display component
  - "Next Event" countdown card
  - Event cards grouped by day (4+ columns, responsive grid)
  - Double-tap gesture to force reload
  - Touch ripple effects for kiosk interaction
  - Multi-day event support (events span across multiple days)
  - Retry logic for API failures with 5-minute fallback

- **[app/layout.tsx](app/layout.tsx)** - Root layout with Geist fonts

### API Routes (Server-Side)

- **[app/api/events/route.ts](app/api/events/route.ts)**
  - Fetches ICS feeds from Google Calendar (server-side only, URLs never exposed to client)
  - Parses and expands recurring events using `ical-expander`
  - Merges multiple calendars with `sourceIndex` tracking
  - Returns events sorted by start time
  - **Retry logic**: 3 attempts per ICS URL with exponential backoff (1s, 2s)
  - 15-second timeout per fetch attempt
  - Validates ICS data contains `BEGIN:VCALENDAR`
  - Fault-tolerant: returns partial results if some calendars fail
  - Individual event error handling (skips malformed events, continues processing)

- **[app/api/weather/route.ts](app/api/weather/route.ts)**
  - Uses Open-Meteo API (free, no API key needed)
  - Geocodes ZIP codes to lat/lon
  - Returns current temp, conditions, high/low, and emoji icons
  - **Retry logic**: 3 attempts for both geocoding and weather with exponential backoff
  - 5-second timeout for geocoding, 8-second timeout for weather
  - Falls back to default coordinates (San Francisco) if geocoding fails
  - Validates response structure before returning

### Components & Utilities

- **[components/ui/dotted-glow-background.tsx](components/ui/dotted-glow-background.tsx)** - Canvas-based animated dotted background with shimmer/glow effects
- **[lib/utils.ts](lib/utils.ts)** - Utility functions (currently just `cn` for Tailwind class merging)

## Key Technical Details

### Event Display Logic
- Events are grouped by day in `byDay` computed from `useMemo`
- First 4 days always shown (even if empty) with "Flexible Day" messages
- Multi-day events appear on each day they span
- "Next Event" countdown updates every minute
- Each event card gets a vibrant gradient color from `EVENT_COLORS` array

### Auto-Refresh Intervals
- Events: Every 60 seconds (`app/page.tsx:368`)
- Weather: Every 30 minutes (`app/page.tsx:369`)
- Clock: Every 1 second (`app/page.tsx:122`)
- Next Event Countdown: Every 1 minute (`app/page.tsx:229`)

### Retry & Error Handling Strategy
**Client-side** ([app/page.tsx](app/page.tsx)):
- On API failure: keeps previous data, logs error, retries after 5 minutes
- Validates response is JSON before parsing
- Never displays loading states that would replace existing data

**Server-side** API routes:
- Multiple retry attempts with exponential backoff
- Timeouts prevent hanging requests
- Graceful degradation (partial results if some sources fail)
- Detailed console logging for debugging

### Kiosk Features
- Fullscreen-friendly UI (no scrollbars)
- Double-tap anywhere to force page reload (useful for kiosk mode updates)
- Touch ripple effects on all interactions
- Optimized for always-on displays (laptops, tablets, Chromebooks)

## Common Development Patterns

### Adding a New Feature to the UI
1. Keep everything in [app/page.tsx](app/page.tsx) unless it's a reusable component
2. Use Tailwind for styling with gradient backgrounds and backdrop blur
3. Respect the existing color palette (`EVENT_COLORS`)
4. Test on mobile/tablet viewports (responsive grid)

### Modifying API Data
1. API routes return JSON with optional `error` or `warning` fields
2. Client checks for `error` and keeps previous data if present
3. Always validate external API responses before processing
4. Use `console.log` for success, `console.error` for failures

### Debugging Vercel Build Issues
- The `--turbopack` flag is used in `package.json` for both dev and build
- Check that all dependencies support Next.js 15
- Verify API routes don't import client-only code
- Ensure all async operations have timeouts and error handling
- **Recent fix**: Added retry logic and JSON validation to prevent build failures from transient API errors

## Vercel Build Troubleshooting

If the Vercel build fails after adding retry logic or API changes:

1. **Check API route timeouts**: Vercel serverless functions have a 10-second default timeout (60s max on Pro). Ensure fetch timeouts in API routes are under this limit.

2. **Validate JSON responses**: Both client and server now validate `Content-Type: application/json` before parsing to prevent crashes from unexpected responses.

3. **Environment variables**: Ensure `ICS_URLS`, `ZIP_CODE` (or `WEATHER_LAT`/`WEATHER_LON`) are set in Vercel dashboard under Project Settings → Environment Variables.

4. **Build logs**: Check Vercel build logs for specific errors. Common issues:
   - Missing environment variables during build (use placeholder values for build time if needed)
   - TypeScript errors (run `npm run build` locally first)
   - API route crashes during build-time SSR

5. **Local build test**: Run `npm run build` locally to catch issues before deploying.

## Dependencies

- **Next.js 15** with App Router and Turbopack
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** (configured via PostCSS)
- **ical-expander** for ICS parsing and recurring event expansion
- **motion** (Framer Motion) for animations
- **clsx** + **tailwind-merge** for conditional styling

## Notes

- No authentication/login required (ICS feeds are secret URLs)
- All calendar fetching happens server-side for privacy
- Weather API is free and requires no API key
- UI optimized for large screens (wall displays, tablets)
- Project uses Google Fonts (Geist Sans, Geist Mono)
