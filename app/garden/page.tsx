import type { Metadata } from "next";
import { Footer, PageHero } from "../_components/SiteChrome";
import { ResponsiveImage } from "../_components/ResponsiveImage";
import { images } from "../_data";

export const metadata: Metadata = { title: "CK Garden | Hochzeiten in stilvoller Atmosphäre" };

export default function GardenPage() {
  return <main>
    <PageHero index="02" kicker="Natur / Stil / Leichtigkeit" title={<>CK&apos;s<br /><em>Garden</em></>} image={images.garden} imageAlt="CK Garden in festlicher Atmosphäre" />
    <section className="editorial-intro garden-tone"><p className="section-label">Der Gartensaal</p><div><h2>Ein Fest wie<br /><em>aus einem Märchen.</em></h2><p>Unser neu gebauter, zauberhafter Saal ist der ideale Ort für Hochzeiten und Feierlichkeiten aller Art. Umgeben von Natur und stilvoller Gestaltung entsteht eine Atmosphäre, in der Liebe und Glück greifbar werden.</p></div></section>
    <section className="image-composition garden-composition"><figure className="composition-wide"><ResponsiveImage src={images.gardenWide} alt="Stilvolle Gestaltung im CK Garden" sizes="(max-width: 900px) 100vw, 65vw" /></figure><div className="composition-number">02</div><figure className="composition-tall"><ResponsiveImage src={images.gardenNight} alt="Abendliche Atmosphäre im CK Garden" sizes="(max-width: 900px) 75vw, 32vw" /></figure><p>Feiern Sie in einer traumhaften Umgebung, in der Natur, Licht und Gestaltung zu einer einzigartigen Kulisse verschmelzen.</p></section>
    <section className="feature-rail garden-features"><div><span>01</span><p>Naturverbundene<br />Umgebung</p></div><div><span>02</span><p>Stilvolle<br />Gestaltung</p></div><div><span>03</span><p>Für Hochzeiten<br />&amp; Feste jeder Art</p></div></section>
    <section className="split-story reverse"><ResponsiveImage src={images.gardenDetail} alt="Feierliche Atmosphäre im CK Garden" sizes="(max-width: 900px) 100vw, 50vw" /><div><p className="section-label">Ihr Moment</p><h2>Leicht. Elegant.<br /><em>Unvergesslich.</em></h2><p>CK Garden gibt Ihrem Fest die besondere Leichtigkeit, die Gäste spüren und Erinnerungen lebendig hält.</p><a className="solid-button" href="/buchung">CK Garden anfragen <span>↗</span></a></div></section>
    <Footer />
  </main>;
}
