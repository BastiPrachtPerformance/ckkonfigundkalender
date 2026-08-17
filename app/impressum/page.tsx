import type { Metadata } from "next";
import { LegalPage } from "../_components/SiteChrome";

export const metadata: Metadata = { title: "Impressum | CK Eventcenter" };

export default function ImprintPage() {
  return <LegalPage eyebrow="Rechtliches / 01" title="Impressum">
    <section><h2>Angaben gemäß § 5 DDG</h2><p>CK Eventcenter<br />Industriestraße 44a<br />59192 Bergkamen</p></section>
    <section><h2>Vertreten durch</h2><p>Inhaber: Cevat Demircan</p><p>E-Mail: <a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de</a><br />Internetseite: www.ckeventcenter.de</p></section>
    <section><h2>Verantwortlich für den Inhalt</h2><p>Verantwortlich nach § 55 Abs. 2 RStV:<br />Cevat Demircan<br />Industriestraße 44a<br />59192 Bergkamen</p></section>
    <section><h2>Verbraucherstreitbeilegung</h2><p>Hinweis gemäß § 36 Verbraucherstreitbeilegungsgesetz (VSBG): Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p></section>
  </LegalPage>;
}
