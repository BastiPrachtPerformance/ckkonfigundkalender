import type { Metadata } from "next";
import { Footer, PageHero } from "../_components/SiteChrome";
import { images } from "../_data";

export const metadata: Metadata = { title: "CK Eventcenter | Große Hochzeiten & Feiern" };

export default function EventcenterPage() {
  return <main>
    <PageHero index="01" kicker="Große Feiern / Glanzvolle Hochzeiten" title={<>Das CK<br /><em>Eventcenter</em></>} image={images.eventcenter} imageAlt="Der große Saal des CK Eventcenters" />
    <section className="editorial-intro"><p className="section-label">Die Location</p><div><h2>Hier wird Ihr<br /><em>großer Traum wahr.</em></h2><p>Mit atemberaubender Atmosphäre ist dieser prachtvolle Saal ideal für glanzvolle Hochzeiten und große Feiern. Das elegante Ambiente und die großzügige Fläche schaffen den perfekten Ort, um Liebe und Freude mit Familie und Freunden zu teilen.</p></div></section>
    <section className="image-composition"><figure className="composition-wide"><img src={images.eventWide} alt="Festlich gedeckter Saal" /></figure><div className="composition-number">01</div><figure className="composition-tall"><img src={images.eventDark} alt="Lichtstimmung im CK Eventcenter" /></figure><p>Lassen Sie sich von der Atmosphäre des CK Eventcenters verzaubern und erleben Sie Augenblicke, die für immer in Ihrem Herzen bleiben.</p></section>
    <section className="feature-rail"><div><span>01</span><p>Großzügige<br />Raumwirkung</p></div><div><span>02</span><p>Elegantes<br />Ambiente</p></div><div><span>03</span><p>Für Hochzeiten<br />&amp; große Feiern</p></div></section>
    <section className="split-story"><img src={images.eventDetail} alt="Edle Tischdekoration im CK Eventcenter" /><div><p className="section-label">Ihre Feier</p><h2>Große Gefühle.<br /><em>Perfekt inszeniert.</em></h2><p>Von der ersten Idee bis zum großen Moment: Wir besprechen Ihre Wünsche persönlich und schaffen den Rahmen, der zu Ihnen und Ihrer Feier passt.</p><a className="solid-button" href="/kontakt">Eventcenter anfragen <span>↗</span></a></div></section>
    <Footer />
  </main>;
}
