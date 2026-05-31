import LoginForm from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Sign In',
  description:
    'Sign in to your AskBro workspace using your workspace code and email address. Access your team\'s AI-powered knowledge base instantly.',
  keywords: [
    'sign in',
    'workspace login',
    'AskBro login',
    'team knowledge base login',
    'document AI login',
  ],
  openGraph: {
    title: 'Sign In — AskBro',
    description: 'Sign in to your AskBro workspace and start asking questions about your team\'s documents.',
  },
}

export default function LoginPage() {
  return <LoginForm />
}
