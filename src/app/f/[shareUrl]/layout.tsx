import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";

import "../../globals.css";

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
    default: "Fill Form | Ikiform",
    template: "%s | Ikiform",
  },
  description:
    "Fill out forms, surveys, and questionnaires on Ikiform. Easy-to-use form interface for quick and secure data submission.",
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
    canonical: "/f",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ikiform.com/f",
    siteName: "Ikiform",
    title: "Fill Form | Ikiform",
    description:
      "Fill out forms, surveys, and questionnaires on Ikiform. Easy-to-use interface for quick data submission.",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Ikiform - Fill Forms",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ikiform",
    creator: "@ikiform",
    title: "Fill Form | Ikiform",
    description: "Fill out forms, surveys, and questionnaires on Ikiform.",
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
    "fill form",
    "online form",
    "survey form",
    "questionnaire",
    "form submission",
    "ikiform",
  ],
  category: "technology",
  classification: "Business Software",
};

export default function FormLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dm_sans.variable} antialiased font-inter`}
      >
        <main className="min-h-screen">{children}</main>
        <Toaster position="top-center" />
      </body>
      <GoogleAnalytics gaId="G-35M26ZHKNE" />
    </html>
  );
}
