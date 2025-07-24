import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const MainLayout = lazy(() => import('@/layout/MainLayout'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const HomePage = lazy(() => import('@/pages/Home'));
const PermisosPage = lazy(() => import('@/pages/PermisosPage'));
const RolesPage = lazy(() => import('@/pages/RolesPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const AppRouter = () => {
  return (
     <BrowserRouter>
        <Suspense fallback={<div id="global-loader-fallback">
                              <div className="dot-loader-fallback">
                                <span></span><span></span><span></span>
                              </div>
                            </div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/permisos" element={<PermisosPage />} />
                  <Route path="/roles" element={<RolesPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
      </BrowserRouter>
  )
}

export default AppRouter