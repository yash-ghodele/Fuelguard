import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://FuelShield.netlify.app'), // Update with your Netlify URL
  title: {
    default: "FuelShield - Vehicle Monitoring Dashboard",
    template: "%s | FuelShield"
  },
  description: "Real-time IoT-based vehicle tracking and fuel monitoring system. Monitor fuel levels, track vehicles, and prevent theft with advanced IoT sensors.",
  keywords: ["vehicle tracking", "fuel monitoring", "IoT", "fleet management", "GPS tracking", "fuel theft prevention"],
  authors: [{ name: "Yash Ghodele", url: "https://yash-ghodele.netlify.app" }],
  creator: "Yash Ghodele",
  publisher: "FuelShield",
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
    url: 'https://FuelShield.netlify.app',
    title: 'FuelShield - Vehicle Monitoring Dashboard',
    description: 'Real-time IoT-based vehicle tracking and fuel monitoring system',
    siteName: 'FuelShield',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FuelShield - Vehicle Monitoring Dashboard',
    description: 'Real-time IoT-based vehicle tracking and fuel monitoring system',
    creator: '@yashghodele',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
