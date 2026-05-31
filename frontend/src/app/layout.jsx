import './globals.css'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://askbro.app'),

  title: {
    default: 'AskBro — AI Knowledge Base for Teams',
    template: '%s | AskBro',
  },

  description:
    'AskBro is an AI-powered document intelligence platform for teams. Upload PDFs, Docs and Markdown — then ask questions in plain English and get cited answers instantly.',

  keywords: [
    'AI knowledge base',
    'document intelligence',
    'RAG',
    'retrieval augmented generation',
    'team knowledge base',
    'document search',
    'AI assistant',
    'document Q&A',
    'internal knowledge management',
    'enterprise search',
    'PDF question answering',
    'document chatbot',
    'AskBro',
  ],

  authors: [{ name: 'AskBro Team' }],
  creator: 'AskBro',
  publisher: 'AskBro',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AskBro',
    title: 'AskBro — AI Knowledge Base for Teams',
    description:
      'Upload your team\'s documents and get instant cited answers. Powered by RAG — every response traces back to its exact source.',
    images: [
      {
        url: '/AskBro_Logo.png',
        width: 500,
        height: 500,
        alt: 'AskBro Logo',
      },
    ],
  },

  twitter: {
    card: 'summary',
    title: 'AskBro — AI Knowledge Base for Teams',
    description:
      'Ask questions about your team\'s documents. Get cited answers instantly.',
    images: ['/AskBro_Logo.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
