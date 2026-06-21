export default function AppShell() {
  return (
    <header className="app-status-bar">
      <div className="status-left">
        <span className="app-logo" aria-hidden="true">☁</span>
        <div>
          <h1>Weather</h1>
          <p className="app-author">Wajid Karim</p>
        </div>
      </div>
      <time className="status-time">
        {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </time>
    </header>
  );
}

export function BottomNav({ active, onChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'saved', label: 'Saved', icon: '📋' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`nav-item ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
          aria-current={active === t.id ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
