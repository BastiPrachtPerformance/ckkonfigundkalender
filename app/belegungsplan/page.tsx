import type { Metadata } from "next";
import { Footer, Header } from "../_components/SiteChrome";
import { images } from "../_data";

export const metadata: Metadata = { title: "Belegungsplan | CK Eventcenter", description: "Wunschtermin für das CK Eventcenter oder CK Garden prüfen." };

export default function BookingPage() {
  return <main className="booking-page" id="top">
    <Header />
    <section className="booking-hero"><img src={images.eventDark} alt="Abendliche Atmosphäre im CK Eventcenter" /><div className="booking-overlay" /><div className="booking-hero-copy"><p className="kicker">04 / Belegungsplan</p><h1>Ist Ihr Datum<br /><em>noch frei?</em></h1><p>Ein Datum ist der Anfang. Gemeinsam machen wir daraus Ihren großen Tag.</p></div><div className="calendar-mark"><strong>365</strong><span>Tage voller<br />Möglichkeiten</span></div></section>
    <section className="booking-options"><div className="booking-lead"><p className="section-label">Wunschtermin</p><h2>Zwei Wege.<br /><em>Eine Antwort.</em></h2></div><a className="booking-option" href="https://www.ckeventcenter.de/belegungsplan" target="_blank" rel="noreferrer"><span>01</span><h3>Kalender<br />ansehen</h3><p>Öffnen Sie den aktuellen Buchungskalender und verschaffen Sie sich einen ersten Überblick.</p><b>Kalender öffnen ↗</b></a><a className="booking-option accent" href="/kontakt"><span>02</span><h3>Persönlich<br />anfragen</h3><p>Schreiben Sie uns Ihr Wunschdatum. Wir prüfen die Verfügbarkeit und melden uns persönlich.</p><b>Anfrage starten ↗</b></a></section>
    <section className="booking-note"><span>Hinweis</span><p>Der Kalender gibt eine erste Orientierung. Eine verbindliche Reservierung entsteht erst nach persönlicher Abstimmung und Bestätigung durch das CK Eventcenter.</p></section>
    <Footer />
  </main>;
}
