import ComparePageShell from '@/components/seo/ComparePageShell'

export const metadata = {
  title: 'AskBro vs ChatPDF — Full Feature Comparison',
  description: 'AskBro vs ChatPDF: compare document Q&A, GitHub repo search, interview prep, quizzes, and flashcards. See which AI document tool is right for you.',
  keywords: ['AskBro vs ChatPDF', 'ChatPDF alternative', 'best PDF AI tool', 'AskBro ChatPDF comparison'],
  alternates: { canonical: 'https://askbro.app/compare/askbro-vs-chatpdf' },
  openGraph: {
    title: 'AskBro vs ChatPDF — Full Feature Comparison',
    description: 'AskBro vs ChatPDF — which AI document tool has more features? Full comparison.',
    url: 'https://askbro.app/compare/askbro-vs-chatpdf',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the main difference between AskBro and ChatPDF?', acceptedAnswer: { '@type': 'Answer', text: 'ChatPDF focuses on single-document PDF chat. AskBro is a full AI workspace with multi-document Q&A, GitHub repo search, technical interview prep, AI quizzes, and flashcard generation.' } },
    { '@type': 'Question', name: 'Does AskBro support multi-document queries like ChatPDF?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro supports multi-document queries where you can ask questions across all uploaded documents simultaneously, with citations showing which document each part of the answer came from.' } },
  ],
}

const rows = [
  { feature: 'Chat with PDFs', askbro: true, competitor: true },
  { feature: 'Multi-document queries', askbro: true, competitor: false },
  { feature: 'Cited source + page number', askbro: true, competitor: true },
  { feature: 'GitHub repo Q&A', askbro: true, competitor: false },
  { feature: 'Technical interview prep', askbro: true, competitor: false },
  { feature: 'AI quiz generator', askbro: true, competitor: false },
  { feature: 'Flashcard creation', askbro: true, competitor: false },
  { feature: 'Team workspace', askbro: true, competitor: false },
  { feature: 'Free tier available', askbro: true, competitor: 'partial' },
  { feature: 'DOCX and Markdown support', askbro: true, competitor: 'partial' },
]

const askbroWins = [
  'AskBro goes far beyond PDF chat — it is a full knowledge workspace for documents, code, and learning.',
  'GitHub repo Q&A lets developers understand codebases without reading every file manually.',
  'AI interview prep, quizzes, and flashcards make AskBro a complete study and career tool.',
  'Team workspaces let multiple users share the same indexed documents and ask their own questions.',
  'Multi-document support means you can ask questions that span your entire document library in one query.',
]

const faqItems = [
  { q: 'What is the main difference between AskBro and ChatPDF?', a: 'ChatPDF focuses on single-document PDF chat. AskBro is a full AI workspace with multi-document Q&A, GitHub repo search, technical interview prep, AI quizzes, and flashcard generation.' },
  { q: 'Does AskBro support multi-document queries like ChatPDF?', a: 'Yes. AskBro supports multi-document queries where you can ask questions across all uploaded documents simultaneously, with citations showing which document each part of the answer came from.' },
  { q: 'Is AskBro free like ChatPDF?', a: 'AskBro has a free tier that includes document Q&A, quizzes, and flashcards. Premium features like unlimited documents and GitHub repo indexing are available on paid plans.' },
]

export default function AskBroVsChatPDFPage() {
  return (
    <ComparePageShell
      competitor="ChatPDF"
      tagline="AskBro does everything ChatPDF does — and much more"
      description="ChatPDF is a single-purpose PDF chat tool. AskBro is a full knowledge workspace: multi-document Q&A, GitHub repo search, technical interview prep, AI quizzes, and flashcard generation — all in one place."
      rows={rows}
      askbroWins={askbroWins}
      faqItems={faqItems}
      faqJsonLd={faqJsonLd}
    />
  )
}
