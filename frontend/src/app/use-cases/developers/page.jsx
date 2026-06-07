import UseCasePageShell from '@/components/seo/UseCasePageShell'
import { Code2 } from 'lucide-react'

export const metadata = {
  title: 'AskBro for Developers — AI Code Understanding and Codebase Search',
  description: 'Developers use AskBro to understand unfamiliar codebases, find where features are implemented, and trace bugs. Ask questions, get file citations. Try free.',
  keywords: ['AI codebase understanding', 'developer code search AI', 'GitHub repo Q&A developer', 'understand legacy codebase AI', 'AI code navigator', 'AskBro developers'],
  alternates: { canonical: 'https://askbro.app/use-cases/developers' },
  openGraph: {
    title: 'AskBro for Developers — AI Code Understanding and Codebase Search',
    description: 'Understand unfamiliar codebases, trace bugs, and navigate any repo with AI-cited answers.',
    url: 'https://askbro.app/use-cases/developers',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do developers use AskBro to understand codebases?', acceptedAnswer: { '@type': 'Answer', text: 'Developers paste a GitHub URL and ask architecture, function, and bug questions about the code. AskBro indexes the full repo and answers with citations to the exact file and line number.' } },
    { '@type': 'Question', name: 'Does AskBro work with private repositories?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro currently supports public GitHub repositories. Private repo support is on the roadmap.' } },
  ],
}

const painPoints = [
  { title: 'Days reading an unfamiliar codebase', body: 'Joining a new project or contributing to an open-source repo means days of reading code before you understand the architecture.' },
  { title: 'No fast way to find where things are', body: 'Text search only works if you know the right keyword. Understanding why something exists requires reading far more code than necessary.' },
  { title: 'Documentation that is always out of date', body: 'READMEs go stale. Architecture docs reference classes and modules that no longer exist. You end up reading the code anyway.' },
]

const benefits = [
  { title: 'Understand any repo architecture in hours', body: '"How is authentication handled?" "Where does the job queue live?" Get direct answers with file citations so you can navigate immediately.' },
  { title: 'Trace bugs with context', body: '"This function returns null sometimes — where else is it called?" AskBro traces dependencies and call chains across the entire codebase.' },
  { title: 'Contribute to open source faster', body: 'Ask questions about a new open-source project before cloning it. Understand whether it solves your problem and how it works before committing.' },
]

const faqItems = [
  { q: 'How do developers use AskBro to understand codebases?', a: 'Developers paste a GitHub URL and ask architecture, function, and bug questions about the code. AskBro indexes the full repo and answers with citations to the exact file and line number.' },
  { q: 'Does AskBro work with private repositories?', a: 'AskBro currently supports public GitHub repositories. Private repo support is on the roadmap.' },
  { q: 'What languages does AskBro support for code search?', a: 'AskBro supports all major languages including Python, JavaScript, TypeScript, Go, Rust, Java, C++, Ruby, and more. It also reads Markdown documentation and config files.' },
]

const relatedFeatures = [
  { href: '/features/github-repo', label: 'GitHub Repo Q&A' },
  { href: '/features/document-qa', label: 'Document Q&A' },
  { href: '/use-cases/engineering-teams', label: 'For Engineering Teams' },
]

export default function DevelopersPage() {
  return (
    <UseCasePageShell
      icon={Code2}
      persona="Developers"
      tagline="Understand any codebase in hours, not weeks"
      description="Paste a GitHub URL and ask questions about the code. AskBro indexes every file and answers architecture questions, traces bugs, and navigates unfamiliar repos — with exact file and line citations."
      painPoints={painPoints}
      benefits={benefits}
      faqItems={faqItems}
      relatedFeatures={relatedFeatures}
      faqJsonLd={faqJsonLd}
    />
  )
}
