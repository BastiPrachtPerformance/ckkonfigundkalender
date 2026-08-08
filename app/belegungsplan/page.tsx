import type { Metadata } from "next";
import { Footer, Header } from "../_components/SiteChrome";
import { images } from "../_data";

export const metadata: Metadata = { title: "Belegungsplan | CK Eventcenter", description: "Wunschtermin für das CK Eventcenter oder CK Garden prüfen." };

export default function BookingPage() {
  return <main className="booking-page" id="top">
    <Header />
    <section className="booking-hero"><img src={images.eventDark} alt="Abendliche Atmosphäre im CK Eventcenter" /><div className="booking-overlay" /><div className="booking-hero-copy"><p className="kicker">04 / Belegungsplan</p><h1>Ist Ihr Datum<br /><em>noch frei?</em></h1><p>Ein Datum ist der Anfang. Gemeinsam machen wir daraus Ihren großen Tag.</p></div><div className="calendar-mark"><strong>365</strong><span>Tage voller<br />Möglichkeiten</span></div></section>
    <section className="booking-options"><div className="booking-lead"><p className="section-label">Wunschtermin</p><h2>Prüfen.<br /><em>Gestalten. Buchen.</em></h2></div><a className="booking-option" href="/buchung"><span>01</span><h3>Datum<br />prüfen</h3><p>Sehen Sie sofort, welche Hochzeitstermine in beiden Sälen noch verfügbar sind.</p><b>Kalender öffnen ↗</b></a><a className="booking-option accent" href="/buchung"><span>02</span><h3>Feier<br />zusammenstellen</h3><p>Wählen Sie Saal, Gästezahl und Leistungen, reservieren Sie Ihr Datum und buchen Sie die persönliche Beratung.</p><b>Buchung beginnen ↗</b></a></section>
    <section className="booking-note"><span>Hinweis</span><p>Der Kalender gibt eine erste Orientierung. Eine verbindliche Reservierung entsteht erst nach persönlicher Abstimmung und Bestätigung durch das CK Eventcenter.</p></section>
    <Footer />
  </main>;
}
