import FeaturePageShell from '@/components/seo/FeaturePageShell'
import {
  FileText, BookOpen, Search, ShieldCheck,
  Zap, FileStack, Link2,
} from 'lucide-react'

export const metadata = {
  title: 'Document Q&A — Chat with PDFs, Word Docs & Markdown | AskBro',
  description: 'Ask questions about any PDF, Word doc, or Markdown file in plain English. AskBro returns cited answers with exact page numbers — no hallucinations, no keyword search. Try it free.',
  keywords: [
    'chat with PDF', 'ask questions about PDF', 'PDF AI assistant', 'document Q&A tool',
    'AI PDF reader', 'PDF chat free', 'ask questions about documents AI', 'AI document search',
    'RAG document Q&A', 'chat with Word document', 'AI PDF summarizer', 'PDF question answering',
    'AskBro Document Q&A', 'document AI chatbot', 'multi document AI search',
  ],
  alternates: { canonical: 'https://askbro.app/features/document-qa' },
  openGraph: {
    title: 'Document Q&A — Chat with PDFs, Word Docs & Markdown | AskBro',
    description: 'Ask questions about any PDF, Word doc, or Markdown file. Get cited answers with exact page numbers — no hallucinations. Free to try.',
    url: 'https://askbro.app/features/document-qa',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro Document Q&A' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Document Q&A — Chat with PDFs, Word Docs & Markdown | AskBro',
    description: 'Ask questions about any PDF or document and get cited answers with exact page numbers. Free to start.',
    images: ['/og-image.png'],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What file types does AskBro Document Q&A support?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro supports PDF, DOCX, DOC, TXT, and Markdown files. You can upload multiple documents and ask questions across all of them simultaneously, with citations from each file.' } },
    { '@type': 'Question', name: 'Does AskBro cite sources when answering questions?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every answer includes a citation showing the exact page number and document name where the information was found. This prevents AI hallucinations and lets you verify every answer yourself.' } },
    { '@type': 'Question', name: 'How accurate is AskBro Document Q&A?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro uses retrieval-augmented generation (RAG) which grounds every answer in your actual documents. Answers are bounded by the content you upload — not general internet knowledge — making hallucinations practically impossible.' } },
    { '@type': 'Question', name: 'Can I ask questions across multiple documents at once?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upload multiple files and AskBro searches across all of them when answering your question, citing which document and page each part of the answer came from.' } },
    { '@type': 'Question', name: 'How does AskBro Document Q&A work technically?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro uses retrieval-augmented generation (RAG). Your document is split into semantic chunks, embedded into a vector index, and when you ask a question, the most relevant chunks are retrieved and passed to an AI model to generate a cited answer.' } },
    { '@type': 'Question', name: 'Is my document data private?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Your documents are stored privately in your workspace and are never shared with other users or used to train any AI model. You retain full ownership of your documents.' } },
  ],
}

const benefits = [
  { icon: Search, title: 'Cited answers, every time', body: 'Every response includes the exact page and document the answer came from. No hallucinations — just grounded, trustworthy answers.' },
  { icon: FileStack, title: 'Multi-document queries', body: 'Upload multiple PDFs and ask questions that span all of them at once. AskBro finds the answer regardless of which file it lives in.' },
  { icon: Zap, title: 'Instant indexing', body: 'Documents are processed and indexed in seconds using vector embeddings. Start asking questions immediately after upload.' },
  { icon: BookOpen, title: 'Supports all major formats', body: 'PDF, DOCX, DOC, TXT and Markdown are all supported. Upload contracts, reports, research papers, or lecture notes.' },
  { icon: ShieldCheck, title: 'Private by default', body: 'Your documents stay in your workspace. Nothing is shared with other users or used to train any model.' },
  { icon: Link2, title: 'Deep-link citations', body: 'Citations link directly to the relevant page so you can verify every answer yourself in seconds.' },
]

const steps = [
  { title: 'Upload your document', body: 'Drag and drop a PDF, DOCX, TXT or Markdown file. AskBro accepts up to 200MB per file.' },
  { title: 'Wait for indexing', body: 'AskBro reads the document, splits it into chunks, and builds a semantic vector index. This takes a few seconds to a minute.' },
  { title: 'Ask anything', body: 'Type your question in plain English. AskBro retrieves the most relevant passages and synthesises a cited answer.' },
]

const faqItems = [
  { q: 'What file types does AskBro Document Q&A support?', a: 'AskBro supports PDF, DOCX, DOC, TXT, and Markdown files. You can upload multiple documents and ask questions across all of them simultaneously, with citations from each file.' },
  { q: 'Does AskBro cite sources when answering questions?', a: 'Yes. Every answer includes a citation showing the exact page number and document name where the information was found. This prevents AI hallucinations and lets you verify every answer yourself.' },
  { q: 'How accurate is AskBro Document Q&A?', a: 'AskBro uses retrieval-augmented generation (RAG) which grounds every answer in your actual documents. Answers are bounded by the content you upload — not general internet knowledge — making hallucinations practically impossible.' },
  { q: 'Can I ask questions across multiple documents?', a: 'Yes. Upload multiple files and AskBro will search across all of them when answering your question, citing which document and page each part of the answer came from.' },
  { q: 'How does AskBro Document Q&A work technically?', a: 'AskBro uses retrieval-augmented generation (RAG). Your document is split into semantic chunks, embedded into a vector index, and when you ask a question, the most relevant chunks are retrieved and passed to an AI model to generate a cited answer.' },
  { q: 'Is my document data private and secure?', a: 'Yes. Your documents are stored privately in your workspace and are never shared with other users or used to train any AI model. You retain full ownership of your documents.' },
]

const related = [
  { href: '/features/github-repo', label: 'GitHub Repo Q&A' },
  { href: '/features/interview-prep', label: 'Interview Prep' },
  { href: '/features/quizzes', label: 'AI Quizzes' },
  { href: '/features/flashcards', label: 'Flashcards' },
]

export default function DocumentQAPage() {
  return (
    <FeaturePageShell
      icon={FileText}
      title="Document Q&A"
      headline="Chat with PDFs, docs and Markdown"
      description="Upload any document and ask questions in plain English. AskBro retrieves the exact passage, cites the page, and gives you a clean, grounded answer — no hallucinations."
      benefits={benefits}
      steps={steps}
      faqItems={faqItems}
      related={related}
      faqJsonLd={faqJsonLd}
    />
  )
}
