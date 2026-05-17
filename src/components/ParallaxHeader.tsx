const HERO_IMAGE =
  "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1800&q=80";

function ParallaxHeader() {
  return (
    <section className="hero" aria-label="Cryptonite">
      <div className="hero-bg" aria-hidden="true">
        <div
          className="hero-parallax"
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        />
        <div className="hero-overlay" />
        <span className="hero-grid" />
      </div>
      <div className="hero-content">
        <span className="hero-badge">Live market intelligence</span>
        <h1>
          <span className="hero-title-accent">Crypto</span>nite
        </h1>
        <p className="hero-subtitle">
          Browse top assets, stream live USD charts, and get AI-assisted insights on your watchlist.
        </p>
      </div>
    </section>
  );
}

export default ParallaxHeader;
