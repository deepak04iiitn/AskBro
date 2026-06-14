import FeaturePageShell from '@/components/seo/FeaturePageShell'
import {
  Plug2, GitBranch, BookOpen, ShieldCheck,
  RefreshCw, Layers, Link2, Search,
} from 'lucide-react'

// ── SEO metadata ──────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Integrations — Connect Notion & GitHub to Your AI Workspace | AskBro',
  description:
    'Connect Notion and GitHub to AskBro and ask questions across all your content in one place. Import Notion pages and GitHub repositories — get cited AI answers from your real sources instantly.',
  keywords: [
    'AskBro integrations', 'connect Notion to AI', 'Notion AI Q&A', 'Notion page import AI',
    'GitHub repo AI search', 'ask questions GitHub codebase', 'AI workspace integrations',
    'Notion AI assistant', 'GitHub AI assistant', 'connect GitHub to AI workspace',
    'AI knowledge base integrations', 'AskBro Notion', 'AskBro GitHub integration',
    'import Notion pages AI', 'AI codebase search tool',
  ],
  alternates: { canonical: 'https://askbro.app/features/integrations' },
  openGraph: {
    title: 'Integrations — Connect Notion & GitHub to Your AI Workspace | AskBro',
    description:
      'Import Notion pages and GitHub repositories into AskBro and ask cited AI questions across all your connected sources — no copy-paste required.',
    url: 'https://askbro.app/features/integrations',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro Integrations — Notion & GitHub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Integrations — Connect Notion & GitHub | AskBro',
    description:
      'Connect Notion and GitHub. Ask AI questions across all your imported sources with page-level citations. Free to start.',
    images: ['/og-image.png'],
  },
}

// ── FAQ JSON-LD ───────────────────────────────────────────────────────────────

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What integrations does AskBro support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AskBro currently supports Notion and GitHub integrations. You can connect your Notion workspace via an API token to import any page, and connect your GitHub account via OAuth or a personal access token to import and query any repository — public or private.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I connect Notion to AskBro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In your AskBro workspace, go to Integrations and select Notion. Create a Notion integration at notion.so/my-integrations, copy the Internal Integration Secret, and paste it into AskBro. Then share any Notion page with the integration and import it directly by URL — it becomes a document you can ask questions about.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I connect GitHub to AskBro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to Integrations in your AskBro workspace and select GitHub. You can connect via OAuth (one click — authorise AskBro on GitHub) or paste a Personal Access Token for fine-grained control. Once connected, select any repository to import and AskBro will index the full codebase for AI-powered Q&A.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are my Notion and GitHub tokens stored securely?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All integration tokens — Notion API secrets and GitHub tokens — are encrypted at rest using AES-256 (Fernet) before being stored. They are never logged, displayed in plaintext, or shared with any third party. Each workspace has its own encryption key.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I import multiple Notion pages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can import as many Notion pages as you like — one at a time using the page URL. Each imported page becomes a document in your workspace that you can ask questions about individually or alongside other documents.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I import private GitHub repositories?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. When you connect via GitHub OAuth or a Personal Access Token with the correct scopes, AskBro can import private repositories that your account has access to. Private repo content stays within your workspace and is never shared.',
      },
    },
  ],
}

// ── Page data ─────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: BookOpen,
    title: 'Notion page import',
    body: 'Connect your Notion workspace and import any page by URL. Documentation, wikis, meeting notes, and SOPs become instantly queryable knowledge.',
  },
  {
    icon: GitBranch,
    title: 'GitHub repository Q&A',
    body: 'Import any public or private repository. AskBro indexes source files, README, docs, and config — then answers architecture and bug questions with exact file and line citations.',
  },
  {
    icon: Layers,
    title: 'Unified knowledge base',
    body: 'Ask one question and get answers that span your uploaded PDFs, Notion pages, and GitHub repos simultaneously. No switching between tools.',
  },
  {
    icon: RefreshCw,
    title: 'Always up to date',
    body: 'Re-import any Notion page to pick up the latest edits. GitHub repos can be re-synced to index new commits and pull requests at any time.',
  },
  {
    icon: ShieldCheck,
    title: 'Tokens encrypted at rest',
    body: 'All Notion API secrets and GitHub tokens are encrypted with AES-256 before storage. They are never exposed in logs or API responses.',
  },
  {
    icon: Link2,
    title: 'Cited answers from your sources',
    body: 'Every answer includes a citation showing which Notion page or which file and line in your GitHub repo the information came from.',
  },
]

const steps = [
  {
    title: 'Connect your account',
    body: 'Authorise AskBro with Notion via an API token, or connect GitHub via OAuth in one click. No copy-paste of content required.',
  },
  {
    title: 'Import pages or repositories',
    body: 'Paste a Notion page URL to import it, or select a GitHub repository from your account list. AskBro indexes the content automatically.',
  },
  {
    title: 'Ask questions across all sources',
    body: 'Chat with your Notion pages and GitHub repos alongside your uploaded documents. Get cited answers from every connected source in one conversation.',
  },
]

const faqItems = [
  {
    q: 'What integrations does AskBro support?',
    a: 'AskBro supports Notion and GitHub. Connect your Notion workspace to import pages via URL, and connect GitHub via OAuth or Personal Access Token to import and query any repository — public or private.',
  },
  {
    q: 'How do I connect Notion to AskBro?',
    a: 'Go to Integrations in your workspace, select Notion, create an integration at notion.so/my-integrations, and paste the Internal Integration Secret. Then share any Notion page with the integration and import it by URL.',
  },
  {
    q: 'How do I connect GitHub to AskBro?',
    a: 'Go to Integrations, select GitHub, then connect via OAuth (one click) or paste a Personal Access Token. Once connected, select any repository to import and AskBro will index it for Q&A.',
  },
  {
    q: 'Are my Notion and GitHub tokens stored securely?',
    a: 'Yes. All tokens are encrypted at rest using AES-256 (Fernet) before storage. They are never logged or exposed in plaintext, and each workspace has its own encryption key.',
  },
  {
    q: 'Can I import multiple Notion pages?',
    a: 'Yes. Import as many pages as you need — each one becomes a document in your workspace that can be queried on its own or alongside other documents and repos.',
  },
  {
    q: 'Can I import private GitHub repositories?',
    a: 'Yes. With OAuth or a PAT that has the correct scopes, AskBro can import private repos your account can access. Private content stays within your workspace and is never shared.',
  },
]

const stats = [
  { value: '2', label: 'Live integrations' },
  { value: '<30s', label: 'Import time' },
  { value: '256-bit', label: 'Token encryption' },
]

const related = [
  { href: '/features/document-qa',    label: 'Document Q&A' },
  { href: '/features/github-repo',    label: 'GitHub Repo Q&A' },
  { href: '/features/interview-prep', label: 'Interview Prep' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IntegrationsFeaturePage() {
  return (
    <FeaturePageShell
      icon={Plug2}
      title="Integrations"
      headline="Connect Notion & GitHub to your AI workspace"
      description="Import Notion pages and GitHub repositories directly into AskBro. Ask AI questions across every connected source — with cited answers that point to the exact page or line of code."
      benefits={benefits}
      steps={steps}
      faqItems={faqItems}
      related={related}
      faqJsonLd={faqJsonLd}
      stats={stats}
    />
  )
}
