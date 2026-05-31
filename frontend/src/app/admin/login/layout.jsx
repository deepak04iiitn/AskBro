export const metadata = {
  title: 'Admin Login',
  description:
    'Secure admin access to the AskBro platform dashboard. Authenticate with email, password and a one-time OTP.',
  robots: { index: false, follow: false }, // never index admin pages
}

export default function AdminLoginLayout({ children }) {
  return children
}
