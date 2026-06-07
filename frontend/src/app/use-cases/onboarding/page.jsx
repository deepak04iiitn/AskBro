import UseCasePageShell from '@/components/seo/UseCasePageShell'
import { Briefcase } from 'lucide-react'

export const metadata = {
  title: 'AskBro for Job Seekers — AI Interview Prep and Job Application Support',
  description: 'Job seekers use AskBro to practice technical and behavioural interviews, upload job descriptions for targeted prep, and build confidence before the real thing. Try free.',
  keywords: ['AI interview prep job seekers', 'job application AI assistant', 'technical interview practice AI', 'behavioural interview AI coach', 'job description interview practice', 'AskBro job seekers'],
  alternates: { canonical: 'https://askbro.app/use-cases/onboarding' },
  openGraph: {
    title: 'AskBro for Job Seekers — AI Interview Prep and Job Application Support',
    description: 'Practice technical and behavioural interviews with AI coaching. Upload a job description for targeted prep.',
    url: 'https://askbro.app/use-cases/onboarding',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How does AskBro help with job interview preparation?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro provides AI-powered interview coaching for technical (DSA, system design) and behavioural (STAR method) interviews. You can upload a job description and AskBro tailors the questions to that specific role.' } },
    { '@type': 'Question', name: 'Can AskBro prepare me for a specific company\'s interview?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Paste a job description or describe the company and role. AskBro will generate questions that match the company\'s known interview style, the required tech stack, and the role level.' } },
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
  { q: 'How does AskBro help with job interview preparation?', a: 'AskBro provides AI-powered interview coaching for technical (DSA, system design) and behavioural (STAR method) interviews. You can upload a job description and AskBro tailors the questions to that specific role.' },
  { q: 'Can AskBro prepare me for a specific company\'s interview?', a: 'Yes. Paste a job description or describe the company and role. AskBro will generate questions that match the company\'s known interview style, the required tech stack, and the role level.' },
  { q: 'Is AskBro only for software engineering interviews?', a: 'No. While AskBro excels at technical coding and system design interviews, the behavioural and general interview prep works for any role — product management, data science, design, and more.' },
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
