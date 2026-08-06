import type { Metadata } from "next";
import { LegalPage } from "../_components/SiteChrome";

export const metadata: Metadata = { title: "AGB | CK Eventcenter" };

export default function TermsPage() {
  return <LegalPage eyebrow="Rechtliches / 03" title="Allgemeine Geschäftsbedingungen">
    <section><h2>Grundlagen</h2><p>Allgemeine Geschäftsbedingungen regeln das Vertragsverhältnis zwischen dem CK Eventcenter und seinen Kundinnen und Kunden. Dazu können insbesondere Buchung, Zahlungsweise, Leistungsumfang, Änderungen, Stornierungen, Haftung und Hausordnung gehören.</p></section>
    <section><h2>Individuelle Vereinbarung</h2><p>Der konkrete Umfang einer Veranstaltung sowie alle Preise, Termine und Leistungen ergeben sich aus dem jeweiligen Angebot und der anschließend geschlossenen Vereinbarung.</p></section>
    <section><h2>Rechtlicher Hinweis</h2><p>Die Bedingungen müssen zur tatsächlichen Art der angebotenen Leistungen passen. Für eine rechtssichere Fassung ist eine individuelle juristische Beratung erforderlich.</p></section>
    <aside><strong>Wichtiger Hinweis</strong><p>Die bisherige Website enthielt einen allgemeinen Wix-Mustertext und keine individuell ausgearbeiteten Geschäftsbedingungen. Dieser Bereich muss vor dem endgültigen Livegang rechtlich vervollständigt werden.</p></aside>
  </LegalPage>;
}
