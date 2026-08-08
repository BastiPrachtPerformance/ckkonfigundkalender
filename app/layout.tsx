import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { headers } from "next/headers";
import { Experience } from "./_components/Experience";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "www.ckeventcenter.de";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: {
      default: "CK Eventcenter Bergkamen | Hochzeiten & Feiern",
      template: "%s | CK Eventcenter",
    },
    description: "CK Eventcenter und CK Garden in Bergkamen: zwei elegante Säle für Hochzeiten, große Feiern und unvergessliche Momente.",
    metadataBase: new URL(origin),
    openGraph: {
      title: "CK Eventcenter – Ein Ort für das Unvergessliche.",
      description: "Zwei außergewöhnliche Säle für Hochzeiten und große Feiern in Bergkamen.",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "CK Eventcenter – Ein Ort für das Unvergessliche." }],
      locale: "de_DE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "CK Eventcenter – Ein Ort für das Unvergessliche.",
      description: "CK Eventcenter und CK Garden in Bergkamen.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${display.variable} ${sans.variable}`}>
        <Experience />
        {children}
      </body>
    </html>
  );
}
