import type { Metadata } from "next";
import { ContactForm, Footer, Header } from "../_components/SiteChrome";

export const metadata: Metadata = { title: "Gespräch vereinbaren | CK Eventcenter", description: "Sprechen Sie mit uns über Ihre Hochzeit oder Feier im CK Eventcenter Bergkamen." };

export default function ContactPage() {
  return <main className="contact-page" id="top">
    <Header solid />
    <section className="contact-hero"><div><p className="section-label">05 / Kontakt</p><h1>Erzählen Sie uns<br />von Ihrem <em>großen Tag.</em></h1></div><p>Sie planen eine Hochzeit oder Feier? Schreiben Sie uns. Wir melden uns persönlich und besprechen alles Weitere in Ruhe mit Ihnen.</p></section>
    <section className="contact-body"><div className="contact-details"><p className="kicker">Direkter Kontakt</p><h2>Wir freuen uns<br /><em>auf Ihre Geschichte.</em></h2><address><span>CK Eventcenter</span>Industriestraße 44a<br />59192 Bergkamen</address><a href="mailto:info@ckeventcenter.de">info@ckeventcenter.de <span>↗</span></a><div className="contact-rule" /><p className="small-copy">Bitte nennen Sie uns nach Möglichkeit Ihr Wunschdatum, die geplante Gästezahl und Ihre bevorzugte Location.</p></div><ContactForm /></section>
    <Footer />
  </main>;
}
