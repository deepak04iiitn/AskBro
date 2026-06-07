import FeaturePageShell from '@/components/seo/FeaturePageShell'
import {
  GitBranch, Code2, FileSearch, GitPullRequest,
  Layers, Zap, Shield,
} from 'lucide-react'

export const metadata = {
  title: 'GitHub Repo Q&A — Understand Any Codebase with AI | AskBro',
  description: 'Paste a GitHub URL and ask questions about the codebase. AskBro indexes the code, docs and README then gives cited answers. Try it free.',
  keywords: ['ask questions about GitHub repo', 'AI code explainer', 'GitHub codebase Q&A', 'AI code search', 'understand codebase with AI', 'AskBro GitHub'],
  alternates: { canonical: 'https://askbro.app/features/github-repo' },
  openGraph: {
    title: 'GitHub Repo Q&A — Understand Any Codebase with AI | AskBro',
    description: 'Paste a GitHub URL and ask questions about the codebase. Code cited answers, instantly.',
    url: 'https://askbro.app/features/github-repo',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How does AskBro index a GitHub repository?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro clones the public repository, reads all code files, the README, and documentation, then builds a semantic vector index that enables natural-language questions about the codebase.' } },
    { '@type': 'Question', name: 'Does AskBro support private GitHub repositories?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro currently supports public GitHub repositories. Private repo support with personal access tokens is on the roadmap.' } },
    { '@type': 'Question', name: 'What languages and file types can AskBro index?', acceptedAnswer: { '@type': 'Answer', text: 'AskBro indexes most programming languages including Python, JavaScript, TypeScript, Go, Rust, Java, C++, and more. It also reads Markdown documentation and configuration files.' } },
  ],
}

const benefits = [
  { icon: FileSearch, title: 'Answers with file and line citations', body: 'Every code answer references the exact file path and line number so you can verify and navigate directly in your editor.' },
  { icon: Code2, title: 'Architecture and design questions', body: 'Ask high-level questions like "how is auth handled?" or "what design patterns are used?" and get concise explanations.' },
  { icon: GitPullRequest, title: 'PR and diff understanding', body: 'Understand what a PR or commit changes and why, with full context from the surrounding codebase.' },
  { icon: Layers, title: 'Indexes code, README and docs', body: 'AskBro reads the full repository: source files, inline comments, README files, changelogs, and documentation folders.' },
  { icon: Zap, title: 'Onboard to new repos in hours', body: 'Stop spending days reading through an unfamiliar codebase. AskBro lets any developer get up to speed in hours.' },
  { icon: Shield, title: 'No code stored permanently', body: 'Repository content is indexed in memory for your session. Nothing is stored permanently outside your workspace.' },
]

const steps = [
  { title: 'Paste a GitHub URL', body: 'Enter the URL of any public GitHub repository. AskBro will begin indexing immediately.' },
  { title: 'AskBro indexes the repo', body: 'The code, README, and documentation are read, chunked, and indexed using vector embeddings. Most repos complete in under a minute.' },
  { title: 'Ask anything about the code', body: 'Ask architecture questions, find where a feature is implemented, trace a bug, or understand an unfamiliar module.' },
]

const faqItems = [
  { q: 'How does AskBro index a GitHub repository?', a: 'AskBro clones the public repository, reads all code files, the README, and documentation, then builds a semantic vector index that enables natural-language questions about the codebase.' },
  { q: 'Does AskBro support private GitHub repositories?', a: 'AskBro currently supports public GitHub repositories. Private repo support with personal access tokens is on the roadmap.' },
  { q: 'What languages and file types can AskBro index?', a: 'AskBro indexes most programming languages including Python, JavaScript, TypeScript, Go, Rust, Java, C++, and more. It also reads Markdown documentation and configuration files.' },
  { q: 'Can I ask questions about multiple repositories at once?', a: 'Yes. Add multiple repositories to your workspace and AskBro will search across all of them, citing which repo and file each answer came from.' },
]

const related = [
  { href: '/features/document-qa', label: 'Document Q&A' },
  { href: '/features/interview-prep', label: 'Interview Prep' },
  { href: '/features/quizzes', label: 'AI Quizzes' },
  { href: '/use-cases/developers', label: 'For Developers' },
]

export default function GithubRepoPage() {
  return (
    <FeaturePageShell
      icon={GitBranch}
      title="GitHub Repo Q&A"
      headline="Understand any codebase in hours, not weeks"
      description="Paste a GitHub URL and start asking questions about the code. AskBro indexes every file, answers architecture questions, and cites exact file paths and line numbers."
      benefits={benefits}
      steps={steps}
      faqItems={faqItems}
      related={related}
      faqJsonLd={faqJsonLd}
    />
  )
}
