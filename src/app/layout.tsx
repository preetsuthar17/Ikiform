import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dm_sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ikiform",
  description: "Open-source alternative to Typeform and Google Forms",
  openGraph: {
    title: "Ikiform",
    description: "Open-source alternative to Typeform and Google Forms",
    url: "https://ikiform.com",
    siteName: "Ikiform",

    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ikiform",
    description: "Open-source alternative to Typeform and Google Forms",
    images: ["https://ikiform.com/og-image.png"],
    creator: "@ikiform",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#ffffff",
  keywords: [
    "forms",
    "surveys",
    "open source",
    "typeform alternative",
    "google forms alternative",
    "ikiform",
    "ikiform.com",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dm_sans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
