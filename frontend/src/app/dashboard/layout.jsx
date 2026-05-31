import DashboardShell from './DashboardShell'

export const metadata = {
  title: 'Chat',
  description:
    'Ask questions about your team\'s uploaded documents and get instant AI-powered answers with exact source citations.',
  keywords: ['document chat', 'AI Q&A', 'knowledge base chat', 'document search', 'cited answers'],
  robots: { index: false, follow: false }, // authenticated — no indexing needed
}

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>
}
