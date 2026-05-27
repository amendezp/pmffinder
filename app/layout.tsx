import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PMFinder — a compass toward product/market fit",
  description:
    "A guided journey that gates your progress until each stage of the PMF process is genuinely met, then exports a Sequoia-style 2-pager memo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
