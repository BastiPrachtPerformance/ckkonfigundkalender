import type { Metadata } from "next";
import { LegalPage } from "../_components/SiteChrome";

export const metadata: Metadata = { title: "AGB | CK Eventcenter" };

export default function TermsPage() {
  return <LegalPage eyebrow="Rechtliches / 03" title="Allgemeine Geschäftsbedingungen">
    <section><h2>1. Geltungsbereich</h2><p>Diese Hinweise gelten für die Nutzung des öffentlichen Belegungskalenders und die Vereinbarung von Beratungsgesprächen über die Internetseite des CK Eventcenters. Individuelle Angebote und schriftliche Veranstaltungsvereinbarungen haben Vorrang.</p></section>
    <section><h2>2. Angaben im Belegungskalender</h2><p>Der öffentliche Kalender dient ausschließlich der ersten Orientierung. Die Anzeige „frei“ stellt weder ein verbindliches Angebot noch eine Reservierung oder Zusage für den betreffenden Hochzeitstermin dar. Zwischenzeitliche Änderungen sind möglich.</p></section>
    <section><h2>3. Beratungsgespräch über Calendly</h2><p>Mit der Buchung eines Beratungsgesprächs wird ausschließlich ein Gesprächstermin vereinbart. Dadurch wird kein Hochzeitstermin reserviert und es entsteht noch kein Vertrag über die Durchführung einer Veranstaltung.</p></section>
    <section><h2>4. Verbindliche Veranstaltungsbuchung</h2><p>Eine verbindliche Reservierung oder Buchung einer Veranstaltung entsteht erst durch die ausdrückliche schriftliche Bestätigung des CK Eventcenters beziehungsweise durch den Abschluss einer individuellen Veranstaltungsvereinbarung.</p></section>
    <section><h2>5. Änderungen und Stornierungen</h2><p>Regelungen zu Leistungsumfang, Preisen, Zahlungsfristen, Änderungen, Rücktritt, Stornierung, Haftung, Hausordnung und sonstigen Veranstaltungsbedingungen ergeben sich aus dem jeweiligen Angebot und der individuellen Veranstaltungsvereinbarung.</p></section>
    <section><h2>6. Kontakt</h2><p>Fragen zu einem Beratungsgespräch oder einer Veranstaltung richten Sie bitte an <a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de</a>.</p></section>
  </LegalPage>;
}
