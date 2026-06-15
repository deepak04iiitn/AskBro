import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import RateLimitOverlay from '@/components/RateLimitOverlay'
import JsonLd from '@/components/seo/JsonLd'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://askbro.app'),
  title: {
    default: 'AskBro — Chat with PDFs, GitHub Repos, Interview Prep & AI Flashcards',
    template: '%s | AskBro',
  },
  description:
    'AskBro is the AI workspace that lets you chat with PDFs, ask questions about any GitHub repository, ace technical interviews with AI coaching, and generate quizzes and flashcards from your documents — all in one private workspace.',
  keywords: [
    'AI knowledge base', 'chat with PDF', 'ask questions about PDF', 'AI document assistant',
    'PDF Q&A tool', 'ask questions about GitHub repo', 'AI code explainer',
    'understand GitHub codebase', 'AI technical interview prep', 'coding interview practice AI',
    'AI quiz generator from PDF', 'AI flashcard generator', 'study AI tools', 'AskBro',
    'document AI chat', 'RAG document search', 'AI study tool', 'chat with documents',
    'GitHub codebase search AI', 'AI interview coach', 'spaced repetition AI',
  ],
  authors: [{ name: 'AskBro Team' }],
  creator: 'AskBro',
  publisher: 'AskBro',
  alternates: { canonical: 'https://askbro.app' },
  openGraph: {
    type: 'website', locale: 'en_US', siteName: 'AskBro', url: 'https://askbro.app',
    title: 'AskBro — Chat with PDFs, GitHub Repos, Interview Prep & AI Flashcards',
    description: 'Chat with PDFs, explore GitHub repos with AI, ace technical interviews, and generate quizzes and flashcards — all in one private workspace.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro — AI Knowledge Workspace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskBro — Chat with PDFs, GitHub Repos & AI Study Tools',
    description: 'Chat with PDFs, ask questions about GitHub codebases, ace technical interviews, and generate AI quizzes and flashcards — free to start.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: {
    // Add your Google Search Console verification token here when available
    // google: 'your-token-here',
  },
}

const globalJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AskBro',
    url: 'https://askbro.app',
    logo: { '@type': 'ImageObject', url: 'https://askbro.app/AskBro_Logo.png' },
    description: 'AskBro is an AI knowledge workspace for chatting with PDFs, understanding GitHub repositories, preparing for technical interviews, and generating quizzes and flashcards.',
    sameAs: [],
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: 'https://askbro.app' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AskBro',
    url: 'https://askbro.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://askbro.app/blog?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  },
]

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <Script src="https://analytics.ahrefs.com/analytics.js" data-key="AIGYHFnQ7Twif1b5wYVqKA" strategy="beforeInteractive" />
      </head>
      <body
        className="min-h-screen"
        style={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          backgroundColor: '#050506',
          color: '#EDEDEF',
        }}
      >
        <JsonLd data={globalJsonLd} />
        {children}
        <RateLimitOverlay />
      </body>
    </html>
  )
}
