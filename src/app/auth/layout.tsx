import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";

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
    default: "Sign In | Ikiform",
    template: "%s | Ikiform",
  },
  description:
    "Sign in to your Ikiform account to create and manage your forms, surveys, and questionnaires.",
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
    canonical: "/auth",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ikiform.com/auth",
    siteName: "Ikiform",
    title: "Sign In | Ikiform",
    description:
      "Sign in to your Ikiform account to create and manage beautiful, interactive forms and surveys.",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Ikiform Sign In",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ikiform",
    creator: "@ikiform",
    title: "Sign In | Ikiform",
    description:
      "Sign in to your Ikiform account to create and manage beautiful forms and surveys.",
    images: ["/og-banner.png"],
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
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
    "ikiform login",
    "ikiform sign in",
    "form builder login",
    "survey tool login",
    "authentication",
    "user account",
  ],
  category: "technology",
  classification: "Business Software",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-screen ">
      <body
        className={`${inter.variable} ${dm_sans.variable} antialiased min-h-screen flex flex-col justify-between font-inter`}
      >
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-center" />
        <Footer />
      </body>
      <GoogleAnalytics gaId="G-35M26ZHKNE" />
    </html>
  );
}
