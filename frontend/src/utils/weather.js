const ICONS = {
  clear: '☀️',
  mainlyClear: '🌤️',
  partlyCloudy: '⛅',
  overcast: '☁️',
  fog: '🌫️',
  drizzle: '🌦️',
  rain: '🌧️',
  snow: '❄️',
  showers: '🌦️',
  thunder: '⛈️',
  unknown: '🌡️',
};

export function getWeatherIcon(code) {
  if (code === 0) return ICONS.clear;
  if (code <= 1) return ICONS.mainlyClear;
  if (code === 2) return ICONS.partlyCloudy;
  if (code === 3) return ICONS.overcast;
  if (code <= 48) return ICONS.fog;
  if (code <= 55) return ICONS.drizzle;
  if (code <= 67) return ICONS.rain;
  if (code <= 77) return ICONS.snow;
  if (code <= 82) return ICONS.showers;
  if (code >= 95) return ICONS.thunder;
  return ICONS.unknown;
}

export function formatTemp(celsius) {
  if (celsius == null) return '—';
  return `${Math.round(celsius)}°C`;
}

export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function windDirection(degrees) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}
