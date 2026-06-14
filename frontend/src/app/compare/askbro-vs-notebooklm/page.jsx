import ComparePageShell from '@/components/seo/ComparePageShell'

export const metadata = {
  title: 'AskBro vs NotebookLM — Full Feature Comparison 2026 | Which is Better?',
  description: 'AskBro vs Google NotebookLM compared: document Q&A, GitHub repo search, AI quiz generation, flashcard creation, interview prep, and team workspaces. Find out which tool is right for your workflow.',
  keywords: [
    'AskBro vs NotebookLM', 'NotebookLM alternative', 'AskBro NotebookLM comparison',
    'best AI note tool', 'Google NotebookLM alternative 2026', 'NotebookLM vs AskBro',
    'better than NotebookLM', 'AI document tool comparison', 'NotebookLM for students',
    'NotebookLM developer alternative',
  ],
  alternates: { canonical: 'https://askbro.app/compare/askbro-vs-notebooklm' },
  openGraph: {
    title: 'AskBro vs NotebookLM — Full Feature Comparison 2026',
    description: 'AskBro vs Google NotebookLM: compare document Q&A, GitHub repo search, quiz generation, flashcards, and team workspaces. Find the right AI tool.',
    url: 'https://askbro.app/compare/askbro-vs-notebooklm',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro vs NotebookLM Comparison' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskBro vs Google NotebookLM — Full Feature Comparison 2026',
    description: 'AskBro adds GitHub repo Q&A, interview prep, AI quizzes, and flashcards on top of everything NotebookLM does. See the full comparison.',
    images: ['/og-image.png'],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the difference between AskBro and NotebookLM?', acceptedAnswer: { '@type': 'Answer', text: 'Google NotebookLM focuses on document summarisation and notebook-style Q&A. AskBro adds GitHub repo Q&A, technical interview prep, AI quiz generation, and spaced-repetition flashcard creation on top of document Q&A — making it a complete learning and knowledge platform.' } },
    { '@type': 'Question', name: 'Does AskBro support team workspaces like NotebookLM?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro supports shared team workspaces where multiple users can access the same documents and ask their own questions independently, each with separate conversation history.' } },
    { '@type': 'Question', name: 'Which tool is better for students — AskBro or NotebookLM?', acceptedAnswer: { '@type': 'Answer', text: 'For students, AskBro is typically the stronger choice because of AI quiz generation, spaced-repetition flashcards, and the ability to ask questions across multiple lecture documents simultaneously.' } },
    { '@type': 'Question', name: 'Can AskBro handle GitHub repositories, which NotebookLM cannot?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro lets you paste a GitHub repository URL and ask questions about the codebase with exact file and line citations — a capability NotebookLM does not offer. This makes AskBro significantly more useful for developers and engineering teams.' } },
    { '@type': 'Question', name: 'Is AskBro tied to a Google account like NotebookLM?', acceptedAnswer: { '@type': 'Answer', text: 'No. AskBro is an independent platform that does not require a Google account. You can sign up with any email address and use it completely independently of the Google ecosystem.' } },
  ],
}

const rows = [
  { feature: 'Document Q&A with citations', askbro: true, competitor: true },
  { feature: 'Multi-document queries', askbro: true, competitor: true },
  { feature: 'GitHub repo Q&A', askbro: true, competitor: false },
  { feature: 'Technical interview prep', askbro: true, competitor: false },
  { feature: 'AI quiz generator', askbro: true, competitor: false },
  { feature: 'Flashcard creation', askbro: true, competitor: false },
  { feature: 'Team workspace', askbro: true, competitor: 'partial' },
  { feature: 'DOCX and Markdown support', askbro: true, competitor: 'partial' },
  { feature: 'Free tier available', askbro: true, competitor: true },
  { feature: 'API access', askbro: 'partial', competitor: false },
]

const askbroWins = [
  'GitHub repo Q&A enables software teams to use AskBro as a code knowledge base, not just a document reader.',
  'Interview prep, quizzes, and flashcards make AskBro uniquely suited for learning and career development.',
  'AskBro is purpose-built for workspace teams, not tied to a Google account ecosystem.',
  'Full DOCX, PDF, Markdown, and TXT support without file type limitations.',
]

const faqItems = [
  { q: 'What is the difference between AskBro and NotebookLM?', a: 'Google NotebookLM focuses on document summarisation and notebook-style Q&A. AskBro adds GitHub repo Q&A, technical interview prep, AI quiz generation, and spaced-repetition flashcard creation — making it a complete learning and knowledge platform.' },
  { q: 'Does AskBro support team workspaces like NotebookLM?', a: 'Yes. AskBro supports shared team workspaces where multiple users can access the same documents and ask their own questions independently, each with separate conversation history.' },
  { q: 'Which tool is better for students — AskBro or NotebookLM?', a: 'For students, AskBro is typically the stronger choice because of AI quiz generation, spaced-repetition flashcards, and the ability to ask questions across multiple lecture documents simultaneously.' },
  { q: 'Can AskBro handle GitHub repositories, which NotebookLM cannot?', a: 'Yes. AskBro lets you paste a GitHub repository URL and ask questions about the codebase with exact file and line citations — a capability NotebookLM does not offer. This makes AskBro significantly more useful for developers and engineering teams.' },
  { q: 'Is AskBro tied to a Google account like NotebookLM?', a: 'No. AskBro is an independent platform that does not require a Google account. You can sign up with any email and use it completely independently of the Google ecosystem.' },
]

export default function AskBroVsNotebookLMPage() {
  return (
    <ComparePageShell
      competitor="NotebookLM"
      tagline="AskBro vs NotebookLM — more than a note-taking tool"
      description="NotebookLM is excellent for document grounding. AskBro extends that with GitHub repo Q&A, technical interview prep, AI-generated quizzes, and flashcard decks — tools for developers, students, and teams."
      rows={rows}
      askbroWins={askbroWins}
      faqItems={faqItems}
      faqJsonLd={faqJsonLd}
    />
  )
}
