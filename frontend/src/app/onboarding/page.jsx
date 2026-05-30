'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/useAuthStore'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export default function OnboardingPage() {
  const router = useRouter()
  const hydrate = useAuthStore((s) => s.hydrate)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (user === null) router.replace('/login')
  }, [user, router])

  if (!user) return null
  return <OnboardingFlow />
}
