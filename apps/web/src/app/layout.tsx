import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";
import { NuqsAdapter } from 'nuqs/adapters/next/app';

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
    default: "uni-perks - Student Discounts & Perks",
    template: "%s | uni-perks",
  },
  description: "Discover exclusive student discounts, perks, and credits from top companies. Save money on software, services, and more with your student status.",
  keywords: ["student discounts", "student perks", "university discounts", "student deals", "education discounts"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://uni-perks.com",
    siteName: "uni-perks",
    title: "uni-perks - Student Discounts & Perks",
    description: "Discover exclusive student discounts, perks, and credits from top companies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "uni-perks - Student Discounts & Perks",
    description: "Discover exclusive student discounts, perks, and credits from top companies.",
  },
};

import { ScrollArea } from "@/components/ui/scroll-area";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden`}>
        <NuqsAdapter>
          <Providers>
            <ScrollArea className="h-full w-full" scrollBarClassName="mt-14 z-40">
              <div className="grid grid-rows-[auto_1fr] min-h-screen">
                <Header />
                {children}
              </div>
            </ScrollArea>
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
