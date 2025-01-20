import './globals.css'
import { Inter } from 'next/font/google'
import { ToasterProvider } from './components/toaster-provider'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trent Gets Bent',
  description: 'Bachelor Party Limerick Generator',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      }
    ],
    apple: [
      {
        url: '/apple-icon.svg',
        type: 'image/svg+xml',
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}

