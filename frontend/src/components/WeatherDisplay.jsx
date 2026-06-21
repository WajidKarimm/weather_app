import { getWeatherIcon, formatTemp, formatDate, windDirection } from '../utils/weather';

export default function CurrentWeather({ data }) {
  if (!data) return null;
  const { location, current, timezone } = data;

  return (
    <section className="current-weather card" aria-label="Current weather">
      <div className="current-header">
        <div>
          <h2>{location.name}{location.country ? `, ${location.country}` : ''}</h2>
          {location.admin1 && <p className="subtitle">{location.admin1}</p>}
          <p className="coords">{location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°</p>
        </div>
        <div className="weather-icon-large" aria-hidden="true">
          {getWeatherIcon(current.weatherCode)}
        </div>
      </div>

      <div className="current-main">
        <span className="temp-display">{formatTemp(current.temperature)}</span>
        <span className="condition">{current.description}</span>
      </div>

      <div className="details-grid">
        <Detail label="Feels Like" value={formatTemp(current.feelsLike)} />
        <Detail label="Humidity" value={`${current.humidity}%`} />
        <Detail label="Wind" value={`${current.windSpeed} km/h ${windDirection(current.windDirection)}`} />
        <Detail label="Pressure" value={`${current.pressure} hPa`} />
        <Detail label="Timezone" value={timezone} />
      </div>
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

export function Forecast({ forecast }) {
  if (!forecast?.length) return null;

  return (
    <section className="forecast card" aria-label="5-day forecast">
      <h3>5-Day Forecast</h3>
      <div className="forecast-list">
        {forecast.map((day) => (
          <div key={day.date} className="forecast-day">
            <span className="forecast-date">{formatDate(day.date)}</span>
            <span className="forecast-icon" aria-hidden="true">{getWeatherIcon(day.weatherCode)}</span>
            <span className="forecast-desc">{day.description}</span>
            <span className="forecast-temps">
              <span className="temp-high">{formatTemp(day.tempMax)}</span>
              <span className="temp-low">{formatTemp(day.tempMin)}</span>
            </span>
            {day.precipitationProbability != null && (
              <span className="forecast-rain">💧 {day.precipitationProbability}%</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function MapEmbed({ map }) {
  if (!map) return null;
  return (
    <section className="map-section card" aria-label="Location map">
      <h3>Location Map</h3>
      <iframe
        title={`Map of ${map.name}`}
        src={map.embedUrl}
        className="map-iframe"
        loading="lazy"
      />
      <div className="map-links">
        <a href={map.openStreetMapUrl} target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
        <a href={map.googleMapsUrl} target="_blank" rel="noopener noreferrer">Google Maps</a>
      </div>
    </section>
  );
}
