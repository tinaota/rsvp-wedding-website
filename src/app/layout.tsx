import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lora, Great_Vibes } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-great-vibes",
});

const TITLE = "Vow Renewal — Ps Herald & Ps Yeukai Tshwanelo";
const DESCRIPTION =
  "You are cordially invited to the Wedding Vow Renewal of Ps Herald & Ps Yeukai Tshwanelo — Saturday, 7 November 2026 at The Langham Melbourne.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // A private invitation: findable by link, not by search.
  robots: { index: false, follow: false },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      className={`${playfair.variable} ${lora.variable} ${greatVibes.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
