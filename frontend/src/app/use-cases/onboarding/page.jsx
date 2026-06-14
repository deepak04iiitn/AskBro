import UseCasePageShell from '@/components/seo/UseCasePageShell'
import { Briefcase } from 'lucide-react'

export const metadata = {
  title: 'AskBro for Job Seekers — AI-Powered Interview Prep from Any Job Description',
  description: 'Job seekers use AskBro to practice technical and behavioural interviews with AI coaching, upload job descriptions for targeted question generation, and get honest scored feedback on every answer. Try free.',
  keywords: [
    'AI interview prep job seekers', 'job application AI assistant', 'technical interview practice AI',
    'behavioural interview AI coach', 'job description interview practice', 'AI mock interview free',
    'interview prep from job description', 'AI interview confidence builder',
    'software engineer interview prep AI', 'STAR method AI practice', 'AskBro job seekers',
    'AI job interview coach', 'practice interview online free AI', 'land tech job AI prep',
  ],
  alternates: { canonical: 'https://askbro.app/use-cases/onboarding' },
  openGraph: {
    title: 'AskBro for Job Seekers — AI-Powered Interview Prep from Any Job Description',
    description: 'Upload a job description, practice targeted interview questions, and get honest AI feedback on every answer — technical, system design, and behavioural. Free to start.',
    url: 'https://askbro.app/use-cases/onboarding',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro for Job Seekers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskBro for Job Seekers — AI Interview Prep from Any Job Description',
    description: 'Upload a job description, get targeted interview questions, and receive honest scored feedback. Free AI interview coach.',
    images: ['/og-image.png'],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How does AskBro help with job interview preparation?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro provides AI-powered interview coaching for technical (DSA, system design) and behavioural (STAR method) interviews. You can upload a job description and AskBro tailors the questions to that specific role and company.' } },
    { '@type': 'Question', name: 'Can AskBro prepare me for a specific company\'s interview?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Paste a job description or describe the company and role. AskBro generates questions that match the company\'s known interview style, the required tech stack, and the role level — then gives you scored feedback on each answer.' } },
    { '@type': 'Question', name: 'Is AskBro only for software engineering interviews?', acceptedAnswer: { '@type': 'Answer', text: 'No. While AskBro excels at technical coding and system design interviews, the behavioural and general interview prep works for any role — product management, data science, design, finance, and more. The job-description feature adapts to any role.' } },
    { '@type': 'Question', name: 'How is AI interview feedback from AskBro different from practising alone?', acceptedAnswer: { '@type': 'Answer', text: 'Practising alone, you cannot tell if your answer is genuinely good or just sounds plausible to you. AskBro evaluates your answer for completeness, accuracy, and communication clarity, then gives a score and specific improvement suggestions — the equivalent of having a senior interviewer give you honest feedback.' } },
    { '@type': 'Question', name: 'Can I practice unlimited interview questions with AskBro?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro generates fresh questions each session so you are never memorising the same scenarios. Practice as many rounds as you need until you feel genuinely confident for the real interview.' } },
  ],
}

const painPoints = [
  { title: 'Generic interview prep that does not match the role', body: 'Practising random LeetCode problems does not prepare you for a specific company, team, or tech stack.' },
  { title: 'No honest feedback on your answers', body: 'Practising alone means you cannot tell if your system design answer is actually good or just sounds plausible to you.' },
  { title: 'Anxiety from not knowing what to expect', body: 'Going into an interview without knowing the question style, difficulty level, or topic focus is unnecessarily stressful.' },
]

const benefits = [
  { title: 'Targeted prep from a job description', body: 'Upload the JD and AskBro generates interview questions matched to the exact role, company, and required tech stack.' },
  { title: 'Honest, specific answer feedback', body: 'Get a score and concrete improvement suggestions on every answer — not vague praise. Know exactly what to improve.' },
  { title: 'Unlimited practice until you are confident', body: 'Practice the same question type as many times as you need. AskBro generates fresh variations so you are never memorising the same answer.' },
]

const faqItems = [
  { q: 'How does AskBro help with job interview preparation?', a: 'AskBro provides AI-powered interview coaching for technical (DSA, system design) and behavioural (STAR method) interviews. Upload a job description and AskBro tailors questions to that specific role and company — then gives scored feedback on each answer.' },
  { q: 'Can AskBro prepare me for a specific company\'s interview?', a: 'Yes. Paste a job description or describe the company and role. AskBro generates questions that match the company\'s known interview style, required tech stack, and role level.' },
  { q: 'Is AskBro only for software engineering interviews?', a: 'No. While AskBro excels at technical coding and system design interviews, the behavioural and general interview prep works for any role — product management, data science, design, finance, and more. The job-description feature adapts to any role.' },
  { q: 'How is AI interview feedback different from practising alone?', a: 'Practising alone, you cannot tell if your answer is genuinely good. AskBro evaluates your answer for completeness, accuracy, and communication clarity, then gives a score and specific improvement suggestions — like having a senior interviewer give you honest feedback.' },
  { q: 'Can I practice unlimited interview questions with AskBro?', a: 'Yes. AskBro generates fresh questions each session so you are never memorising the same scenarios. Practice as many rounds as you need until you feel genuinely confident.' },
]

const relatedFeatures = [
  { href: '/features/interview-prep', label: 'Interview Prep' },
  { href: '/features/document-qa', label: 'Document Q&A' },
  { href: '/features/quizzes', label: 'AI Quizzes' },
]

export default function OnboardingPage() {
  return (
    <UseCasePageShell
      icon={Briefcase}
      persona="Job Seekers"
      tagline="Land your next role with AI interview coaching"
      description="Upload a job description, practice targeted interview questions, and get honest scored feedback on every answer — technical, system design, and behavioural."
      painPoints={painPoints}
      benefits={benefits}
      faqItems={faqItems}
      relatedFeatures={relatedFeatures}
      faqJsonLd={faqJsonLd}
    />
  )
}
