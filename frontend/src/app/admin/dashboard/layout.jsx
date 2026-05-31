import AdminDashboardShell from './AdminDashboardShell'

export const metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s — Admin | AskBro',
  },
  description:
    'AskBro admin dashboard — monitor users, workspaces, documents, and platform activity across the entire platform.',
  robots: { index: false, follow: false },
}

export default function AdminDashboardLayout({ children }) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>
}
