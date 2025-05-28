import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dm_sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

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
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dm_sans.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Toaster position="top-center" />
        <Footer />
      </body>
    </html>
  );
}
