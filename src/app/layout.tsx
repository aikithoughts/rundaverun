import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Run Dave Run — Centennial 100k',
  description: "Live race tracker for Dave's Centennial Trail 100k",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
