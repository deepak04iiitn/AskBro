import ComparePageShell from '@/components/seo/ComparePageShell'

export const metadata = {
  title: 'AskBro vs Perplexity — Private Document AI vs Web Search AI | 2026 Comparison',
  description: 'AskBro vs Perplexity AI compared: private document Q&A vs public web search. Learn when to use each, and why AskBro is the right choice for your own PDFs, GitHub repos, and confidential documents.',
  keywords: [
    'AskBro vs Perplexity', 'Perplexity alternative', 'AskBro Perplexity comparison',
    'AI document tool vs AI search', 'private AI document search', 'Perplexity AI alternative 2026',
    'document grounded AI vs web search AI', 'AI for private documents', 'confidential document AI',
    'AI knowledge base vs AI search engine',
  ],
  alternates: { canonical: 'https://askbro.app/compare/askbro-vs-perplexity' },
  openGraph: {
    title: 'AskBro vs Perplexity — Private Document AI vs Web Search AI | 2026',
    description: 'AskBro answers questions from your private documents. Perplexity searches the public web. Different tools for different jobs — here is how to choose.',
    url: 'https://askbro.app/compare/askbro-vs-perplexity',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro vs Perplexity Comparison' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskBro vs Perplexity — Private Document AI vs Web Search AI',
    description: 'Perplexity searches the public web. AskBro searches your own private documents and GitHub repos. Find out which tool fits your workflow.',
    images: ['/og-image.png'],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the difference between AskBro and Perplexity?', acceptedAnswer: { '@type': 'Answer', text: 'Perplexity is a web-search AI that answers questions using public internet sources. AskBro is a private knowledge workspace: it answers questions using only your own uploaded documents and repos, with no internet search. This makes AskBro ideal for private, sensitive, or proprietary documents.' } },
    { '@type': 'Question', name: 'When should I use AskBro instead of Perplexity?', acceptedAnswer: { '@type': 'Answer', text: 'Use AskBro when you want answers grounded in your own documents — private contracts, internal documentation, your codebase, or course materials. Use Perplexity for general web research where public sources are appropriate.' } },
    { '@type': 'Question', name: 'Can I use AskBro for confidential company documents?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro is designed for private workspaces. Your documents are not shared outside your workspace and are not used to train any model. This makes it safe for confidential contracts, internal runbooks, and proprietary code.' } },
    { '@type': 'Question', name: 'Does AskBro have an internet search feature like Perplexity?', acceptedAnswer: { '@type': 'Answer', text: 'No. AskBro intentionally does not search the internet. This is a feature, not a limitation — it means every answer is grounded exclusively in your own documents, eliminating hallucinations about information outside your knowledge base.' } },
    { '@type': 'Question', name: 'Which tool gives more accurate answers about my specific documents?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro gives far more accurate answers about your specific documents than Perplexity. Perplexity answers from public web sources; AskBro answers only from the exact content you uploaded, with page-level citations proving the source.' } },
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
  { q: 'Can I use AskBro for confidential company documents?', a: 'Yes. AskBro is designed for private workspaces. Your documents are not shared outside your workspace and are not used to train any model. This makes it safe for confidential contracts, internal runbooks, and proprietary code.' },
  { q: 'Does AskBro have internet search like Perplexity?', a: 'No. AskBro intentionally does not search the internet. Every answer is grounded exclusively in your own uploaded documents, which eliminates hallucinations about information outside your knowledge base.' },
  { q: 'Which tool gives more accurate answers about my specific documents?', a: 'AskBro gives far more accurate answers about your own documents than Perplexity. AskBro answers only from the exact content you uploaded, with page-level citations proving the source — not from public web pages that may be outdated or irrelevant.' },
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
