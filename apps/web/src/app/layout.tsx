import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
