import type { Metadata, Viewport } from "next";

import { DM_Sans, Inter, JetBrains_Mono } from "next/font/google";

import "../../app/globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Toaster } from "react-hot-toast";

import { GoogleAnalytics } from "@next/third-parties/google";

// Load Google Fonts with CSS variables
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dm_sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrains_mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "white",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Metadata for SEO, social sharing, and PWA
export const metadata: Metadata = {
  title: {
    default: "Ikiform",
    template: "%s | Ikiform",
  },
  description:
    "Create beautiful forms with Ikiform - the open-source alternative to Typeform and Google Forms. Build surveys, collect responses, and analyze data effortlessly.",
  applicationName: "Ikiform",
  authors: [{ name: "Ikiform Team", url: "https://ikiform.com" }],
  creator: "Ikiform",
  publisher: "Ikiform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ikiform.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ikiform.com",
    siteName: "Ikiform",
    title: "Ikiform",
    description:
      "Create beautiful, interactive forms with Ikiform - the open-source alternative to Typeform and Google Forms. Build surveys, collect responses, and analyze data effortlessly.",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Ikiform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ikiform",
    creator: "@ikiform",
    title: "Ikiform",
    description:
      "Create beautiful, interactive forms with Ikiform - the open-source alternative to Typeform and Google Forms.",
    images: ["/og-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },

  keywords: [
    "form builder",
    "online forms",
    "surveys",
    "questionnaires",
    "open source",
    "typeform alternative",
    "google forms alternative",
    "form creator",
    "survey tool",
    "data collection",
    "ikiform",
    "form software",
    "custom forms",
    "interactive forms",
    "form analytics",
  ],
  category: "technology",
  classification: "Business Software",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dm_sans.variable} ${jetbrains_mono.variable} antialiased font-inter`}
      >
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Toaster position="top-center" />
        <Footer />
      </body>
      <GoogleAnalytics gaId="G-35M26ZHKNE" />
    </html>
  );
}
