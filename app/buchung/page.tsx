import type { Metadata } from "next";
import { Footer, Header } from "../_components/SiteChrome";

const calendlyUrl = "https://calendly.com/buchungen-ckeventcenter?background_color=faf8ef&text_color=07110d&primary_color=c9a75f";

export const metadata: Metadata = {
  title: "Beratungsgespräch buchen | CK Eventcenter",
  description: "Buchen Sie Ihr persönliches Beratungsgespräch für Ihre Feier im CK Eventcenter.",
};

export default function ConsultationPage() {
  return (
    <main className="consultation-page" id="top">
      <Header solid />
      <section className="consultation-intro">
        <div>
          <p className="kicker">05 / Beratung</p>
          <h1>Persönlich planen.<br /><em>In Ruhe entscheiden.</em></h1>
        </div>
        <div className="consultation-intro-copy">
          <p>Im Beratungsgespräch lernen wir Ihre Wünsche kennen, beantworten Ihre Fragen und besprechen gemeinsam die nächsten Schritte.</p>
          <a className="text-link" href="/belegungsplan">Vorher Hochzeitstermine prüfen <span>↗</span></a>
        </div>
      </section>
      <section className="consultation-layout">
        <aside className="consultation-copy">
          <p className="section-label">Ihr Termin</p>
          <h2>Einfach passenden<br /><em>Zeitpunkt auswählen.</em></h2>
          <ul>
            <li><span>01</span>Location und Möglichkeiten kennenlernen</li>
            <li><span>02</span>Wünsche und offene Fragen besprechen</li>
            <li><span>03</span>Nächste Schritte gemeinsam festlegen</li>
          </ul>
          <p className="consultation-note">Die Buchung eines Beratungsgesprächs reserviert noch keinen Hochzeitstermin. Freie Hochzeitstermine sehen Sie im <a href="/belegungsplan">Belegungsplan</a>.</p>
        </aside>
        <div className="calendly-frame">
          <iframe
            src={calendlyUrl}
            title="Beratungsgespräch über Calendly buchen"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
