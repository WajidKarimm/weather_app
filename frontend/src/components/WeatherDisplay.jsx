import { getWeatherIcon, formatTemp, formatDate, windDirection } from '../utils/weather';

export default function CurrentWeather({ data }) {
  if (!data) return null;
  const { location, current } = data;

  return (
    <section className="hero-weather" aria-label="Current weather">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-content">
        <p className="hero-location">
          {location.name}{location.country ? `, ${location.country}` : ''}
        </p>
        {location.admin1 && <p className="hero-region">{location.admin1}</p>}

        <div className="hero-main">
          <span className="hero-icon" aria-hidden="true">{getWeatherIcon(current.weatherCode)}</span>
          <span className="hero-temp">{formatTemp(current.temperature)}</span>
        </div>

        <p className="hero-condition">{current.description}</p>
        <p className="hero-feels">Feels like {formatTemp(current.feelsLike)}</p>
      </div>

      <div className="stats-row">
        <Stat icon="💧" label="Humidity" value={`${current.humidity}%`} />
        <Stat icon="💨" label="Wind" value={`${current.windSpeed} km/h`} />
        <Stat icon="🧭" label="Direction" value={windDirection(current.windDirection)} />
        <Stat icon="🔽" label="Pressure" value={`${current.pressure}`} />
      </div>
    </section>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat-chip">
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

export function Forecast({ forecast }) {
  if (!forecast?.length) return null;

  return (
    <section className="forecast-section" aria-label="5-day forecast">
      <h3 className="section-label">5-Day Forecast</h3>
      <div className="forecast-scroll">
        {forecast.map((day) => (
          <div key={day.date} className="forecast-card">
            <span className="fc-day">{formatDate(day.date)}</span>
            <span className="fc-icon" aria-hidden="true">{getWeatherIcon(day.weatherCode)}</span>
            <span className="fc-high">{formatTemp(day.tempMax)}</span>
            <span className="fc-low">{formatTemp(day.tempMin)}</span>
            {day.precipitationProbability != null && (
              <span className="fc-rain">💧 {day.precipitationProbability}%</span>
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
    <section className="map-section" aria-label="Location map">
      <h3 className="section-label">Map</h3>
      <div className="map-card glass-card">
        <iframe
          title={`Map of ${map.name}`}
          src={map.embedUrl}
          className="map-iframe"
          loading="lazy"
        />
        <div className="map-actions">
          <a className="map-btn" href={map.googleMapsUrl} target="_blank" rel="noopener noreferrer">
            Google Maps
          </a>
          <a className="map-btn" href={map.openStreetMapUrl} target="_blank" rel="noopener noreferrer">
            OpenStreetMap
          </a>
        </div>
      </div>
    </section>
  );
}
