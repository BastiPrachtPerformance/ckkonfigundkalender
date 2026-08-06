const images = {
  hero: "https://static.wixstatic.com/media/31e770_12f637f5b6964ab6a69a4298016fb824~mv2.jpg/v1/crop/x_0%2Cy_88%2Cw_1616%2Ch_904/fill/w_1800%2Ch_1007%2Cal_c%2Cq_90/GLN006862_JPG.jpg",
  eventcenter: "https://static.wixstatic.com/media/31e770_32b6ce2ba36045b591d9c6f38cbff3a4~mv2.jpg/v1/fill/w_1200%2Ch_1500%2Cal_c%2Cq_90/GLN000732_JPG.jpg",
  garden: "https://static.wixstatic.com/media/31e770_86a01a201d5e4dfda964af01c87a2d0f~mv2.jpeg/v1/fill/w_1200%2Ch_1500%2Cal_c%2Cq_90/image00070.jpeg",
};

const gallery = [
  ["https://static.wixstatic.com/media/31e770_1c8cb24ce5ee46c29bd0ce0bc99b095a~mv2.jpg/v1/fill/w_1200%2Ch_800%2Cal_c%2Cq_88/GLN004102_JPG.jpg", "Festlich gedeckter Saal im CK Eventcenter"],
  ["https://static.wixstatic.com/media/31e770_6d38e3faed604a5b8a90a1e7eaa1a51a~mv2.jpeg/v1/crop/x_0%2Cy_237%2Cw_2110%2Ch_2206/fill/w_1000%2Ch_1047%2Cal_c%2Cq_88/image00061.jpeg", "CK Garden mit stilvoller Dekoration"],
  ["https://static.wixstatic.com/media/31e770_1c952442ff3240b8ae091cce9cd57dc9~mv2.jpg/v1/fill/w_1200%2Ch_800%2Cal_c%2Cq_88/GLN000053_JPG.jpg", "Große Feier im CK Eventcenter"],
  ["https://static.wixstatic.com/media/31e770_e5237112bd7f44438f66ca075b5dd043~mv2.jpg/v1/fill/w_1200%2Ch_800%2Cal_c%2Cq_88/GLN004902_JPG.jpg", "Elegantes Lichtkonzept im Festsaal"],
  ["https://static.wixstatic.com/media/31e770_d6ddb85b62834a47b6c6e01a9dbd2dde~mv2.jpeg/v1/crop/x_0%2Cy_672%2Cw_2160%2Ch_1914/fill/w_1000%2Ch_887%2Cal_c%2Cq_88/image00015.jpeg", "Feierliche Atmosphäre im CK Garden"],
  ["https://static.wixstatic.com/media/31e770_d37daeaea31a4fe787200ea7737ce349~mv2.jpg/v1/fill/w_1200%2Ch_800%2Cal_c%2Cq_88/GLN004042_JPG.jpg", "Tischdekoration für ein besonderes Fest"],
  ["https://static.wixstatic.com/media/31e770_decf64885404411f972306c020c63966~mv2.jpg/v1/fill/w_1000%2Ch_1300%2Cal_c%2Cq_88/GLN004413_JPG.jpg", "Hochzeit im CK Eventcenter"],
  ["https://static.wixstatic.com/media/31e770_7683b9bd0ba944c098736c89c5b55a8d~mv2.jpg/v1/fill/w_1200%2Ch_800%2Cal_c%2Cq_88/GLN004232_JPG.jpg", "Blick in den festlich geschmückten Saal"],
  ["https://static.wixstatic.com/media/31e770_768bc1e3d7e6447bb730635633945296~mv2.jpeg/v1/fill/w_1000%2Ch_1300%2Cal_c%2Cq_88/image00067.jpeg", "Abendstimmung im CK Garden"],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="CK Eventcenter Startseite">
          <span className="brand-mark">CK</span>
          <span className="brand-copy">Eventcenter<small>Bergkamen</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Hauptnavigation">
          <a href="#locations">Locations</a>
          <a href="#galerie">Galerie</a>
          <a href="#belegung">Belegungsplan</a>
          <a className="nav-cta" href="#kontakt">Gespräch vereinbaren</a>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Menü öffnen"><span>Menü</span></summary>
          <nav aria-label="Mobile Navigation">
            <a href="#locations">Locations</a>
            <a href="#galerie">Galerie</a>
            <a href="#belegung">Belegungsplan</a>
            <a href="#kontakt">Gespräch vereinbaren</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="top">
        <img src={images.hero} alt="Festlich beleuchteter Saal des CK Eventcenters" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">Ihre Eventlocation in Bergkamen</p>
          <h1>Momente,<br /><em>die bleiben.</em></h1>
          <p className="hero-lead">Zwei außergewöhnliche Locations. Ein Ort für Hochzeiten, große Feiern und unvergessliche Augenblicke.</p>
          <div className="hero-actions">
            <a className="button button-light" href="#kontakt">Gespräch vereinbaren</a>
            <a className="text-link" href="#locations">Locations entdecken <span>↘</span></a>
          </div>
        </div>
        <div className="hero-note"><span>CK</span><p>Eventcenter<br />&amp; Garden</p></div>
      </section>

      <section className="intro section-pad">
        <p className="section-index">01 / Willkommen</p>
        <div>
          <h2>Magische Momente<br />beginnen mit dem <em>richtigen Ort.</em></h2>
          <p>Im CK Eventcenter Bergkamen wird aus Ihrer Feier ein Erlebnis. Großzügige Räume, ein elegantes Ambiente und viel Liebe zum Detail schaffen den Rahmen für die Momente, an die Sie sich gerne erinnern.</p>
        </div>
      </section>

      <section className="locations section-pad" id="locations">
        <div className="section-heading">
          <p className="section-index">02 / Unsere Locations</p>
          <h2>Zwei Räume.<br /><em>Unendlich viele Möglichkeiten.</em></h2>
        </div>

        <article className="location-card location-large">
          <div className="location-image"><img src={images.eventcenter} alt="Der große Festsaal des CK Eventcenters" /></div>
          <div className="location-copy">
            <span className="location-number">01</span>
            <p className="eyebrow">Große Feiern · Glanzvolle Hochzeiten</p>
            <h3>Das CK<br />Eventcenter</h3>
            <p>Hier wird Ihr großer Traum wahr. Der prachtvolle Saal verbindet eine atemberaubende Atmosphäre mit großzügiger Fläche – ideal, um Liebe und Freude mit Familie und Freunden zu teilen.</p>
            <a className="text-link dark" href="#kontakt">Location anfragen <span>↗</span></a>
          </div>
        </article>

        <article className="location-card location-reverse">
          <div className="location-copy">
            <span className="location-number">02</span>
            <p className="eyebrow">Natur · Stil · Leichtigkeit</p>
            <h3>CK&apos;s<br /><em>Garden</em></h3>
            <p>Unser neu gebauter, zauberhafter Saal ist die ideale Kulisse für Hochzeiten und Feierlichkeiten aller Art. Natur und stilvolles Design verbinden sich zu einer Atmosphäre, in der jeder Moment fast wie aus einem Märchen wirkt.</p>
            <a className="text-link dark" href="#kontakt">Location anfragen <span>↗</span></a>
          </div>
          <div className="location-image"><img src={images.garden} alt="CK Garden in natürlicher, eleganter Atmosphäre" /></div>
        </article>
      </section>

      <section className="booking section-pad" id="belegung">
        <p className="section-index light">03 / Belegungsplan</p>
        <div className="booking-main">
          <p className="eyebrow">Ihr Wunschtermin</p>
          <h2>Ist Ihr Datum<br /><em>noch frei?</em></h2>
          <p>Werfen Sie einen Blick in den Buchungskalender oder sprechen Sie direkt mit uns. Gemeinsam prüfen wir Ihren Termin und besprechen, welche unserer Locations am besten zu Ihrer Feier passt.</p>
          <div className="booking-actions">
            <a className="button button-gold" href="https://www.ckeventcenter.de/belegungsplan" target="_blank" rel="noreferrer">Buchungskalender öffnen</a>
            <a className="text-link" href="#kontakt">Direkt anfragen <span>↘</span></a>
          </div>
        </div>
        <div className="booking-date" aria-hidden="true"><strong>365</strong><span>Tage voller<br />Möglichkeiten</span></div>
      </section>

      <section className="gallery-section section-pad" id="galerie">
        <div className="section-heading gallery-heading">
          <div><p className="section-index">04 / Fotogalerie</p><h2>Einblicke in<br /><em>besondere Augenblicke.</em></h2></div>
          <p>Fotos aus unseren Sälen – echte Feiern, liebevolle Details und die besondere Atmosphäre des CK Eventcenters.</p>
        </div>
        <div className="gallery-grid">
          {gallery.map(([src, alt], index) => (
            <figure key={src} className={`gallery-item gallery-${index + 1}`}>
              <img src={src} alt={alt} loading={index > 2 ? "lazy" : "eager"} />
            </figure>
          ))}
        </div>
      </section>

      <section className="contact section-pad" id="kontakt">
        <div className="contact-copy">
          <p className="section-index light">05 / Gespräch vereinbaren</p>
          <h2>Erzählen Sie uns<br />von Ihrem <em>großen Tag.</em></h2>
          <p>Sie planen eine Hochzeit oder Feier? Schreiben Sie uns. Wir melden uns persönlich und besprechen alles Weitere in Ruhe mit Ihnen.</p>
          <address>
            <span>CK Eventcenter</span>
            Industriestraße 44a<br />59192 Bergkamen<br />
            <a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de</a>
          </address>
        </div>
        <form className="contact-form" action="mailto:info@ckeventcenter.de" method="post" encType="text/plain">
          <div className="form-row">
            <label>Vorname<input name="Vorname" autoComplete="given-name" /></label>
            <label>Nachname<input name="Nachname" autoComplete="family-name" /></label>
          </div>
          <label>E-Mail *<input type="email" name="E-Mail" autoComplete="email" required /></label>
          <label>Telefonnummer<input type="tel" name="Telefon" autoComplete="tel" /></label>
          <label>Nachricht an uns *<textarea name="Nachricht" rows={4} required /></label>
          <button className="button button-gold" type="submit">Anfrage senden <span>↗</span></button>
          <small>Mit dem Absenden öffnet sich Ihr E-Mail-Programm.</small>
        </form>
      </section>

      <section className="legal section-pad" id="rechtliches">
        <div className="section-heading compact"><p className="section-index">06 / Rechtliches</p><h2>Transparent.<br /><em>Von Anfang an.</em></h2></div>
        <div className="legal-list">
          <details id="impressum">
            <summary>Impressum <span>+</span></summary>
            <div className="legal-content">
              <p><strong>Angaben gemäß § 5 TMG</strong><br />CK Eventcenter<br />Industriestraße 44a<br />59192 Bergkamen</p>
              <p>Inhaber: Cevat Demircan<br />E-Mail: <a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de</a><br />Website: www.ckeventcenter.de</p>
              <p><strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</strong><br />Cevat Demircan, Industriestraße 44a, 59192 Bergkamen</p>
              <p><strong>Hinweis gemäß § 36 VSBG</strong><br />Wir sind weder verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
            </div>
          </details>
          <details id="datenschutz">
            <summary>Datenschutz <span>+</span></summary>
            <div className="legal-content">
              <p>Eine Datenschutzerklärung informiert darüber, welche personenbezogenen Daten eine Website erhebt, wofür sie verarbeitet werden, ob sie an Dritte gelangen und wie Besucher ihre Rechte ausüben können.</p>
              <p>Welche Angaben erforderlich sind, richtet sich nach den konkret eingesetzten Diensten und den geltenden gesetzlichen Vorgaben. Eine rechtliche Prüfung der endgültigen Website wird empfohlen.</p>
            </div>
          </details>
          <details id="agb">
            <summary>Allgemeine Geschäftsbedingungen <span>+</span></summary>
            <div className="legal-content">
              <p>Allgemeine Geschäftsbedingungen regeln das Verhältnis zwischen dem Anbieter und seinen Kunden – etwa erlaubte Nutzungen, Zahlungsweisen, Änderungen des Angebots, Gewährleistungen und Haftungsfragen.</p>
              <p>Die Bedingungen müssen zur tatsächlichen Art der angebotenen Leistungen passen. Für eine rechtssichere Fassung ist eine individuelle juristische Beratung sinnvoll.</p>
            </div>
          </details>
          <details id="barrierefreiheit">
            <summary>Barrierefreiheit <span>+</span></summary>
            <div className="legal-content"><p>Wir möchten unsere Website für möglichst viele Menschen zugänglich machen. Falls Sie auf eine Barriere stoßen, schreiben Sie bitte an <a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de</a>.</p></div>
          </details>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">CK</span><span className="brand-copy">Eventcenter<small>Bergkamen</small></span></a>
        <p>Erlebe magische Momente<br />im CK Eventcenter Bergkamen.</p>
        <nav aria-label="Fußnavigation"><a href="#locations">Locations</a><a href="#galerie">Fotogalerie</a><a href="#belegung">Belegungsplan</a><a href="#kontakt">Kontakt</a></nav>
        <nav aria-label="Rechtliches"><a href="#impressum">Impressum</a><a href="#datenschutz">Datenschutz</a><a href="#agb">AGB</a><a href="#barrierefreiheit">Barrierefreiheit</a></nav>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} CK Eventcenter</span><a href="#top">Nach oben ↑</a></div>
      </footer>
    </main>
  );
}
