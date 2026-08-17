import type { Metadata } from "next";
import { Footer, Header } from "../_components/SiteChrome";
import { ResponsiveImage } from "../_components/ResponsiveImage";
import { gallery } from "../_data";

export const metadata: Metadata = { title: "Fotogalerie | CK Eventcenter Bergkamen", description: "Fotos aus dem CK Eventcenter und CK Garden." };

export default function GalleryPage() {
  return <main className="gallery-page" id="top">
    <Header solid />
    <section className="gallery-hero"><p className="section-label">03 / Fotogalerie</p><h1>Augenblicke,<br /><em>die alles sagen.</em></h1><p>Fotos und Impressionen aus unseren Sälen: echte Feiern, große Emotionen und liebevolle Details.</p></section>
    <section className="gallery-masonry">
      {gallery.map(([src, alt], index) => <figure className={`masonry-item item-${index + 1}`} key={src}><ResponsiveImage src={src} alt={alt} loading={index > 3 ? "lazy" : "eager"} sizes="(max-width: 720px) 100vw, 50vw" /><figcaption><span>{String(index + 1).padStart(2, "0")}</span>{index % 3 === 0 ? "CK Eventcenter" : index % 3 === 1 ? "CK Garden" : "Momente"}</figcaption></figure>)}
    </section>
    <section className="gallery-cta"><p>Sie sehen Ihre Feier schon vor sich?</p><h2>Dann lassen Sie uns<br /><em>darüber sprechen.</em></h2><a className="solid-button gold" href="/kontakt">Gespräch vereinbaren <span>↗</span></a></section>
    <Footer />
  </main>;
}
