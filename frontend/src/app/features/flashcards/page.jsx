import FeaturePageShell from '@/components/seo/FeaturePageShell'
import {
  Layers, FileText, RefreshCw, TrendingUp,
  BookOpen, Zap, Download,
} from 'lucide-react'

export const metadata = {
  title: 'AI Flashcard Generator — Create Flashcards from Documents | AskBro',
  description: 'Automatically generate spaced-repetition flashcards from any document. Upload your notes and start studying smarter. Try free.',
  keywords: ['AI flashcard generator', 'generate flashcards from PDF', 'AI flashcard creator', 'spaced repetition flashcards', 'study flashcards AI', 'AskBro flashcards'],
  alternates: { canonical: 'https://askbro.app/features/flashcards' },
  openGraph: {
    title: 'AI Flashcard Generator — Create Flashcards from Documents | AskBro',
    description: 'Automatically generate spaced-repetition flashcards from any document. Study smarter.',
    url: 'https://askbro.app/features/flashcards',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How does AskBro generate flashcards from documents?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro reads your document, identifies key concepts, definitions, and facts, then formats them as front/back flashcard pairs. The process is fully automatic — no manual editing required.' } },
    { '@type': 'Question', name: 'Does AskBro support spaced repetition?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro uses a spaced repetition algorithm to schedule card reviews based on your recall performance. Cards you struggle with appear more frequently until you master them.' } },
    { '@type': 'Question', name: 'Can I edit the flashcards AskBro generates?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. All generated flashcards can be edited, merged, split, or deleted. You can also add cards manually to any deck.' } },
  ],
}

const benefits = [
  { icon: FileText, title: 'Auto-generated from any doc', body: 'Upload lecture notes, textbooks, or research papers. AskBro extracts key concepts and creates front/back flashcard pairs automatically.' },
  { icon: RefreshCw, title: 'Spaced repetition scheduling', body: 'AskBro adapts the review schedule based on how well you know each card. Cards you struggle with appear more often until mastered.' },
  { icon: TrendingUp, title: 'Mastery tracking per card', body: 'See which cards you know cold and which ones need more practice. Focus your limited study time where it matters most.' },
  { icon: BookOpen, title: 'Edit and customise decks', body: 'All auto-generated cards can be edited, merged, split, or deleted. Add your own cards at any time.' },
  { icon: Zap, title: 'Instant deck creation', body: 'A 50-page document becomes a study deck in under a minute. No more hours spent manually writing flashcards.' },
  { icon: Download, title: 'Export and share decks', body: 'Export decks for use elsewhere or share them with classmates in your workspace.' },
]

const steps = [
  { title: 'Upload your study material', body: 'Choose any document from your workspace — notes, textbook chapters, or articles.' },
  { title: 'AskBro builds the deck', body: 'Key concepts are extracted and formatted as question/answer flashcard pairs. The deck is ready in seconds.' },
  { title: 'Study with spaced repetition', body: 'Flip cards, rate your recall, and let the algorithm schedule your reviews for maximum retention.' },
]

const faqItems = [
  { q: 'How does AskBro generate flashcards from documents?', a: 'AskBro reads your document, identifies key concepts, definitions, and facts, then formats them as front/back flashcard pairs. The process is fully automatic — no manual editing required.' },
  { q: 'Does AskBro support spaced repetition?', a: 'Yes. AskBro uses a spaced repetition algorithm to schedule card reviews based on your recall performance. Cards you struggle with appear more frequently until you master them.' },
  { q: 'Can I edit the flashcards AskBro generates?', a: 'Yes. All generated flashcards can be edited, merged, split, or deleted. You can also add cards manually to any deck.' },
  { q: 'How is AskBro flashcards different from Anki?', a: 'AskBro generates the flashcard content automatically from your own documents. With Anki, you write the cards yourself. AskBro saves hours of card-creation time while keeping the benefits of spaced repetition.' },
]

const related = [
  { href: '/features/document-qa', label: 'Document Q&A' },
  { href: '/features/quizzes', label: 'AI Quizzes' },
  { href: '/features/interview-prep', label: 'Interview Prep' },
  { href: '/use-cases/students', label: 'For Students' },
]

export default function FlashcardsPage() {
  return (
    <FeaturePageShell
      icon={Layers}
      title="Flashcards"
      headline="Spaced-repetition decks built from your docs"
      description="Upload your study material and AskBro generates a complete flashcard deck automatically. Study with a spaced repetition algorithm that adapts to what you know and what you don't."
      benefits={benefits}
      steps={steps}
      faqItems={faqItems}
      related={related}
      faqJsonLd={faqJsonLd}
    />
  )
}
