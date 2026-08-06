import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Buchungsverwaltung",
  robots: { index: false, follow: false },
};

export default function AdministrationPage() {
  redirect("/verwaltung.html");
}
