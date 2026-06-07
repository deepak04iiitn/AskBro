import FeaturePageShell from '@/components/seo/FeaturePageShell'
import {
  BrainCircuit, FileText, BarChart2, RefreshCw,
  CheckSquare, Zap, Users,
} from 'lucide-react'

export const metadata = {
  title: 'AI Quiz Generator — Create Quizzes from Documents | AskBro',
  description: 'Generate multiple-choice, true/false, and short-answer quizzes from any document in seconds. Track scores and identify weak areas. Try free.',
  keywords: ['AI quiz generator from PDF', 'generate quiz from document', 'AI quiz creator', 'PDF to quiz', 'quiz generator AI', 'AskBro quizzes'],
  alternates: { canonical: 'https://askbro.app/features/quizzes' },
  openGraph: {
    title: 'AI Quiz Generator — Create Quizzes from Documents | AskBro',
    description: 'Generate multiple-choice, true/false, and short-answer quizzes from any document in seconds.',
    url: 'https://askbro.app/features/quizzes',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What types of questions does AskBro generate?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro generates multiple-choice (single and multiple answer), true/false, fill-in-the-blank, and short-answer questions. You can choose the question type or let AskBro decide based on the content.' } },
    { '@type': 'Question', name: 'How many questions can AskBro generate from a document?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro can generate up to 50 questions per document session. You can specify the exact number and question types before generating.' } },
    { '@type': 'Question', name: 'Can I track my quiz scores over time?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro tracks your score for each quiz session and shows you which topics and questions you consistently get wrong so you can focus your study.' } },
  ],
}

const benefits = [
  { icon: FileText, title: 'Any document, instant quiz', body: 'Upload a PDF, lecture note, or article and AskBro generates a complete quiz in seconds — no manual question writing needed.' },
  { icon: CheckSquare, title: 'Multiple question types', body: 'Generate multiple-choice, true/false, fill-in-the-blank, or short-answer questions. Mix types in a single quiz for varied practice.' },
  { icon: BarChart2, title: 'Score tracking and weak-area detection', body: 'AskBro tracks your performance per topic and surfaces the concepts you consistently struggle with so you can focus your study time.' },
  { icon: RefreshCw, title: 'Regenerate for fresh questions', body: 'Finished a quiz? Regenerate new questions on the same material for continued practice without repetition.' },
  { icon: Zap, title: 'Difficulty control', body: 'Choose easy, medium, or hard difficulty. AskBro adjusts question complexity to match your level.' },
  { icon: Users, title: 'Share quizzes with your team', body: 'Export or share quizzes with teammates, classmates, or students. Perfect for group study or team knowledge checks.' },
]

const steps = [
  { title: 'Upload or select a document', body: 'Choose a file from your workspace or upload a new one. AskBro reads the full content.' },
  { title: 'Configure your quiz', body: 'Set the number of questions, question types, and difficulty level, then click Generate.' },
  { title: 'Take and review', body: 'Complete the quiz and get an instant scored report with correct answers and explanations.' },
]

const faqItems = [
  { q: 'What types of questions does AskBro generate?', a: 'AskBro generates multiple-choice (single and multiple answer), true/false, fill-in-the-blank, and short-answer questions. You can choose the question type or let AskBro decide based on the content.' },
  { q: 'How many questions can AskBro generate from a document?', a: 'AskBro can generate up to 50 questions per document session. You can specify the exact number and question types before generating.' },
  { q: 'Can I track my quiz scores over time?', a: 'Yes. AskBro tracks your score for each quiz session and shows you which topics and questions you consistently get wrong so you can focus your study.' },
  { q: 'Can I use quizzes for a team or classroom?', a: 'Yes. Share quizzes with your workspace members. Any workspace member can take the same quiz and see their individual scores.' },
]

const related = [
  { href: '/features/document-qa', label: 'Document Q&A' },
  { href: '/features/flashcards', label: 'Flashcards' },
  { href: '/features/interview-prep', label: 'Interview Prep' },
  { href: '/use-cases/students', label: 'For Students' },
]

export default function QuizzesPage() {
  return (
    <FeaturePageShell
      icon={BrainCircuit}
      title="AI Quizzes"
      headline="Turn any document into a quiz instantly"
      description="Generate multiple-choice, true/false, and short-answer questions from your documents in seconds. Track scores, detect weak areas, and keep studying until it sticks."
      benefits={benefits}
      steps={steps}
      faqItems={faqItems}
      related={related}
      faqJsonLd={faqJsonLd}
    />
  )
}
