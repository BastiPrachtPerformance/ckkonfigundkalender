import type { Metadata } from "next";
import { Footer, Header } from "../_components/SiteChrome";
import { ResponsiveImage } from "../_components/ResponsiveImage";
import { images } from "../_data";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

export const metadata: Metadata = { title: "Belegungsplan | CK Eventcenter", description: "Wunschtermin für das CK Eventcenter oder CK Garden prüfen." };

export default function BookingPage() {
  return <main className="booking-page" id="top">
    <Header />
    <section className="booking-hero"><ResponsiveImage src={images.eventDark} alt="Abendliche Atmosphäre im CK Eventcenter" loading="eager" fetchPriority="high" sizes="100vw" /><div className="booking-overlay" /><div className="booking-hero-copy"><p className="kicker">04 / Belegungsplan</p><h1>Ist Ihr Datum<br /><em>noch frei?</em></h1><p>Ein Datum ist der Anfang. Gemeinsam machen wir daraus Ihren großen Tag.</p></div><div className="calendar-mark"><strong>365</strong><span>Tage voller<br />Möglichkeiten</span></div></section>
    <AvailabilityCalendar />
    <section className="booking-note"><span>Hinweis</span><p>Der Kalender gibt eine erste Orientierung. Eine verbindliche Reservierung entsteht erst nach persönlicher Abstimmung und Bestätigung durch das CK Eventcenter.</p></section>
    <Footer />
  </main>;
}
