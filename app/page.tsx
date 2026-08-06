import { Footer, Header } from "./_components/SiteChrome";
import { gallery, images } from "./_data";

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" id="top">
        <Header />
        <img src={images.hero} alt="Festlich beleuchteter Saal des CK Eventcenters" />
        <div className="home-hero-overlay" />
        <div className="hero-ornament" aria-hidden="true">C</div>
        <div className="home-hero-copy">
          <p className="kicker">Zwei Säle / Bergkamen</p>
          <h1>Ein Ort für<br /><em>das Unvergessliche.</em></h1>
          <div className="hero-meta">
            <p>Hochzeiten. Große Feiern.<br />Momente, die bleiben.</p>
            <a className="line-button light" href="/kontakt">Gespräch vereinbaren <span>↗</span></a>
          </div>
        </div>
        <div className="hero-side-note"><span>Seit</span><b>CK</b><span>Bergkamen</span></div>
      </section>

      <section className="manifesto">
        <p className="section-label">01 / Das Versprechen</p>
        <div className="manifesto-copy">
          <p className="drop-line">Wo aus einem Datum</p>
          <h2>eine Erinnerung<br /><em>für immer wird.</em></h2>
          <p className="body-copy">Im CK Eventcenter Bergkamen wird aus Ihrer Feier ein Erlebnis. Großzügige Räume, glanzvolle Inszenierungen und viel Liebe zum Detail schaffen den Rahmen für die Momente, die alles bedeuten.</p>
        </div>
      </section>

      <section className="location-portals">
        <a className="portal" href="/eventcenter">
          <img src={images.eventcenter} alt="Großer Festsaal des CK Eventcenters" />
          <div className="portal-shade" />
          <span className="portal-index">01</span>
          <div className="portal-copy"><p>Glanzvoll / Großzügig</p><h2>CK<br />Eventcenter</h2><span>Saal entdecken ↗</span></div>
        </a>
        <a className="portal" href="/garden">
          <img src={images.garden} alt="CK Garden mit stilvoller Dekoration" />
          <div className="portal-shade" />
          <span className="portal-index">02</span>
          <div className="portal-copy"><p>Natur / Stil / Leichtigkeit</p><h2>CK<br /><em>Garden</em></h2><span>Garten entdecken ↗</span></div>
        </a>
      </section>

      <section className="statement-band">
        <div className="marquee-track">
          <span>Feiern</span><span className="star">✦</span><em>Lieben</em><span className="star">✦</span><span>Erinnern</span><span className="star">✦</span>
          <span aria-hidden="true">Feiern</span><span className="star" aria-hidden="true">✦</span><em aria-hidden="true">Lieben</em><span className="star" aria-hidden="true">✦</span><span aria-hidden="true">Erinnern</span><span className="star" aria-hidden="true">✦</span>
        </div>
      </section>

      <section className="home-gallery">
        <div className="gallery-intro"><p className="section-label">02 / Atmosphäre</p><h2>Nicht nur sehen.<br /><em>Fühlen.</em></h2><a className="line-button" href="/galerie">Zur Fotogalerie <span>↗</span></a></div>
        <figure className="home-gallery-main"><img src={gallery[3][0]} alt={gallery[3][1]} /></figure>
        <figure className="home-gallery-side"><img src={gallery[7][0]} alt={gallery[7][1]} /></figure>
      </section>

      <section className="date-cta">
        <img src={images.eventDark} alt="Abendliche Atmosphäre im CK Eventcenter" />
        <div className="date-overlay" />
        <div className="date-copy"><p className="section-label light">03 / Ihr Termin</p><h2>Ihr großer Tag<br />verdient den <em>richtigen Ort.</em></h2><div><a className="solid-button gold" href="/belegungsplan">Wunschtermin prüfen <span>↗</span></a><a className="line-button light" href="/kontakt">Persönlich anfragen <span>↗</span></a></div></div>
      </section>

      <Footer />
    </main>
  );
}
