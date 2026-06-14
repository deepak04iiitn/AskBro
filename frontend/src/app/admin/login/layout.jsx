import PublicLayout from '@/components/seo/PublicLayout'

export const metadata = {
  title: 'Admin Login',
  description:
    'Secure admin access to the AskBro platform dashboard. Authenticate with email, password and a one-time OTP.',
  robots: { index: false, follow: false },
}

export default function AdminLoginLayout({ children }) {
  return <PublicLayout>{children}</PublicLayout>
}
