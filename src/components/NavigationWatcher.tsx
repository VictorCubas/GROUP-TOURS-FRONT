// src/components/NavigationWatcher.tsx
import { useEffect } from 'react'
import { useNavigationStore } from '@/store/navigationStore'
import { useNavigate } from 'react-router-dom'

export const NavigationWatcher = () => {
  const navigate = useNavigate()
  const { redirectTo, clearRedirect } = useNavigationStore()

  useEffect(() => {
    if (redirectTo) {
      navigate(redirectTo, { replace: true })
      clearRedirect()
    }
  }, [redirectTo, navigate, clearRedirect])

  return null
}
