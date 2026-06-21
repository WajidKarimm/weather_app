export default function SearchBar({ location, onLocationChange, onSearch, onUseMyLocation, loading }) {
  return (
    <form className="search-bar" onSubmit={onSearch} aria-label="Search weather by location">
      <div className="search-pill">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          id="location-input"
          type="search"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="City, zip, landmark…"
          disabled={loading}
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>

      <div className="search-actions">
        <button type="submit" className="btn btn-primary btn-block" disabled={loading || !location.trim()}>
          {loading ? 'Searching…' : 'Get Weather'}
        </button>
        <button type="button" className="btn btn-glass" onClick={onUseMyLocation} disabled={loading}>
          <span aria-hidden="true">📍</span> My Location
        </button>
      </div>
    </form>
  );
}

export function ErrorAlert({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="toast-error" role="alert">
      <span className="toast-icon" aria-hidden="true">⚠️</span>
      <p>{error}</p>
      {onDismiss && (
        <button type="button" className="toast-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}
