export default function AboutSection() {
  return (
    <section className="about-screen" aria-label="About PM Accelerator">
      <div className="screen-title">
        <h2>About</h2>
        <p>PM Accelerator · Technical Assessment</p>
      </div>

      <div className="about-card glass-card">
        <div className="about-icon" aria-hidden="true">🚀</div>
        <h3>PM Accelerator</h3>
        <p>
          <strong>Product Manager Accelerator</strong> is a career development program
          that helps aspiring and early-career product managers build the skills, portfolio,
          and network needed to break into product management.
        </p>
        <p>
          The program combines hands-on projects, mentorship from industry professionals,
          and real-world experience to prepare candidates for PM roles at top companies.
        </p>
        <a
          className="about-link-btn"
          href="https://www.linkedin.com/company/product-manager-accelerator"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on LinkedIn →
        </a>
      </div>

      <div className="about-card glass-card muted">
        <h4>Data Sources</h4>
        <p>Weather · <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a></p>
        <p>Maps · OpenStreetMap & Google Maps</p>
        <p className="copyright">© 2026 Wajid Karim</p>
      </div>
    </section>
  );
}
