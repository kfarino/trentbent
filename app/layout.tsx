import './globals.css'
import { Inter } from 'next/font/google'
import { ToasterProvider } from './components/toaster-provider'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trent gets Bent',
  description: 'Generate hilarious limericks for Trent\'s bachelor party by answering questions about our beloved groom-to-be.',
  metadataBase: new URL('https://trentgetsbent.vercel.app'),
  openGraph: {
    url: 'https://trentgetsbent.vercel.app/',
    title: 'Trent gets Bent',
    description: 'Generate hilarious limericks for Trent\'s bachelor party by answering questions about our beloved groom-to-be.',
    siteName: 'Trent gets Bent',
    type: 'website',
    images: [{
      url: 'https://opengraph.b-cdn.net/production/images/1b37114b-ed94-4b5d-9a50-3cd5e5f1e1f2.png?token=_k9hea49B1aIPWrWhnWBFGw3Cc6ILAbw3JQMmq3EBeU&height=630&width=1200&expires=33273407022',
      width: 1200,
      height: 630,
      alt: 'Trent gets Bent - Bachelor Party Limerick Generator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trent gets Bent',
    description: 'Generate hilarious limericks for Trent\'s bachelor party by answering questions about our beloved groom-to-be.',
    site: '@trentgetsbent',
    creator: '@trentgetsbent',
    images: 'https://opengraph.b-cdn.net/production/images/1b37114b-ed94-4b5d-9a50-3cd5e5f1e1f2.png?token=_k9hea49B1aIPWrWhnWBFGw3JQMmq3EBeU&height=630&width=1200&expires=33273407022',
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

