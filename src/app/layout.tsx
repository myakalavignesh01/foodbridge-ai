import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodBridge AI — Surplus Food. Smart Matching. Zero Hunger.",
  description: "FoodBridge AI connects surplus food with verified organizations and communities using intelligent matching and real-time coordination.",
  keywords: "food donation, food waste, NGO, redistribution, zero hunger, SDG 2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
