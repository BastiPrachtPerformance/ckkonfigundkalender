import type { Metadata } from "next";
import { LegalPage } from "../_components/SiteChrome";

export const metadata: Metadata = { title: "Barrierefreiheit | CK Eventcenter" };

export default function AccessibilityPage() {
  return <LegalPage eyebrow="Rechtliches / 04" title="Barrierefreiheit">
    <section><h2>Unser Anspruch</h2><p>Wir möchten unsere Internetseite für möglichst viele Menschen zugänglich und verständlich gestalten – unabhängig von Gerät, Einschränkung oder verwendeter Eingabemethode.</p></section>
    <section><h2>Rückmeldung und Kontakt</h2><p>Falls Sie auf eine Barriere stoßen oder Inhalte nicht erreichen können, schreiben Sie uns bitte an <a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de</a>. Wir prüfen Ihren Hinweis und suchen nach einer passenden Lösung.</p></section>
  </LegalPage>;
}
