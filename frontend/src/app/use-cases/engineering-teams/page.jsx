import UseCasePageShell from '@/components/seo/UseCasePageShell'
import { Building2 } from 'lucide-react'

export const metadata = {
  title: 'AskBro for Engineering Teams — AI Team Knowledge Base',
  description: 'Engineering teams use AskBro to index runbooks, RFCs, and onboarding docs. Engineers ask questions instead of interrupting colleagues. Try free.',
  keywords: ['AI team knowledge base', 'engineering team documentation AI', 'AI runbook search', 'team onboarding AI', 'internal docs AI assistant', 'AskBro engineering teams'],
  alternates: { canonical: 'https://askbro.app/use-cases/engineering-teams' },
  openGraph: {
    title: 'AskBro for Engineering Teams — AI Team Knowledge Base',
    description: 'Index runbooks, RFCs, and onboarding docs. Engineers ask AskBro instead of interrupting their colleagues.',
    url: 'https://askbro.app/use-cases/engineering-teams',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How does AskBro help engineering teams?', acceptedAnswer: { '@type': 'Answer', text: 'Engineering teams upload runbooks, RFCs, architecture docs, and onboarding guides to AskBro. Team members ask questions in plain English instead of interrupting senior engineers or searching through Confluence pages.' } },
    { '@type': 'Question', name: 'Can multiple team members share the same workspace?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro supports shared workspaces where multiple team members can access the same indexed documents and ask their own questions.' } },
  ],
}

const painPoints = [
  { title: 'Senior engineers interrupted constantly', body: 'The same questions come up every onboarding cycle. Valuable engineering time is lost answering "where is X configured?"' },
  { title: 'Stale Confluence pages nobody reads', body: 'Documentation exists but is out-of-date, hard to search, and formatted so poorly that new hires give up and ask someone instead.' },
  { title: 'Slow onboarding for new engineers', body: 'Joining a new team means weeks of context-building before a new hire can contribute. There is no fast path to understanding the codebase.' },
]

const benefits = [
  { title: 'Ask the knowledge base instead of a person', body: '"How do I deploy to staging?" gets an instant answer from your own runbooks — no Slack interruptions needed.' },
  { title: 'Onboard engineers in days, not weeks', body: 'New hires upload the codebase and documentation, then ask AskBro to walk them through the architecture. Self-serve onboarding that scales.' },
  { title: 'Cited answers from your own docs', body: 'Every answer cites the exact document and page. Teams trust the answers because they can verify the source instantly.' },
]

const faqItems = [
  { q: 'How does AskBro help engineering teams?', a: 'Engineering teams upload runbooks, RFCs, architecture docs, and onboarding guides to AskBro. Team members ask questions in plain English instead of interrupting senior engineers or searching through Confluence pages.' },
  { q: 'Can multiple team members share the same workspace?', a: 'Yes. AskBro supports shared workspaces where multiple team members can access the same indexed documents and ask their own questions.' },
  { q: 'Is AskBro suitable for large engineering organisations?', a: 'Yes. AskBro works for teams of any size. Large organisations can create separate workspaces per team or product area, each with their own document collections.' },
]

const relatedFeatures = [
  { href: '/features/document-qa', label: 'Document Q&A' },
  { href: '/features/github-repo', label: 'GitHub Repo Q&A' },
  { href: '/use-cases/developers', label: 'For Developers' },
]

export default function EngineeringTeamsPage() {
  return (
    <UseCasePageShell
      icon={Building2}
      persona="Engineering Teams"
      tagline="Stop answering the same questions twice"
      description="Index your runbooks, RFCs, architecture docs, and onboarding guides. Your team asks AskBro instead of interrupting each other — and gets cited answers in seconds."
      painPoints={painPoints}
      benefits={benefits}
      faqItems={faqItems}
      relatedFeatures={relatedFeatures}
      faqJsonLd={faqJsonLd}
    />
  )
}
