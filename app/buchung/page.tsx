import type { Metadata } from "next";
import pricing from "../../Buchung/data/pricing.json";
import { Footer, Header } from "../_components/SiteChrome";
import { BookingConfigurator } from "./BookingConfigurator";

export const metadata: Metadata = {
  title: "Hochzeitstermin buchen",
  description: "Freies Hochzeitsdatum prüfen, Feier zusammenstellen, Datum vorreservieren und Beratungsgespräch buchen.",
};

export default function BookingPage() {
  return (
    <main className="configurator-page" id="top">
      <Header solid />
      <section className="configurator-intro">
        <p className="kicker">05 / Ihre Feier</p>
        <h1>Ein Datum.<br /><em>Ihr großer Tag.</em></h1>
        <p>Prüfen Sie Ihren Wunschtermin, stellen Sie Ihre Feier zusammen und reservieren Sie anschließend direkt ein persönliches Beratungsgespräch.</p>
      </section>
      <BookingConfigurator pricing={pricing} />
      <Footer />
    </main>
  );
}
