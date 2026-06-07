import FeaturePageShell from '@/components/seo/FeaturePageShell'
import {
  Target, MessageSquare, BookOpen, TrendingUp,
  ClipboardList, Zap, RefreshCw,
} from 'lucide-react'

export const metadata = {
  title: 'AI Interview Prep — Ace Technical Interviews | AskBro',
  description: 'Practice DSA, system design and behavioural interviews with AI coaching. Upload a job description for targeted prep. Get instant feedback. Try free.',
  keywords: ['AI interview prep', 'technical interview practice AI', 'coding interview AI coach', 'system design interview prep', 'DSA interview practice', 'AskBro interview prep'],
  alternates: { canonical: 'https://askbro.app/features/interview-prep' },
  openGraph: {
    title: 'AI Interview Prep — Ace Technical Interviews | AskBro',
    description: 'Practice DSA, system design and behavioural interviews with AI coaching and instant feedback.',
    url: 'https://askbro.app/features/interview-prep',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What types of interviews does AskBro help with?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro supports technical coding (DSA), system design, behavioural (STAR method), and company-specific interview preparation. You can also upload a job description for highly targeted practice.' } },
    { '@type': 'Question', name: 'How does AskBro give feedback on interview answers?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro analyses your answer for completeness, accuracy, communication clarity, and depth. It provides a score and specific suggestions on what to improve for each answer.' } },
    { '@type': 'Question', name: 'Can I practice with a specific job description?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Paste or upload a job description and AskBro tailors the interview questions to match the role, company, and required skills mentioned in the JD.' } },
  ],
}

const benefits = [
  { icon: ClipboardList, title: 'Targeted DSA practice', body: 'Practice data structures and algorithms questions at every difficulty level. Get model solutions with full time and space complexity explanations.' },
  { icon: MessageSquare, title: 'System design coaching', body: 'Work through system design questions step-by-step. AskBro evaluates your component choices, scaling decisions, and trade-off reasoning.' },
  { icon: BookOpen, title: 'Behavioural interview prep', body: 'Practice STAR-method behavioural questions. AskBro rates your structure, specificity, and impact demonstration.' },
  { icon: Target, title: 'Job description targeting', body: 'Upload a job description and AskBro generates interview questions matched exactly to the role, tech stack, and company culture mentioned.' },
  { icon: TrendingUp, title: 'Detailed answer feedback', body: 'Each answer gets a score with specific improvement suggestions — not generic feedback. Know exactly what to work on before the real interview.' },
  { icon: RefreshCw, title: 'Unlimited practice sessions', body: 'Practice as many times as you need. AskBro generates fresh questions every session so you are never memorising the same questions.' },
]

const steps = [
  { title: 'Choose your interview type', body: 'Select DSA, system design, behavioural, or paste a job description for targeted prep.' },
  { title: 'Answer interview questions', body: 'AskBro asks questions one at a time. Type or speak your answer as you would in a real interview.' },
  { title: 'Get scored feedback', body: 'Receive a score, a model answer, and specific tips on what to improve. Repeat until you are confident.' },
]

const faqItems = [
  { q: 'What types of interviews does AskBro help with?', a: 'AskBro supports technical coding (DSA), system design, behavioural (STAR method), and company-specific interview preparation. You can also upload a job description for highly targeted practice.' },
  { q: 'How does AskBro give feedback on interview answers?', a: 'AskBro analyses your answer for completeness, accuracy, communication clarity, and depth. It provides a score and specific suggestions on what to improve for each answer.' },
  { q: 'Can I practice with a specific job description?', a: 'Yes. Paste or upload a job description and AskBro tailors the interview questions to match the role, company, and required skills mentioned in the JD.' },
  { q: 'Is AskBro interview prep only for software engineers?', a: 'No. While AskBro is especially powerful for technical roles, behavioural and general interview prep work for any role. The job-description feature makes it relevant for product managers, data scientists, designers, and more.' },
]

const related = [
  { href: '/features/document-qa', label: 'Document Q&A' },
  { href: '/features/quizzes', label: 'AI Quizzes' },
  { href: '/features/flashcards', label: 'Flashcards' },
  { href: '/use-cases/onboarding', label: 'For Job Seekers' },
]

export default function InterviewPrepPage() {
  return (
    <FeaturePageShell
      icon={Target}
      title="Interview Prep"
      headline="AI coaching to ace any technical interview"
      description="Practice DSA, system design, and behavioural questions with an AI coach that gives scored, specific feedback. Upload a job description and get questions tailored to the exact role."
      benefits={benefits}
      steps={steps}
      faqItems={faqItems}
      related={related}
      faqJsonLd={faqJsonLd}
    />
  )
}
