"use client";

import { useEffect, useMemo, useState } from "react";

type Event = {
  start: string;
  end: string;
  title: string;
  location?: string;
  description?: string;
  sourceIndex: number;
};

type Weather = {
  current: {
    temp: number | null;
    condition: string;
    icon: string;
  };
  today: {
    high: number | null;
    low: number | null;
  };
};

function formatTime(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const hh = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDay(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

// Vibrant color palette for event cards
const EVENT_COLORS = [
  {
    bg: "bg-gradient-to-br from-rose-500/20 to-pink-500/20",
    border: "border-rose-400/40",
    glow: "shadow-rose-500/20",
    hoverBorder: "hover:border-rose-400/60",
  },
  {
    bg: "bg-gradient-to-br from-violet-500/20 to-purple-500/20",
    border: "border-violet-400/40",
    glow: "shadow-violet-500/20",
    hoverBorder: "hover:border-violet-400/60",
  },
  {
    bg: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
    border: "border-blue-400/40",
    glow: "shadow-blue-500/20",
    hoverBorder: "hover:border-blue-400/60",
  },
  {
    bg: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-400/40",
    glow: "shadow-emerald-500/20",
    hoverBorder: "hover:border-emerald-400/60",
  },
  {
    bg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
    border: "border-amber-400/40",
    glow: "shadow-amber-500/20",
    hoverBorder: "hover:border-amber-400/60",
  },
  {
    bg: "bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20",
    border: "border-fuchsia-400/40",
    glow: "shadow-fuchsia-500/20",
    hoverBorder: "hover:border-fuchsia-400/60",
  },
  {
    bg: "bg-gradient-to-br from-indigo-500/20 to-blue-500/20",
    border: "border-indigo-400/40",
    glow: "shadow-indigo-500/20",
    hoverBorder: "hover:border-indigo-400/60",
  },
  {
    bg: "bg-gradient-to-br from-lime-500/20 to-green-500/20",
    border: "border-lime-400/40",
    glow: "shadow-lime-500/20",
    hoverBorder: "hover:border-lime-400/60",
  },
  {
    bg: "bg-gradient-to-br from-sky-500/20 to-blue-500/20",
    border: "border-sky-400/40",
    glow: "shadow-sky-500/20",
    hoverBorder: "hover:border-sky-400/60",
  },
  {
    bg: "bg-gradient-to-br from-red-500/20 to-orange-500/20",
    border: "border-red-400/40",
    glow: "shadow-red-500/20",
    hoverBorder: "hover:border-red-400/60",
  },
];

function getEventColor(index: number) {
  return EVENT_COLORS[index % EVENT_COLORS.length];
}

// Fun greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "🌙 Good Night";
  if (hour < 12) return "🌅 Good Morning";
  if (hour < 17) return "☀️ Good Afternoon";
  if (hour < 21) return "🌆 Good Evening";
  return "🌙 Good Night";
}

// Clock component with animated time - compact version
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = ((hours + 11) % 12) + 1;

  const dayName = time.toLocaleDateString(undefined, { weekday: "long" });
  const monthDay = time.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-4 border border-blue-500/30 backdrop-blur-sm h-full">
      <div className="flex items-center justify-between gap-4 h-full">
        <div className="flex-1">
          <div className="text-xl font-semibold tracking-wide">{dayName}</div>
          <div className="text-sm opacity-70">{monthDay}</div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-4xl font-bold tabular-nums tracking-tight">
            {displayHours.toString().padStart(2, "0")}
            <span className="animate-pulse">:</span>
            {minutes.toString().padStart(2, "0")}
          </div>
          <div className="text-lg font-medium opacity-60">{ampm}</div>
        </div>
      </div>
    </div>
  );
}

// Weather component - compact version
function WeatherDisplay({ weather }: { weather: Weather | null }) {
  if (!weather) {
    return (
      <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl p-4 border border-cyan-500/30 backdrop-blur-sm h-full flex items-center justify-center">
        <div className="text-center opacity-50">Loading weather...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl p-4 border border-cyan-500/30 backdrop-blur-sm h-full">
      <div className="flex items-center justify-between gap-4 h-full">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{weather.current.icon}</div>
          <div>
            <div className="text-3xl font-bold">
              {weather.current.temp !== null ? `${weather.current.temp}°` : "—"}
            </div>
            <div className="text-sm opacity-80">{weather.current.condition}</div>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider opacity-60 mb-1">High</div>
            <div className="text-xl font-semibold">
              {weather.today.high !== null ? `${weather.today.high}°` : "—"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Low</div>
            <div className="text-xl font-semibold">
              {weather.today.low !== null ? `${weather.today.low}°` : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Event count card - compact version
function EventCountCard({ count }: { count: number }) {
  return (
    <div className="bg-gradient-to-br from-pink-600/20 to-orange-600/20 rounded-2xl p-4 border border-pink-500/30 backdrop-blur-sm h-full">
      <div className="flex flex-col justify-center items-center h-full text-center">
        {count > 0 ? (
          <>
            <div className="text-5xl font-bold text-pink-300 mb-1">{count}</div>
            <div className="text-sm opacity-80">
              Event{count !== 1 ? 's' : ''} Coming Up
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl font-bold text-pink-300 mb-1">✓</div>
            <div className="text-sm opacity-80">All Clear!</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadEvents() {
    try {
      const r = await fetch("/api/events", { cache: "no-store" });
      const j = await r.json();
      if (j.error) setError(j.error);
      setEvents(j.events ?? []);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to load";
      setError(errorMessage);
    }
  }

  async function loadWeather() {
    try {
      const r = await fetch("/api/weather", { cache: "no-store" });
      const j = await r.json();
      setWeather(j);
    } catch (e) {
      console.error("Weather load error:", e);
    }
  }

  useEffect(() => {
    loadEvents();
    loadWeather();
    const eventsTimer = setInterval(loadEvents, 60_000); // refresh events every minute
    const weatherTimer = setInterval(loadWeather, 30 * 60_000); // refresh weather every 30 minutes
    return () => {
      clearInterval(eventsTimer);
      clearInterval(weatherTimer);
    };
  }, []);

  // Group by day - handle multi-day events
  const byDay = useMemo(() => {
    const map = new Map<string, Event[]>();

    for (const ev of events) {
      const startDate = new Date(ev.start);
      const endDate = new Date(ev.end);

      // Reset time to start of day for comparison
      const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      // Check if event spans multiple days
      const isMultiDay = endDay.getTime() > startDay.getTime();

      if (isMultiDay) {
        // Add event to each day it spans
        const currentDay = new Date(startDay);
        while (currentDay <= endDay) {
          const key = currentDay.toDateString();
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(ev);
          currentDay.setDate(currentDay.getDate() + 1);
        }
      } else {
        // Single day event
        const key = startDay.toDateString();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(ev);
      }
    }

    // Sort each day's events
    for (const [, arr] of map) {
      arr.sort((a, b) => +new Date(a.start) - +new Date(b.start));
    }

    // Return as array in chronological order
    return Array.from(map.entries()).sort(
      (a, b) => +new Date(a[0]) - +new Date(b[0])
    );
  }, [events]);

  const totalEvents = events.length;
  const greeting = getGreeting();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <header className="mb-6">
          {/* Greeting Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-light opacity-90">
              {greeting}, Carter Family!
            </h1>
          </div>

          {/* Info cards row: Clock, Weather, and Event Count */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <LiveClock />
            <WeatherDisplay weather={weather} />
            <EventCountCard count={totalEvents} />
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-500 rounded-xl p-3 mb-4 text-sm">
              <b>Note:</b> {error}
            </div>
          )}
        </header>

        {/* Events Grid - More columns for better use of space */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {byDay.map(([key, list]) => {
            const day = new Date(key);
            const isToday = key === new Date().toDateString();
            return (
              <div
                key={key}
                className={`bg-white/5 rounded-2xl p-4 backdrop-blur-sm border transition-all min-h-[400px] flex flex-col ${
                  isToday
                    ? 'border-yellow-400/50 shadow-lg shadow-yellow-400/20 ring-2 ring-yellow-400/30'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-xl font-semibold mb-3 flex items-center justify-between">
                  <span>{formatDay(day)}</span>
                  {isToday && <span className="text-xs bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full">Today</span>}
                </div>
                <div className="space-y-3">
                  {list.map((ev, i) => {
                    const s = new Date(ev.start);
                    const e = new Date(ev.end);
                    const colors = getEventColor(i);

                    // Check if multi-day event
                    const startDay = new Date(s.getFullYear(), s.getMonth(), s.getDate());
                    const endDay = new Date(e.getFullYear(), e.getMonth(), e.getDate());
                    const isMultiDay = endDay.getTime() > startDay.getTime();

                    // Format date range for multi-day events
                    const dateRange = isMultiDay
                      ? `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : null;

                    return (
                      <div
                        key={i}
                        className={`rounded-xl p-3 border-2 backdrop-blur-sm transition-all shadow-lg ${colors.bg} ${colors.border} ${colors.glow} ${colors.hoverBorder} hover:shadow-xl ${isMultiDay ? 'ring-1 ring-white/20' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-lg font-medium flex-1">{ev.title}</div>
                          {isMultiDay && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap">Multi-day</span>
                          )}
                        </div>
                        {isMultiDay && (
                          <div className="text-xs opacity-70 mt-1 font-medium">
                            📅 {dateRange}
                          </div>
                        )}
                        <div className="text-sm opacity-80 mt-1">
                          {!isMultiDay && `${formatTime(s)} – ${formatTime(e)}`}
                          {isMultiDay && 'All Day'}
                          {ev.location ? ` · ${ev.location}` : ""}
                        </div>
                        {ev.description ? (
                          <div className="text-sm opacity-70 mt-1 line-clamp-3">{ev.description}</div>
                        ) : null}
                      </div>
                    );
                  })}
                  {list.length === 0 && <div className="opacity-70">No events</div>}
                </div>
              </div>
            );
          })}
        </section>
      </div>
      {/* Minimal inline tailwind via Vercel preset – no extra config needed */}
      <style jsx global>{`
        html, body { margin: 0; }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}
