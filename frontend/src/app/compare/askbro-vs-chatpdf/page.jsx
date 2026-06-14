import ComparePageShell from '@/components/seo/ComparePageShell'

export const metadata = {
  title: 'AskBro vs ChatPDF — Full Feature Comparison 2026 | Which is Better?',
  description: 'AskBro vs ChatPDF side-by-side comparison: document Q&A, multi-document search, GitHub repo Q&A, interview prep, AI quiz generation, flashcards, and team workspaces. See which AI document tool is right for you.',
  keywords: [
    'AskBro vs ChatPDF', 'ChatPDF alternative', 'best PDF AI tool', 'AskBro ChatPDF comparison',
    'ChatPDF alternative 2026', 'better than ChatPDF', 'PDF chat AI comparison',
    'AI document tool comparison', 'ChatPDF vs AskBro features', 'PDF Q&A tool comparison',
  ],
  alternates: { canonical: 'https://askbro.app/compare/askbro-vs-chatpdf' },
  openGraph: {
    title: 'AskBro vs ChatPDF — Full Feature Comparison 2026',
    description: 'AskBro vs ChatPDF: compare document Q&A, GitHub repo search, interview prep, quizzes, and flashcards. Find out which AI document tool does more.',
    url: 'https://askbro.app/compare/askbro-vs-chatpdf',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro vs ChatPDF Comparison' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskBro vs ChatPDF — Full Feature Comparison 2026',
    description: 'AskBro does everything ChatPDF does and much more — GitHub repos, interview prep, quizzes, flashcards, and team workspaces. See the full comparison.',
    images: ['/og-image.png'],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the main difference between AskBro and ChatPDF?', acceptedAnswer: { '@type': 'Answer', text: 'ChatPDF focuses on single-document PDF chat. AskBro is a full AI workspace with multi-document Q&A, GitHub repo search, technical interview prep, AI quizzes, and flashcard generation — all in one place.' } },
    { '@type': 'Question', name: 'Does AskBro support multi-document queries like ChatPDF?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro supports multi-document queries where you can ask questions across all uploaded documents simultaneously, with citations showing which document and page each part of the answer came from.' } },
    { '@type': 'Question', name: 'Can AskBro do everything ChatPDF can?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro covers everything ChatPDF does — chatting with PDFs, cited answers, multi-document search — plus adds GitHub repository Q&A, technical interview coaching, AI quiz generation, spaced-repetition flashcards, and team workspaces.' } },
    { '@type': 'Question', name: 'Which tool is better for students — AskBro or ChatPDF?', acceptedAnswer: { '@type': 'Answer', text: 'For students, AskBro is the stronger choice. Beyond PDF chat, it adds AI quiz generation, spaced-repetition flashcards, and multi-document search — tools specifically designed to improve learning outcomes, not just answer lookup.' } },
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
  { q: 'What is the main difference between AskBro and ChatPDF?', a: 'ChatPDF focuses on single-document PDF chat. AskBro is a full AI workspace with multi-document Q&A, GitHub repo search, technical interview prep, AI quizzes, and flashcard generation — all in one place.' },
  { q: 'Does AskBro support multi-document queries like ChatPDF?', a: 'Yes. AskBro supports multi-document queries where you can ask questions across all uploaded documents simultaneously, with citations showing which document and page each part of the answer came from.' },
  { q: 'Is AskBro free like ChatPDF?', a: 'AskBro has a free tier that includes document Q&A, quizzes, and flashcards — no credit card required. Premium features like unlimited documents and GitHub repo indexing are available on paid plans.' },
  { q: 'Can AskBro do everything ChatPDF can?', a: 'Yes. AskBro covers everything ChatPDF does — chatting with PDFs, cited answers, and multi-document search — plus adds GitHub repository Q&A, technical interview coaching, AI quiz generation, spaced-repetition flashcards, and team workspaces.' },
  { q: 'Does AskBro support the same file types as ChatPDF?', a: 'AskBro supports PDF, DOCX, DOC, TXT, and Markdown files — covering everything ChatPDF supports and more. Answers always include exact page number citations.' },
  { q: 'Which tool is better for students — AskBro or ChatPDF?', a: 'For students, AskBro is the stronger choice. Beyond PDF chat, it adds AI quiz generation, spaced-repetition flashcards, and multi-document search — tools specifically designed to improve learning outcomes, not just answer lookup.' },
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
