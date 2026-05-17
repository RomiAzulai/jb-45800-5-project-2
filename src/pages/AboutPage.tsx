function AboutPage() {
  return (
    <section className="content-section about-layout">
      <div className="about-copy">
        <h2>About Cryptonite</h2>
        <p>
          Cryptonite is a React and TypeScript SPA that displays cryptocurrency market data,
          real-time USD reports, and AI-assisted recommendations for selected virtual currencies.
        </p>
        <div className="about-tags">
          <span>React</span>
          <span>TypeScript</span>
          <span>Redux</span>
          <span>REST APIs</span>
          <span>OpenAI</span>
        </div>
        <dl>
          <div>
            <dt>Developer</dt>
            <dd>Romy Azulai</dd>
          </div>
        </dl>
      </div>
      <div className="profile-panel" aria-label="Developer photo placeholder">
        <div className="profile-image">R</div>
      </div>
    </section>
  );
}

export default AboutPage;
