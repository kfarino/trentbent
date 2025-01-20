import './globals.css'
import { Inter } from 'next/font/google'
import { ToasterProvider } from './components/toaster-provider'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trent gets Bent',
  description: 'Generate hilarious limericks for Trent\'s bachelor party by answering questions about our beloved groom-to-be.',
  metadataBase: new URL('https://trentbent.vercel.app'),
  openGraph: {
    title: 'Trent gets Bent',
    description: 'Generate hilarious limericks for Trent\'s bachelor party by answering questions about our beloved groom-to-be.',
    images: [{
      url: '/opengraph-image.png',
      width: 1200,
      height: 630,
      alt: 'Trent gets Bent - Bachelor Party Limerick Generator',
    }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trent gets Bent',
    description: 'Generate hilarious limericks for Trent\'s bachelor party by answering questions about our beloved groom-to-be.',
    images: ['/opengraph-image.png'],
  },
  icons: {
    icon: [{
      url: '/icon.svg',
      type: 'image/svg+xml',
    }],
    apple: [{
      url: '/apple-icon.svg',
      type: 'image/svg+xml',
    }],
  },
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

