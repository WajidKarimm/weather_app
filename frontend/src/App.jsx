import { useState, useCallback } from 'react';
import AppShell, { BottomNav } from './components/Layout';
import SearchBar, { ErrorAlert } from './components/SearchBar';
import CurrentWeather, { Forecast, MapEmbed } from './components/WeatherDisplay';
import RecordsPanel from './components/RecordsPanel';
import AboutSection from './components/AboutSection';
import { fetchCurrentWeather, fetchCurrentWeatherByCoords } from './api';
import './index.css';

export default function App() {
  const [tab, setTab] = useState('home');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchWeather = useCallback(async (searchLocation) => {
    setLoading(true);
    setError(null);
    setWeather(null);
    try {
      const data = await fetchCurrentWeather(searchLocation);
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (location.trim()) searchWeather(location.trim());
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);
    setWeather(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchCurrentWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
          setWeather(data);
          setLocation(data.location.name);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);
        const messages = {
          1: 'Location permission denied. Allow access or enter a city manually.',
          2: 'Unable to determine your position. Try entering a location.',
          3: 'Location request timed out. Please try again.',
        };
        setError(messages[geoError.code] || 'Failed to get your location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="app-viewport">
      <div className="phone-frame">
        <AppShell />

        <main className="app-screen">
          {tab === 'home' && (
            <div className="screen-content screen-home">
              <SearchBar
                location={location}
                onLocationChange={setLocation}
                onSearch={handleSearch}
                onUseMyLocation={handleUseMyLocation}
                loading={loading}
              />

              <ErrorAlert error={error} onDismiss={() => setError(null)} />

              {loading && (
                <div className="loading-state" role="status">
                  <div className="spinner" aria-hidden="true" />
                  <p>Loading weather…</p>
                </div>
              )}

              {!loading && !weather && !error && (
                <div className="empty-home">
                  <span className="empty-icon" aria-hidden="true">🌤️</span>
                  <p>Search a city or use your location to get started.</p>
                </div>
              )}

              {weather && !loading && (
                <>
                  <CurrentWeather data={weather} />
                  <Forecast forecast={weather.forecast} />
                  <MapEmbed map={weather.map} />
                </>
              )}
            </div>
          )}

          {tab === 'saved' && (
            <div className="screen-content">
              <RecordsPanel />
            </div>
          )}

          {tab === 'about' && (
            <div className="screen-content">
              <AboutSection />
            </div>
          )}
        </main>

        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}
