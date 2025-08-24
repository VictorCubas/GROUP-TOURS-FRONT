import { useSessionStore } from '@/store/sessionStore';
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute';
import { NavigationWatcher } from '@/components/NavigationWatcher';

const MainLayout = lazy(() => import('@/layout/MainLayout'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const PermisosPage = lazy(() => import('@/pages/PermisosPage'));
const RolesPage = lazy(() => import('@/pages/RolesPage'));
const ModuloPage = lazy(() => import('@/pages/ModulosPage'));
const NacionalidadesPage = lazy(() => import('@/pages/NacionalidadesPage'));
const TipoDocumentosPage = lazy(() => import('@/pages/TipoDocumentosPage'));
const PersonasPage = lazy(() => import('@/pages/PersonasPage'));
const EmpleadosPage = lazy(() => import('@/pages/EmpleadosPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const AppRouter = () => {
  const {initializeSession} = useSessionStore();
  
  useEffect(() => {
    initializeSession();
  }, [initializeSession,])
  
  return (
     <BrowserRouter>
        {/* Ideal para escuchar cuando el token ha expirado */}
        <NavigationWatcher />
        <Suspense fallback={<div id="global-loader-fallback">
                              <div className="dot-loader-fallback">
                                <span></span><span></span><span></span>
                              </div>
                            </div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path='/seguridad'>
                      <Route path="permisos" element={<PermisosPage />} />
                      <Route path="roles" element={<RolesPage />} />
                      <Route path="personas" element={<PersonasPage />} />
                      <Route path="empleados" element={<EmpleadosPage />} />
                    </Route>

                    <Route path='/configuracion'>
                      <Route path="modulos" element={<ModuloPage />} />
                      <Route path="tipo_documentos" element={<TipoDocumentosPage />} />
                      <Route path="nacionalidades" element={<NacionalidadesPage />} />
                    </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
      </BrowserRouter>
  )
}

export default AppRouter