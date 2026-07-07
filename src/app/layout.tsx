import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIAB — Deals for Influencers and Brands",
  description: "Campaign management for creators, with Hermes AI copilot.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
