import UseCasePageShell from '@/components/seo/UseCasePageShell'
import { Code2 } from 'lucide-react'

export const metadata = {
  title: 'AskBro for Developers — AI Codebase Understanding & GitHub Repo Search',
  description: 'Developers use AskBro to onboard to unfamiliar codebases in hours, trace bugs with AI, find where features are implemented, and ask architecture questions — with exact file and line citations. Try free.',
  keywords: [
    'AI codebase understanding', 'developer code search AI', 'GitHub repo Q&A developer',
    'understand legacy codebase AI', 'AI code navigator', 'AI developer tool',
    'onboard to codebase faster AI', 'understand open source repo AI', 'AI for developers',
    'GitHub AI search', 'codebase Q&A tool', 'code architecture AI', 'trace bug AI',
    'AskBro developers', 'AI software developer tool',
  ],
  alternates: { canonical: 'https://askbro.app/use-cases/developers' },
  openGraph: {
    title: 'AskBro for Developers — AI Codebase Understanding & GitHub Repo Search',
    description: 'Understand unfamiliar codebases, trace bugs, and navigate any GitHub repo with AI-cited answers pointing to exact files and line numbers. Free to start.',
    url: 'https://askbro.app/use-cases/developers',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro for Developers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskBro for Developers — AI Codebase Understanding & GitHub Repo Search',
    description: 'Paste a GitHub URL and ask architecture questions, trace bugs, and understand any codebase — with cited file and line answers. Free to start.',
    images: ['/og-image.png'],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do developers use AskBro to understand codebases?', acceptedAnswer: { '@type': 'Answer', text: 'Developers paste a GitHub URL and ask architecture, function, and bug questions about the code in plain English. AskBro indexes the full repo and answers with citations to the exact file and line number.' } },
    { '@type': 'Question', name: 'Does AskBro work with private repositories?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro currently supports public GitHub repositories. Private repo support with personal access tokens is on the roadmap.' } },
    { '@type': 'Question', name: 'What programming languages does AskBro support for code search?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro supports all major programming languages including Python, JavaScript, TypeScript, Go, Rust, Java, C++, Ruby, PHP, and more. It also reads Markdown documentation, YAML/JSON configuration files, and README files.' } },
    { '@type': 'Question', name: 'How quickly can a developer understand a new codebase with AskBro?', acceptedAnswer: { '@type': 'Answer', text: 'Most developers report understanding the architecture and key patterns of an unfamiliar codebase within a few hours using AskBro, compared to several days of reading files manually. The key advantage is being able to ask direct questions rather than inferring from file browsing.' } },
    { '@type': 'Question', name: 'Can AskBro help with contributing to open source projects?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro is especially useful for open source contributions. Index the repository before even cloning it, understand where to make your change, and ask how new features should be implemented — all before writing a single line of code.' } },
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
  { q: 'How do developers use AskBro to understand codebases?', a: 'Developers paste a GitHub URL and ask architecture, function, and bug questions about the code in plain English. AskBro indexes the full repo and answers with citations to the exact file and line number.' },
  { q: 'Does AskBro work with private repositories?', a: 'AskBro currently supports public GitHub repositories. Private repo support with personal access tokens is on the roadmap.' },
  { q: 'What programming languages does AskBro support for code search?', a: 'AskBro supports all major languages including Python, JavaScript, TypeScript, Go, Rust, Java, C++, Ruby, PHP, and more. It also reads Markdown documentation, YAML/JSON config files, and README files.' },
  { q: 'How quickly can I understand a new codebase with AskBro?', a: 'Most developers understand the architecture and key patterns of an unfamiliar codebase within a few hours using AskBro — compared to several days of reading files manually. Direct questions get direct answers with file citations.' },
  { q: 'Can AskBro help with contributing to open source projects?', a: 'Yes. Index the repository before even cloning it, understand where to make your change, and ask how new features should be implemented — all before writing a single line of code.' },
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
