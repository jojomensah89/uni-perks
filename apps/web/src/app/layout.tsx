import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Bebas_Neue, Syne } from "next/font/google";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

// const fontSans = Inter({
//   variable: "--font-sans",
//   subsets: ["latin"],
// });

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontBebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const fontSyne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "UniPerks – Student Deals & Perks",
    template: "%s | UniPerks",
  },
  description:
    "The one-stop hub for 30+ verified student discounts on software, food, music, travel, and more. Save thousands as a student.",
  keywords: ["student discounts", "student perks", "university discounts", "student deals"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://uni-perks.com",
    siteName: "UniPerks",
    title: "UniPerks – Student Deals & Perks",
    description: "The one-stop hub for 30+ verified student discounts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniPerks – Student Deals & Perks",
    description: "The one-stop hub for 30+ verified student discounts.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} ${fontBebas.variable} ${fontSyne.variable} ${fontSerif.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
