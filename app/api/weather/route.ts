// app/api/weather/route.ts
import { NextResponse } from "next/server";

// Weather code mapping from Open-Meteo
// https://open-meteo.com/en/docs
const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear", icon: "☀️" },
  1: { description: "Mainly Clear", icon: "🌤️" },
  2: { description: "Partly Cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Foggy", icon: "🌫️" },
  48: { description: "Foggy", icon: "🌫️" },
  51: { description: "Light Drizzle", icon: "🌦️" },
  53: { description: "Drizzle", icon: "🌦️" },
  55: { description: "Heavy Drizzle", icon: "🌧️" },
  61: { description: "Light Rain", icon: "🌧️" },
  63: { description: "Rain", icon: "🌧️" },
  65: { description: "Heavy Rain", icon: "⛈️" },
  71: { description: "Light Snow", icon: "🌨️" },
  73: { description: "Snow", icon: "❄️" },
  75: { description: "Heavy Snow", icon: "❄️" },
  77: { description: "Snow Grains", icon: "🌨️" },
  80: { description: "Light Showers", icon: "🌦️" },
  81: { description: "Showers", icon: "🌧️" },
  82: { description: "Heavy Showers", icon: "⛈️" },
  85: { description: "Light Snow Showers", icon: "🌨️" },
  86: { description: "Snow Showers", icon: "❄️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with Hail", icon: "⛈️" },
  99: { description: "Thunderstorm with Hail", icon: "⛈️" },
};

export async function GET() {
  try {
    let lat: string;
    let lon: string;

    // Check if ZIP_CODE is provided, otherwise use lat/lon
    const zipCode = process.env.ZIP_CODE;

    if (zipCode) {
      // Use zip code geocoding API (supports US zip codes)
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${zipCode}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl, { cache: "force-cache" });

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude.toString();
          lon = geoData.results[0].longitude.toString();
        } else {
          throw new Error(`Could not find location for zip code: ${zipCode}`);
        }
      } else {
        throw new Error("Geocoding API failed");
      }
    } else {
      // Fallback to lat/lon from env or defaults
      lat = process.env.WEATHER_LAT || "37.7749"; // Default to San Francisco
      lon = process.env.WEATHER_LON || "-122.4194";
    }

    // Fetch weather from Open-Meteo (free, no API key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`;

    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 1800 } // Cache for 30 minutes
    });

    if (!res.ok) {
      throw new Error(`Weather API returned ${res.status}`);
    }

    const data = await res.json();

    const weatherCode = data.current.weather_code || 0;
    const weatherInfo = WEATHER_CODES[weatherCode] || { description: "Unknown", icon: "🌡️" };

    return NextResponse.json({
      current: {
        temp: Math.round(data.current.temperature_2m),
        condition: weatherInfo.description,
        icon: weatherInfo.icon,
      },
      today: {
        high: Math.round(data.daily.temperature_2m_max[0]),
        low: Math.round(data.daily.temperature_2m_min[0]),
      },
    });
  } catch (e) {
    console.error("Weather fetch error:", e);
    const errorMessage = e instanceof Error ? e.message : "Failed to fetch weather";
    return NextResponse.json(
      {
        error: errorMessage,
        current: { temp: null, condition: "Unavailable", icon: "🌡️" },
        today: { high: null, low: null }
      },
      { status: 200 }
    );
  }
}
