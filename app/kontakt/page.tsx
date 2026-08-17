import type { Metadata } from "next";
import { ContactForm, Footer, Header } from "../_components/SiteChrome";

export const metadata: Metadata = { title: "Kontakt | CK Eventcenter", description: "Kontaktieren Sie das CK Eventcenter bei allgemeinen Fragen und sonstigen Anliegen." };

export default function ContactPage() {
  return <main className="contact-page" id="top">
    <Header solid />
    <section className="contact-hero"><div><p className="section-label">05 / Kontakt</p><h1>Wie können wir<br /><em>Ihnen helfen?</em></h1></div><p>Dieses Kontaktformular ist für allgemeine Fragen und sonstige Anliegen gedacht. Hochzeits- und Veranstaltungsanfragen starten direkt in unserem Konfigurator.</p></section>
    <section className="contact-body"><div className="contact-details"><p className="kicker">Direkter Kontakt</p><h2>Wir sind gerne<br /><em>für Sie da.</em></h2><address><span>CK Eventcenter</span>Industriestraße 44a<br />59192 Bergkamen</address><a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de <span>↗</span></a><div className="contact-rule" /><p className="small-copy">Für Fragen ohne Bezug zu einer konkreten Hochzeits- oder Veranstaltungsanfrage können Sie uns hier eine Nachricht senden.</p></div><div className="contact-form-column"><aside className="contact-wizard-note"><span>Hochzeit oder Feier planen?</span><h2>Bitte nutzen Sie unseren Konfigurator.</h2><p>Dort wählen Sie Saal, Wunschdatum, Gästezahl und Leistungen aus und können anschließend direkt ein Beratungsgespräch buchen.</p><a className="solid-button" href="/buchung">Konfigurator starten <span>↗</span></a></aside><ContactForm /></div></section>
    <Footer />
  </main>;
}
