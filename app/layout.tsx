import type React from "react"
import type { Metadata, Viewport } from "next"
import { DM_Sans } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: "Air Quality Monitor - Environmental Dashboard",
  description:
    "Real-time air quality monitoring and environmental data analysis dashboard with interactive charts and live updates",
  keywords: ["air quality", "environmental monitoring", "dashboard", "real-time data", "analytics"],
  authors: [{ name: "Air Quality Monitor Team" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://challange-dashboard-ykessel.vercel.app',
    title: 'Air Quality Monitor - Environmental Dashboard',
    description: 'Real-time air quality monitoring and environmental data analysis dashboard',
    siteName: 'Air Quality Monitor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Air Quality Monitor - Environmental Dashboard',
    description: 'Real-time air quality monitoring and environmental data analysis dashboard',
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api-challenge.dofleini.com" />
        <link rel="preconnect" href="https://challange-dashboard-ykessel.vercel.app" />
        
        {/* DNS prefetch for additional performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://api-challenge.dofleini.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/api/air-quality/summary" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/air-quality/timeline" as="fetch" crossOrigin="anonymous" />
    
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">{children}</body>
    </html>
  )
}
