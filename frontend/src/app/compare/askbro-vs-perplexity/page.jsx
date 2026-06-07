import ComparePageShell from '@/components/seo/ComparePageShell'

export const metadata = {
  title: 'AskBro vs Perplexity — Full Feature Comparison',
  description: 'AskBro vs Perplexity AI: document Q&A vs web search AI. Compare GitHub repo search, interview prep, quizzes, flashcards and more. Which should you use?',
  keywords: ['AskBro vs Perplexity', 'Perplexity alternative', 'AskBro Perplexity comparison', 'AI document tool vs AI search'],
  alternates: { canonical: 'https://askbro.app/compare/askbro-vs-perplexity' },
  openGraph: {
    title: 'AskBro vs Perplexity — Full Feature Comparison',
    description: 'AskBro vs Perplexity AI — document-grounded answers vs web search answers. Full comparison.',
    url: 'https://askbro.app/compare/askbro-vs-perplexity',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the difference between AskBro and Perplexity?', acceptedAnswer: { '@type': 'Answer', text: 'Perplexity is a web-search AI that answers questions using public internet sources. AskBro is a private knowledge workspace: it answers questions using only your own uploaded documents and repos, with no internet search. This makes AskBro ideal for private, sensitive, or proprietary documents.' } },
    { '@type': 'Question', name: 'When should I use AskBro instead of Perplexity?', acceptedAnswer: { '@type': 'Answer', text: 'Use AskBro when you want answers grounded in your own documents — private contracts, internal documentation, your codebase, or course materials. Use Perplexity for general web research where public sources are appropriate.' } },
  ],
}

const rows = [
  { feature: 'Answers from your own documents', askbro: true, competitor: false },
  { feature: 'Cited page + source number', askbro: true, competitor: 'partial' },
  { feature: 'Private, no internet access', askbro: true, competitor: false },
  { feature: 'GitHub repo Q&A', askbro: true, competitor: false },
  { feature: 'Technical interview prep', askbro: true, competitor: false },
  { feature: 'AI quiz generator', askbro: true, competitor: false },
  { feature: 'Flashcard creation', askbro: true, competitor: false },
  { feature: 'Team workspace', askbro: true, competitor: false },
  { feature: 'Web search answers', askbro: false, competitor: true },
  { feature: 'Real-time information', askbro: false, competitor: true },
]

const askbroWins = [
  'AskBro answers questions from your own private documents — your content never leaves your workspace.',
  'Cited answers link to exact page numbers in your documents, not external web sources that may change or disappear.',
  'GitHub repo Q&A, interview prep, quizzes, and flashcards are purpose-built learning and productivity tools absent from Perplexity.',
  'Team workspaces let engineering teams, classrooms, and study groups share a shared AI knowledge base.',
  'Zero hallucinations about your documents — AskBro only ever answers from content you have uploaded.',
]

const faqItems = [
  { q: 'What is the difference between AskBro and Perplexity?', a: 'Perplexity is a web-search AI that answers questions using public internet sources. AskBro is a private knowledge workspace: it answers questions using only your own uploaded documents and repos, with no internet search. This makes AskBro ideal for private, sensitive, or proprietary documents.' },
  { q: 'When should I use AskBro instead of Perplexity?', a: 'Use AskBro when you want answers grounded in your own documents — private contracts, internal documentation, your codebase, or course materials. Use Perplexity for general web research where public sources are appropriate.' },
  { q: 'Can I use AskBro for confidential company documents?', a: 'Yes. AskBro is designed for private workspaces. Your documents are not shared outside your workspace and are not used to train any model.' },
]

export default function AskBroVsPerplexityPage() {
  return (
    <ComparePageShell
      competitor="Perplexity"
      tagline="AskBro vs Perplexity — private docs vs public web"
      description="Perplexity answers questions from the public web. AskBro answers questions from your own private documents and GitHub repos. Different tools for different jobs — here is how to choose."
      rows={rows}
      askbroWins={askbroWins}
      faqItems={faqItems}
      faqJsonLd={faqJsonLd}
    />
  )
}
