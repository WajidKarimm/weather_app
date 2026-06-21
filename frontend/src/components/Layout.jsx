export default function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <div>
          <h1>Weather App</h1>
          <p className="author">Built by <strong>Wajid Karim</strong></p>
        </div>
        <p className="tagline">Real-time weather for your location or anywhere you plan to travel</p>
      </div>
    </header>
  );
}

export function AboutSection() {
  return (
    <section className="about-section card" aria-label="About PM Accelerator">
      <h3>About PM Accelerator</h3>
      <p>
        <strong>Product Manager Accelerator (PM Accelerator)</strong> is a career development program
        that helps aspiring and early-career product managers build the skills, portfolio, and network
        needed to break into and excel in product management. The program combines hands-on projects,
        mentorship from industry professionals, and real-world experience to prepare candidates for
        PM roles at top companies.
      </p>
      <p>
        Learn more on{' '}
        <a
          href="https://www.linkedin.com/company/product-manager-accelerator"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn — Product Manager Accelerator
        </a>
      </p>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="app-footer">
      <p>Weather data from <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · Maps via OpenStreetMap</p>
      <p>© 2026 Wajid Karim — PM Accelerator Technical Assessment</p>
    </footer>
  );
}
