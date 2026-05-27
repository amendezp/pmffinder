import type { Metadata } from "next";
import { Instrument_Serif, Space_Mono } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PMFinder — Market Fit Radar",
  description:
    "A guided journey that gates your progress until each stage of the PMF process is genuinely met, then exports a Sequoia-style 2-pager memo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrument.variable} ${spaceMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
