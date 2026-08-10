import type { Metadata } from "next";
import KeyUserPanel from "./KeyUserPanel";

export const metadata: Metadata = {
  title: "Hauptverwaltung | CK Eventcenter",
  robots: { index: false, follow: false },
};

export default function KeyUserPage() {
  return <KeyUserPanel />;
}

