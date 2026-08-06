import type { Metadata } from "next";
import { Footer, PageHero } from "../_components/SiteChrome";
import { images } from "../_data";

export const metadata: Metadata = { title: "CK Garden | Hochzeiten in stilvoller Atmosphäre" };

export default function GardenPage() {
  return <main>
    <PageHero index="02" kicker="Natur / Stil / Leichtigkeit" title={<>CK&apos;s<br /><em>Garden</em></>} image={images.garden} imageAlt="CK Garden in festlicher Atmosphäre" />
    <section className="editorial-intro garden-tone"><p className="section-label">Die Location</p><div><h2>Ein Fest wie<br /><em>aus einem Märchen.</em></h2><p>Unser neu gebauter, zauberhafter Saal ist die ideale Location für Hochzeiten und Feierlichkeiten aller Art. Umgeben von Natur und stilvollem Design entsteht eine Atmosphäre, in der Liebe und Glück greifbar werden.</p></div></section>
    <section className="image-composition garden-composition"><figure className="composition-wide"><img src={images.gardenWide} alt="Stilvolle Gestaltung im CK Garden" /></figure><div className="composition-number">02</div><figure className="composition-tall"><img src={images.gardenNight} alt="Abendliche Atmosphäre im CK Garden" /></figure><p>Feiern Sie in einem traumhaften Setting, in dem Natur, Licht und Design zu einer einzigartigen Kulisse verschmelzen.</p></section>
    <section className="feature-rail garden-features"><div><span>01</span><p>Naturverbundenes<br />Setting</p></div><div><span>02</span><p>Stilvolles<br />Design</p></div><div><span>03</span><p>Für Hochzeiten<br />&amp; Feste jeder Art</p></div></section>
    <section className="split-story reverse"><img src={images.gardenDetail} alt="Feierliche Atmosphäre im CK Garden" /><div><p className="section-label">Ihr Moment</p><h2>Leicht. Elegant.<br /><em>Unvergesslich.</em></h2><p>CK Garden gibt Ihrem Fest die besondere Leichtigkeit, die Gäste spüren und Erinnerungen lebendig hält.</p><a className="solid-button" href="/kontakt">CK Garden anfragen <span>↗</span></a></div></section>
    <Footer />
  </main>;
}
