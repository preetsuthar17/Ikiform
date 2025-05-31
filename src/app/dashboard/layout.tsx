import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";

import "../../app/globals.css";

import { Toaster } from "react-hot-toast";

import { GoogleAnalytics } from "@next/third-parties/google";
import Footer from "@/components/Footer";

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
    default: "Dashboard | Ikiform",
    template: "%s | Ikiform",
  },
  description:
    "Manage your forms, surveys, and questionnaires from your Ikiform dashboard. Create, edit, and analyze your form data.",
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
    canonical: "/dashboard",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ikiform.com/dashboard",
    siteName: "Ikiform",
    title: "Dashboard | Ikiform",
    description:
      "Manage your forms, surveys, and questionnaires from your Ikiform dashboard. Create, edit, and analyze your data.",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Ikiform Dashboard",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ikiform",
    creator: "@ikiform",
    title: "Dashboard | Ikiform",
    description:
      "Manage your forms, surveys, and questionnaires from your Ikiform dashboard.",
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
    "ikiform dashboard",
    "form management",
    "survey dashboard",
    "form analytics",
    "form builder",
    "user dashboard",
  ],
  category: "technology",
  classification: "Business Software",
};

export default function DashboardLayout({
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
        <Footer />
      </body>
      <GoogleAnalytics gaId="G-35M26ZHKNE" />
    </html>
  );
}
