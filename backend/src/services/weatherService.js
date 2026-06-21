const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const WEATHER_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export function getWeatherDescription(code) {
  return WEATHER_CODES[code] ?? 'Unknown';
}

function parseCoordinates(query) {
  const trimmed = query.trim();
  const coordMatch = trimmed.match(/^(-?\d+\.?\d*)\s*[,;\s]\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { latitude: lat, longitude: lon, name: `${lat}, ${lon}`, country: null };
    }
  }
  return null;
}

export async function geocodeLocation(query) {
  const coords = parseCoordinates(query);
  if (coords) return coords;

  const response = await fetch(
    `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  );
  if (!response.ok) {
    throw new Error('Geocoding service unavailable');
  }

  const data = await response.json();

  if (!data.results?.length) {
    throw new Error(`Location "${query}" not found. Try a city name, zip code, or coordinates (lat, lon).`);
  }

  const best = data.results[0];
  return {
    latitude: best.latitude,
    longitude: best.longitude,
    name: best.name,
    country: best.country,
    admin1: best.admin1,
  };
}
export async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en`
  );

  if (!response.ok) {
    return { name: `${latitude}, ${longitude}`, country: null };
  }

  const data = await response.json();
  if (!data.results?.length) {
    return { name: `${latitude}, ${longitude}`, country: null };
  }

  const place = data.results[0];
  return {
    name: place.name,
    country: place.country,
    admin1: place.admin1,
    latitude,
    longitude,
  };
}

export async function fetchCurrentWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '5',
  });

  const response = await fetch(`${WEATHER_URL}?${params}`);

  if (!response.ok) {
    throw new Error('Weather service unavailable. Please try again later.');
  }

  return response.json();
}

export async function fetchHistoricalTemperatures(latitude, longitude, startDate, endDate) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: startDate,
    end_date: endDate,
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    timezone: 'auto',
  });

  const response = await fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`);

  if (!response.ok) {
    const forecastParams = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      start_date: startDate,
      end_date: endDate,
      daily: 'temperature_2m_max,temperature_2m_min,weather_code',
      timezone: 'auto',
    });
    const forecastResponse = await fetch(`${WEATHER_URL}?${forecastParams}`);
    if (!forecastResponse.ok) {
      throw new Error('Unable to fetch temperature data for the specified date range.');
    }
    return forecastResponse.json();
  }

  return response.json();
}

export function formatForecast(daily) {
  if (!daily?.time) return [];

  return daily.time.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    weatherCode: daily.weather_code[i],
    description: getWeatherDescription(daily.weather_code[i]),
    precipitationProbability: daily.precipitation_probability_max?.[i] ?? null,
  }));}

export function formatTemperatureSeries(daily) {
  if (!daily?.time) return [];

  return daily.time.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    weatherCode: daily.weather_code[i],
    description: getWeatherDescription(daily.weather_code[i]),
  }));
}

export async function fetchYouTubeVideos(locationName, apiKey) {
  if (!apiKey) {
    return {
      source: 'search_link',
      videos: [],
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(locationName + ' travel guide')}`,
      message: 'Set YOUTUBE_API_KEY in .env for embedded video results',
    };
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: `${locationName} travel`,
      type: 'video',
      maxResults: '3',
      key: apiKey,
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!response.ok) throw new Error('YouTube API error');

    const data = await response.json();
    return {
      source: 'youtube_api',
      videos: (data.items ?? []).map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url,
        channel: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })),
    };
  } catch {
    return {
      source: 'search_link',
      videos: [],
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(locationName + ' travel guide')}`,
      message: 'YouTube API unavailable; using search link fallback',
    };
  }
}

export function getMapData(location) {
  const { latitude, longitude, name } = location;
  return {
    latitude,
    longitude,
    name,
    openStreetMapUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=12/${latitude}/${longitude}`,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    embedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.1}%2C${latitude - 0.05}%2C${longitude + 0.1}%2C${latitude + 0.05}&layer=mapnik&marker=${latitude}%2C${longitude}`,
  };
}