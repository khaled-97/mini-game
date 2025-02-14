import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/ui/navbar"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Math Learning Game",
  description: "Interactive educational mini-game for high school students",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable}`}>
        <Navbar />
        <main className="pt-16 md:pt-16">
          {children}
        </main>
      </body>
    </html>
  )
}
