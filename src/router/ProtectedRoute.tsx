import { useSessionStore } from '@/store/sessionStore'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
  const { session, loading } = useSessionStore();

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-28 h-28">
          {/* Spinner o loader personalizado */}
          <svg fill="hsl(228, 97%, 42%)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4" cy="12" r="3">
              <animate attributeName="cy" values="12;6;12" dur="0.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="12" cy="12" r="3">
              <animate attributeName="cy" values="12;6;12" dur="0.6s" begin="0.1s" repeatCount="indefinite" />
            </circle>
            <circle cx="20" cy="12" r="3">
              <animate attributeName="cy" values="12;6;12" dur="0.6s" begin="0.2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </div>
    )
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute