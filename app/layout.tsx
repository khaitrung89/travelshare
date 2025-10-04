import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TravelShare - Split Expenses & Share Moments',
  description: 'Split travel expenses easily with friends and share your journey',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
