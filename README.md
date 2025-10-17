# Family Calendar Wall Display

A beautiful, privacy-friendly family calendar wall display built with Next.js. Perfect for displaying on a kiosk, old laptop, or tablet to keep your family's schedule visible at a glance.

## Features

- **Beautiful Live Clock** - Large, animated clock with day, date, and time
- **Weather Display** - Real-time weather with current temp, high/low, and conditions
- **Calendar Events** - Fetches Google Calendar events via private ICS feeds (no OAuth needed)
- **Recurring Events** - Automatically expands recurring events (PE Mondays, Health Tuesdays, etc.)
- **Glanceable Agenda** - Clean view showing 14-30 days ahead
- **Auto-Refresh** - Events refresh every minute, weather every 30 minutes
- **Kiosk-Friendly** - Perfect for fullscreen wall displays
- **Privacy-Focused** - Server-side fetching keeps your calendar URLs private
- **Multi-Calendar** - Works with multiple calendars merged together
- **Free Weather API** - Uses Open-Meteo (no API key required)

## Getting Started

### 1. Get Your Google Calendar ICS URL(s)

For each calendar you want to display:

1. Open [Google Calendar](https://calendar.google.com)
2. Click the **Settings** gear icon → **Settings**
3. In the left sidebar, select the calendar you want to share
4. Scroll down to **Integrate calendar**
5. Copy the **Secret address in iCal format** (looks like a long URL)

Repeat for multiple calendars if you want to merge them.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Edit the `.env.local` file and add your settings:

```bash
# Add your Google Calendar ICS URLs here (comma-separated for multiple calendars)
ICS_URLS=https://calendar.google.com/calendar/ical/your_secret_1/basic.ics,https://calendar.google.com/calendar/ical/your_secret_2/basic.ics

# How many days ahead to show (optional, defaults to 30)
DAYS_AHEAD=30

# Weather Location - use ZIP code (easiest for US)
ZIP_CODE=30044

# Or use latitude/longitude instead (if not using ZIP_CODE)
# WEATHER_LAT=37.7749
# WEATHER_LON=-122.4194
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel
```

### Option 2: Using GitHub

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial family calendar wall"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click **Import Project**
4. Select your GitHub repository
5. Configure environment variables:
   - Add `ICS_URLS` with your calendar URLs
   - Add `ZIP_CODE` for weather (or `WEATHER_LAT` and `WEATHER_LON`)
   - Add `DAYS_AHEAD` (optional)
6. Click **Deploy**

**Important:** Make sure to add all environment variables in Vercel's dashboard under **Project Settings → Environment Variables**.

## Kiosk Mode Setup

### Old Laptop/Desktop

1. Open your deployed Vercel URL in a browser
2. Press **F11** (Windows/Linux) or **Ctrl+Cmd+F** (Mac) for fullscreen
3. Optional: Set the browser to auto-launch on startup:
   - **Windows:** Add browser shortcut to Startup folder with your URL as argument
   - **Mac:** System Preferences → Users & Groups → Login Items
   - **Linux:** Add to autostart applications

### Chromebook

1. Create a kiosk user or use a kiosk extension
2. Point to your Vercel URL

### Android Tablet

1. Install [Fully Kiosk Browser](https://www.fully-kiosk.com/) (free version available)
2. Configure it to load your Vercel URL
3. Enable kiosk mode to prevent tampering

## Adding Recurring Events

In Google Calendar, create events with recurrence:

- **Kids PE:** Every Monday, 7:30-8:30 AM
- **Health:** Every Tuesday, 7:00-7:30 PM
- **Dentist:** First Wednesday of every month, 3:00 PM

They'll automatically appear in your family wall after the next refresh!

## Customization Ideas

### Change the Refresh Interval

Edit `app/page.tsx` line 43:
```typescript
const id = setInterval(load, 60_000); // Change 60_000 to desired milliseconds
```

### Change Days Ahead

Update the `DAYS_AHEAD` environment variable in `.env.local` or Vercel settings.

### Add Color Coding

You can enhance the UI to show different colors for different calendars using the `sourceIndex` property in the event data.

### Add Weather or To-Dos

Add additional columns to fetch weather APIs or display a JSON list of chores.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ical-expander** - ICS parsing and recurring event expansion
- **Vercel** - Deployment platform

## Privacy & Security

- Your ICS URLs are stored server-side only (environment variables)
- URLs never ship to the browser
- No OAuth or login required
- No tracking or analytics

## Troubleshooting

### "ICS_URLS not set" error

Make sure you've added the `ICS_URLS` environment variable in `.env.local` (local) or Vercel dashboard (production).

### Events not showing up

1. Check that your ICS URL is correct
2. Verify the calendar has events in the date range
3. Check the browser console for errors
4. Try visiting `/api/events` directly to see the JSON response

### Time zone issues

The app uses the time zone from your ICS feed. If times are incorrect, check your Google Calendar settings.

## License

MIT

## Contributing

Pull requests welcome! Feel free to add features like:
- All-day event display
- Color coding by calendar
- Weather integration
- Task/chore lists
- Multiple views (day/week/month)

---

Built with love for families who want a simple, privacy-focused calendar display.
