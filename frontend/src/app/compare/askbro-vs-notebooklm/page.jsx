import ComparePageShell from '@/components/seo/ComparePageShell'

export const metadata = {
  title: 'AskBro vs NotebookLM — Full Feature Comparison',
  description: 'AskBro vs Google NotebookLM: compare AI document Q&A, GitHub repo search, interview prep, quizzes and flashcards. Which tool is right for you?',
  keywords: ['AskBro vs NotebookLM', 'NotebookLM alternative', 'AskBro NotebookLM comparison', 'best AI note tool'],
  alternates: { canonical: 'https://askbro.app/compare/askbro-vs-notebooklm' },
  openGraph: {
    title: 'AskBro vs NotebookLM — Full Feature Comparison',
    description: 'AskBro vs Google NotebookLM — a full feature comparison to help you choose.',
    url: 'https://askbro.app/compare/askbro-vs-notebooklm',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the difference between AskBro and NotebookLM?', acceptedAnswer: { '@type': 'Answer', text: 'Google NotebookLM focuses on document summarisation and notebook-style notes. AskBro adds GitHub repo Q&A, technical interview prep, AI quiz generation, and flashcard creation on top of document Q&A.' } },
    { '@type': 'Question', name: 'Does AskBro support team workspaces like NotebookLM?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro supports shared team workspaces where multiple users can access the same documents and ask their own questions independently.' } },
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
  { q: 'What is the difference between AskBro and NotebookLM?', a: 'Google NotebookLM focuses on document summarisation and notebook-style notes. AskBro adds GitHub repo Q&A, technical interview prep, AI quiz generation, and flashcard creation on top of document Q&A.' },
  { q: 'Does AskBro support team workspaces like NotebookLM?', a: 'Yes. AskBro supports shared team workspaces where multiple users can access the same documents and ask their own questions independently.' },
  { q: 'Which tool is better for students, AskBro or NotebookLM?', a: 'For students, AskBro is typically the stronger choice because of AI quiz generation, spaced-repetition flashcards, and the ability to ask questions across multiple lecture documents simultaneously.' },
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
