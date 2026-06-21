export default function SearchBar({ location, onLocationChange, onSearch, onUseMyLocation, loading }) {
  return (
    <form className="search-bar card" onSubmit={onSearch} aria-label="Search weather by location">
      <div className="search-input-group">
        <label htmlFor="location-input">Location</label>
        <input
          id="location-input"
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="City, zip code, landmark, or lat, lon"
          disabled={loading}
          autoComplete="off"
        />
        <p className="input-hint">
          Examples: &quot;New York&quot;, &quot;90210&quot;, &quot;Eiffel Tower&quot;, &quot;40.71, -74.01&quot;
        </p>
      </div>
      <div className="search-actions">
        <button type="submit" className="btn btn-primary" disabled={loading || !location.trim()}>
          {loading ? 'Searching…' : 'Get Weather'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onUseMyLocation} disabled={loading}>
          📍 Use My Location
        </button>
      </div>
    </form>
  );
}

export function ErrorAlert({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="error-alert" role="alert">
      <div className="error-content">
        <strong>Error</strong>
        <p>{error}</p>
      </div>
      {onDismiss && (
        <button type="button" className="error-dismiss" onClick={onDismiss} aria-label="Dismiss error">
          ✕
        </button>
      )}
    </div>
  );
}
