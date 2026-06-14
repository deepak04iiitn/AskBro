import FeaturePageShell from '@/components/seo/FeaturePageShell'
import {
  BrainCircuit, FileText, BarChart2, RefreshCw,
  CheckSquare, Zap, Users,
} from 'lucide-react'

export const metadata = {
  title: 'AI Quiz Generator — Create Quizzes from PDF & Documents in Seconds | AskBro',
  description: 'Generate multiple-choice, true/false, fill-in-the-blank, and short-answer quizzes from any PDF or document in seconds. Track scores, identify weak areas, and share quizzes with your team. Try free.',
  keywords: [
    'AI quiz generator from PDF', 'generate quiz from document', 'AI quiz creator', 'PDF to quiz',
    'quiz generator AI', 'auto quiz generator', 'create quiz from notes AI', 'AI test generator',
    'quiz from PDF free', 'AI study quiz', 'generate practice questions from document',
    'multiple choice quiz generator AI', 'AskBro quizzes', 'document to quiz AI',
  ],
  alternates: { canonical: 'https://askbro.app/features/quizzes' },
  openGraph: {
    title: 'AI Quiz Generator — Create Quizzes from PDF & Documents in Seconds | AskBro',
    description: 'Generate multiple-choice, true/false, and short-answer quizzes from any document in seconds. Track scores and identify weak areas. Free to try.',
    url: 'https://askbro.app/features/quizzes',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro AI Quiz Generator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Quiz Generator — Create Quizzes from PDF & Documents | AskBro',
    description: 'Turn any PDF or document into a multiple-choice or true/false quiz in seconds. Track scores and study smarter. Free to start.',
    images: ['/og-image.png'],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What types of questions does AskBro generate?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro generates multiple-choice (single and multiple answer), true/false, fill-in-the-blank, and short-answer questions. You can choose the question type or let AskBro decide based on the content.' } },
    { '@type': 'Question', name: 'How many questions can AskBro generate from a document?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro can generate up to 50 questions per document session. You can specify the exact number and question types before generating.' } },
    { '@type': 'Question', name: 'Can I track my quiz scores over time?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro tracks your score for each quiz session and shows you which topics and questions you consistently get wrong so you can focus your study time on weak areas.' } },
    { '@type': 'Question', name: 'Can I share quizzes with classmates or team members?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Workspace members can all access the same quizzes and take them independently, each seeing their own score. This makes AskBro ideal for study groups, classrooms, and team knowledge checks.' } },
    { '@type': 'Question', name: 'How does AskBro quiz generation compare to manually writing questions?', acceptedAnswer: { '@type': 'Answer', text: 'Writing good quiz questions manually takes hours. AskBro generates a complete quiz from any document in seconds, with plausible distractors and difficulty settings. You can edit any generated questions to fine-tune them.' } },
    { '@type': 'Question', name: 'Does AskBro generate quizzes in different difficulty levels?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can set easy, medium, or hard difficulty before generating. AskBro adjusts question complexity and the plausibility of wrong answers to match your chosen difficulty level.' } },
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
  { q: 'Can I track my quiz scores over time?', a: 'Yes. AskBro tracks your score for each quiz session and shows you which topics and questions you consistently get wrong so you can focus your study time on weak areas.' },
  { q: 'Can I use quizzes for a team or classroom?', a: 'Yes. Workspace members can all access the same quizzes and take them independently, each seeing their own score. Ideal for study groups, classrooms, and team knowledge checks.' },
  { q: 'How does AskBro quiz generation compare to writing questions manually?', a: 'Writing good quiz questions manually takes hours. AskBro generates a complete quiz from any document in seconds, with plausible distractors and difficulty settings. You can edit any generated question to fine-tune it.' },
  { q: 'Does AskBro generate quizzes in different difficulty levels?', a: 'Yes. Set easy, medium, or hard difficulty before generating. AskBro adjusts question complexity and the plausibility of wrong answers to match your chosen level.' },
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
