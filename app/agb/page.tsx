import type { Metadata } from "next";
import { LegalPage } from "../_components/SiteChrome";

export const metadata: Metadata = { title: "AGB | CK Eventcenter" };

export default function TermsPage() {
  return <LegalPage eyebrow="Rechtliches / 03" title="Allgemeine Geschäftsbedingungen">
    <section><h2>1. Geltungsbereich</h2><p>Diese Hinweise gelten für Terminanfragen und unverbindliche Vorreservierungen, die über die Internetseite des CK Eventcenters übermittelt werden. Individuelle Angebote und schriftliche Vereinbarungen für eine Veranstaltung haben Vorrang.</p></section>
    <section><h2>2. Konfigurator und Preisschätzung</h2><p>Der Konfigurator dient ausschließlich der Planung und ersten Orientierung. Angezeigte Preise sind unverbindliche Schätzungen. Der endgültige Leistungsumfang und Preis ergeben sich erst aus einem individuell erstellten Angebot und der anschließend geschlossenen Vereinbarung.</p></section>
    <section><h2>3. Vorreservierung eines Hochzeitstermins</h2><p>Durch das Absenden des Konfigurators entsteht noch kein Vertrag über die Durchführung einer Veranstaltung. Das ausgewählte Datum wird als vorreserviert gekennzeichnet. Die Vorreservierung bleibt bestehen, bis sie durch das CK Eventcenter bestätigt, blockiert oder manuell freigegeben wird.</p></section>
    <section><h2>4. Beratung und verbindliche Buchung</h2><p>Die Buchung eines Beratungstermins über Calendly ist ebenfalls noch keine verbindliche Veranstaltungsbuchung. Eine verbindliche Reservierung entsteht erst durch eine ausdrückliche Bestätigung beziehungsweise durch den Abschluss der individuellen Veranstaltungsvereinbarung.</p></section>
    <section><h2>5. Angaben der anfragenden Person</h2><p>Die für eine Anfrage notwendigen Angaben müssen vollständig und richtig sein. Änderungen des Hochzeitsdatums, der Gästezahl oder der gewünschten Leistungen können die Verfügbarkeit und die Preisschätzung verändern.</p></section>
    <section><h2>6. Änderungen und Stornierungen</h2><p>Regelungen zu Zahlungsfristen, Änderungen, Rücktritt, Stornierung, Haftung, Hausordnung und sonstigen Veranstaltungsbedingungen ergeben sich aus dem jeweiligen Angebot und der individuellen Veranstaltungsvereinbarung.</p></section>
    <section><h2>7. Kontakt</h2><p>Fragen zu einer Anfrage oder Vorreservierung richten Sie bitte unter Angabe der Buchungsnummer an <a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de</a>.</p></section>
  </LegalPage>;
}
