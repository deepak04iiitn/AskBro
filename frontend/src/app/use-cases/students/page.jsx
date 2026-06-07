import UseCasePageShell from '@/components/seo/UseCasePageShell'
import { GraduationCap } from 'lucide-react'

export const metadata = {
  title: 'AskBro for Students — AI Study Tool for Notes, Quizzes & Flashcards',
  description: 'Students use AskBro to chat with lecture notes, generate quizzes, create flashcard decks, and prep for exams. Study smarter with AI. Try free.',
  keywords: ['AI study tool for students', 'chat with lecture notes AI', 'AI quiz generator students', 'AI flashcard generator students', 'student AI assistant', 'AskBro students'],
  alternates: { canonical: 'https://askbro.app/use-cases/students' },
  openGraph: {
    title: 'AskBro for Students — AI Study Tool for Notes, Quizzes & Flashcards',
    description: 'Chat with lecture notes, generate quizzes, create flashcards, and study smarter with AI.',
    url: 'https://askbro.app/use-cases/students',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do students use AskBro for studying?', acceptedAnswer: { '@type': 'Answer', text: 'Students upload lecture notes, textbooks, and readings to AskBro, then ask questions, generate quizzes, and create flashcard decks — all from the same workspace.' } },
    { '@type': 'Question', name: 'Can AskBro help with exam preparation?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro generates practice questions and quizzes from your own notes, creates spaced-repetition flashcard decks, and lets you identify weak areas before an exam.' } },
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
  { q: 'How do students use AskBro for studying?', a: 'Students upload lecture notes, textbooks, and readings to AskBro, then ask questions, generate quizzes, and create flashcard decks — all from the same workspace.' },
  { q: 'Can AskBro help with exam preparation?', a: 'Yes. AskBro generates practice questions and quizzes from your own notes, creates spaced-repetition flashcard decks, and lets you identify weak areas before an exam.' },
  { q: 'Does AskBro work with university lecture slides and PDFs?', a: 'Yes. AskBro supports PDF, DOCX, TXT and Markdown. Most lecture slides export to PDF perfectly. You can upload multiple files and ask questions that span all of them.' },
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
