import type { Metadata } from "next";
import { LegalPage } from "../_components/SiteChrome";

export const metadata: Metadata = { title: "Datenschutz | CK Eventcenter" };

export default function PrivacyPage() {
  return <LegalPage eyebrow="Rechtliches / 02" title="Datenschutz">
    <section><h2>Allgemeiner Hinweis</h2><p>Eine Datenschutzerklärung beschreibt, welche personenbezogenen Daten eine Website erhebt, wie und warum sie verarbeitet werden, ob eine Weitergabe an Dritte erfolgt und welche Rechte Besucherinnen und Besucher haben.</p></section>
    <section><h2>Verantwortliche Stelle</h2><p>CK Eventcenter<br />Cevat Demircan<br />Industriestraße 44a<br />59192 Bergkamen<br /><a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de</a></p></section>
    <section><h2>Kontaktaufnahme</h2><p>Wenn Sie uns per E-Mail oder über das Kontaktformular kontaktieren, werden die von Ihnen übermittelten Angaben zur Bearbeitung Ihrer Anfrage verwendet. Die konkreten Speicherfristen und Rechtsgrundlagen richten sich nach dem Anlass Ihrer Nachricht.</p></section>
    <section><h2>Ihre Rechte</h2><p>Je nach geltendem Recht können Sie Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung oder Datenübertragbarkeit verlangen und einer Verarbeitung widersprechen.</p></section>
    <aside><strong>Wichtiger Hinweis</strong><p>Die bisherige Website enthielt lediglich einen allgemeinen Wix-Mustertext. Vor dem endgültigen Livegang sollte diese Datenschutzerklärung anhand aller tatsächlich eingesetzten Dienste rechtlich geprüft und vervollständigt werden.</p></aside>
  </LegalPage>;
}
