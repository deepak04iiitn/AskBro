import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import RateLimitOverlay from '@/components/RateLimitOverlay'

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
    default: 'AskBro — AI Knowledge Base, Interview Prep, Quizzes & Flashcards',
    template: '%s | AskBro',
  },
  description:
    'AskBro is your AI companion for learning and building. Chat with PDFs, ask questions about GitHub repos, ace technical interviews, and generate quizzes and flashcards — all in one workspace.',
  keywords: [
    'AI knowledge base', 'chat with PDF', 'ask questions about PDF', 'AI document assistant',
    'PDF Q&A tool', 'ask questions about GitHub repo', 'AI code explainer',
    'understand GitHub codebase', 'AI technical interview prep', 'coding interview practice AI',
    'AI quiz generator from PDF', 'AI flashcard generator', 'study AI tools', 'AskBro',
  ],
  authors: [{ name: 'AskBro Team' }],
  creator: 'AskBro',
  publisher: 'AskBro',
  alternates: { canonical: 'https://askbro.app' },
  openGraph: {
    type: 'website', locale: 'en_US', siteName: 'AskBro', url: 'https://askbro.app',
    title: 'AskBro — AI Knowledge Base, Interview Prep, Quizzes & Flashcards',
    description: 'Chat with PDFs, explore GitHub repos, prep for interviews, and generate quizzes and flashcards — powered by AI.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskBro — AI Knowledge Base, Interview Prep, Quizzes & Flashcards',
    description: 'Chat with PDFs, explore GitHub repos, ace interviews, generate quizzes and flashcards.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body
        className="min-h-screen"
        style={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          backgroundColor: '#050506',
          color: '#EDEDEF',
        }}
      >
        {children}
        <RateLimitOverlay />
      </body>
    </html>
  )
}
