const mobileLinks = [
  ["/eventcenter", "Eventcenter"],
  ["/garden", "CK Garden"],
  ["/galerie", "Galerie"],
  ["/belegungsplan", "Belegungsplan"],
  ["/buchung", "Buchung"],
  ["/kontakt", "Kontakt"],
];

export function Header({ solid = false }: { solid?: boolean }) {
  return (
    <header className={`site-header${solid ? " header-solid" : ""}`}>
      <a className="brand" href="/" aria-label="CK Eventcenter Startseite">
        <span className="brand-mark">CK</span>
        <span className="brand-name">Eventcenter</span>
        <span className="brand-place">Bergkamen / Deutschland</span>
      </a>
      <nav className="desktop-nav" aria-label="Hauptnavigation">
        <details className="nav-dropdown">
          <summary>Säle <span>⌄</span></summary>
          <div><a href="/eventcenter"><small>01</small><b>CK Eventcenter</b></a><a href="/garden"><small>02</small><b>CK Garden</b></a></div>
        </details>
        <a href="/galerie">Galerie</a>
        <a href="/belegungsplan">Termine</a>
        <a href="/kontakt">Kontakt</a>
        <a className="nav-cta" href="/buchung">Buchung starten <span>↗</span></a>
      </nav>
      <details className="mobile-menu">
        <summary aria-label="Menü öffnen"><span>Menü</span><b>＋</b></summary>
        <nav aria-label="Mobile Navigation">
          {mobileLinks.map(([href, label], index) => <a href={href} key={href}><small>0{index + 1}</small>{label}</a>)}
        </nav>
      </details>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-booking-teaser">
        <div><p className="kicker">Ihr Fest beginnt hier</p><h2>Ein Datum.<br /><em>Ein Versprechen.</em></h2></div>
        <div><p>Prüfen Sie freie Hochzeitstermine, stellen Sie Ihre Feier zusammen und sichern Sie sich anschließend Ihre persönliche Beratung.</p><a className="footer-booking-button" href="/buchung">Buchung beginnen <span>↗</span></a></div>
      </div>
      <div className="footer-grid">
        <div className="footer-identity"><a className="brand footer-brand" href="/"><span className="brand-mark">CK</span><span className="brand-name">Eventcenter</span></a><p>Seit 2015 außergewöhnliche Hochzeiten und große Feiern in Bergkamen.</p></div>
        <div className="footer-column"><span>Besuchen</span><address>Industriestraße 44a<br />59192 Bergkamen<br />Deutschland</address><a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de ↗</a></div>
        <nav className="footer-column" aria-label="Säle und Angebot"><span>Entdecken</span><a href="/eventcenter">CK Eventcenter</a><a href="/garden">CK Garden</a><a href="/galerie">Galerie</a><a href="/belegungsplan">Termine</a><a href="/kontakt">Kontakt</a></nav>
        <nav className="footer-column" aria-label="Rechtliches"><span>Informationen</span><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a><a href="/agb">AGB</a><a href="/barrierefreiheit">Barrierefreiheit</a></nav>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} CK Eventcenter</span><span>Mit Liebe für besondere Augenblicke.</span><a href="#top">Nach oben ↑</a></div>
    </footer>
  );
}

export function PageHero({ index, kicker, title, image, imageAlt }: { index: string; kicker: string; title: React.ReactNode; image: string; imageAlt: string }) {
  return (
    <section className="page-hero" id="top">
      <Header />
      <img src={image} alt={imageAlt} />
      <div className="page-hero-overlay" />
      <div className="page-hero-index">{index}</div>
      <div className="page-hero-copy"><p className="kicker">{kicker}</p><h1>{title}</h1></div>
      <div className="hero-corner">Weiter unten<br />entdecken <span>↓</span></div>
    </section>
  );
}

export function ContactForm() {
  return (
    <form className="contact-form" action="mailto:info@ckeventcenter.de" method="post" encType="text/plain">
      <div className="field-row">
        <label><span>01</span>Vorname<input name="Vorname" autoComplete="given-name" /></label>
        <label><span>02</span>Nachname<input name="Nachname" autoComplete="family-name" /></label>
      </div>
      <label><span>03</span>E-Mail *<input type="email" name="E-Mail" autoComplete="email" required /></label>
      <label><span>04</span>Telefonnummer<input type="tel" name="Telefon" autoComplete="tel" /></label>
      <label><span>05</span>Nachricht an uns *<textarea name="Nachricht" rows={4} required /></label>
      <button className="solid-button" type="submit">Anfrage senden <span>↗</span></button>
      <small>Beim Absenden öffnet sich Ihr E-Mail-Programm.</small>
    </form>
  );
}

export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <main className="legal-page">
      <Header solid />
      <section className="legal-hero"><p className="kicker">{eyebrow}</p><h1>{title}</h1><span className="outline-word">CK / RECHT</span></section>
      <article className="legal-document">{children}</article>
      <Footer />
    </main>
  );
}
