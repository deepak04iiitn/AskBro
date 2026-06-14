import UseCasePageShell from '@/components/seo/UseCasePageShell'
import { GraduationCap } from 'lucide-react'

export const metadata = {
  title: 'AskBro for Students — AI Study Tool for Lecture Notes, Quizzes & Flashcards',
  description: 'Students use AskBro to chat with lecture notes and textbooks, auto-generate quizzes and flashcards, ask questions across multiple PDFs, and prep for exams with AI. Study smarter, not harder. Free to start.',
  keywords: [
    'AI study tool for students', 'chat with lecture notes AI', 'AI quiz generator students',
    'AI flashcard generator students', 'student AI assistant', 'AI study helper',
    'ask questions about lecture notes', 'PDF study tool AI', 'exam prep AI tool',
    'AI for university students', 'college AI study tool', 'study notes AI chat',
    'AskBro students', 'AI homework helper', 'generate quiz from lecture notes',
  ],
  alternates: { canonical: 'https://askbro.app/use-cases/students' },
  openGraph: {
    title: 'AskBro for Students — AI Study Tool for Lecture Notes, Quizzes & Flashcards',
    description: 'Chat with lecture notes, auto-generate quizzes and flashcard decks, and prep for exams with AI. Study smarter, not harder. Free to start.',
    url: 'https://askbro.app/use-cases/students',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro for Students' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskBro for Students — AI Study Tool for Lecture Notes, Quizzes & Flashcards',
    description: 'Upload lecture notes, generate quizzes and flashcards instantly, and ask questions about your study material. Free AI study tool.',
    images: ['/og-image.png'],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do students use AskBro for studying?', acceptedAnswer: { '@type': 'Answer', text: 'Students upload lecture notes, textbooks, and readings to AskBro, then ask questions in plain English, generate multiple-choice quizzes, and create spaced-repetition flashcard decks — all from the same workspace.' } },
    { '@type': 'Question', name: 'Can AskBro help with exam preparation?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro generates practice questions and quizzes directly from your own notes, creates spaced-repetition flashcard decks, and helps you identify weak topic areas before an exam.' } },
    { '@type': 'Question', name: 'Does AskBro work with university lecture slides and PDFs?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro supports PDF, DOCX, TXT, and Markdown files. Most lecture slides export to PDF perfectly. You can upload multiple files and ask questions that span all of them simultaneously.' } },
    { '@type': 'Question', name: 'How is AskBro different from Quizlet or Anki for students?', acceptedAnswer: { '@type': 'Answer', text: 'Quizlet and Anki require you to manually create flashcards and quiz questions. AskBro automatically generates both from your own uploaded lecture notes and documents — saving hours of prep time while keeping the active recall benefits of spaced repetition.' } },
    { '@type': 'Question', name: 'Can AskBro read and answer questions across multiple lecture PDFs at once?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upload your entire set of lecture PDFs for a course and AskBro will search across all of them simultaneously, giving you cited answers from whichever document is most relevant to your question.' } },
  ],
}

const painPoints = [
  { title: 'Hours spent making flashcards', body: 'Manually creating Anki or Quizlet decks from hundreds of pages of notes eats up precious study time.' },
  { title: 'Searching through PDFs for answers', body: 'Ctrl+F only works if you know the exact keyword. Finding context in dense documents is slow and frustrating.' },
  { title: 'No way to test yourself automatically', body: 'Writing quiz questions yourself takes longer than studying the material.' },
]

const benefits = [
  { title: 'Flashcard decks auto-generated from notes', body: 'Upload lecture slides and AskBro builds a complete flashcard deck in seconds, ready for spaced-repetition review.' },
  { title: 'Ask questions in plain English', body: '"What is the difference between supervised and unsupervised learning?" — just ask, and get a cited answer from your own notes.' },
  { title: 'Practice quizzes in 30 seconds', body: 'Generate a 20-question multiple-choice quiz from any document, take it, and see your score with correct answers.' },
]

const faqItems = [
  { q: 'How do students use AskBro for studying?', a: 'Students upload lecture notes, textbooks, and readings to AskBro, then ask questions in plain English, generate multiple-choice quizzes, and create spaced-repetition flashcard decks — all from the same workspace.' },
  { q: 'Can AskBro help with exam preparation?', a: 'Yes. AskBro generates practice questions and quizzes directly from your own notes, creates spaced-repetition flashcard decks, and helps you identify weak topic areas before an exam.' },
  { q: 'Does AskBro work with university lecture slides and PDFs?', a: 'Yes. AskBro supports PDF, DOCX, TXT, and Markdown files. Most lecture slides export to PDF perfectly. You can upload multiple files and ask questions that span all of them simultaneously.' },
  { q: 'How is AskBro different from Quizlet or Anki for students?', a: 'Quizlet and Anki require you to manually create flashcards and quiz questions. AskBro automatically generates both from your own lecture notes — saving hours of prep time while keeping the active recall benefits of spaced repetition.' },
  { q: 'Can AskBro read across multiple lecture PDFs at once?', a: 'Yes. Upload your entire set of lecture PDFs for a course and AskBro searches across all of them simultaneously, giving you cited answers from whichever document is most relevant to your question.' },
]

const relatedFeatures = [
  { href: '/features/document-qa', label: 'Document Q&A' },
  { href: '/features/quizzes', label: 'AI Quizzes' },
  { href: '/features/flashcards', label: 'Flashcards' },
]

export default function StudentsPage() {
  return (
    <UseCasePageShell
      icon={GraduationCap}
      persona="Students"
      tagline="Study smarter, not harder"
      description="Upload your lecture notes, readings and textbooks. Ask questions, generate quizzes, and build flashcard decks with AI. Spend your time learning, not formatting study materials."
      painPoints={painPoints}
      benefits={benefits}
      faqItems={faqItems}
      relatedFeatures={relatedFeatures}
      faqJsonLd={faqJsonLd}
    />
  )
}
