import { useSessionStore } from '@/store/sessionStore';
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute';
import { NavigationWatcher } from '@/components/NavigationWatcher';
import PermissionRoute from './PermissionRoute';

const MainLayout = lazy(() => import('@/layout/MainLayout'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const PermisosPage = lazy(() => import('@/pages/PermisosPage'));
const RolesPage = lazy(() => import('@/pages/RolesPage'));
const CajasPage = lazy(() => import('@/pages/CajasPage'));
const MovimientoCajasPage = lazy(() => import('@/pages/MovimientoCajasPage'));
const AperturaCajasPage = lazy(() => import('@/pages/AperturaCajasPage'));
const FacturacionPage = lazy(() => import('@/pages/FacturacionPage'));
const ModuloPage = lazy(() => import('@/pages/ModulosPage'));
const NacionalidadesPage = lazy(() => import('@/pages/NacionalidadesPage'));
const DestinoPage = lazy(() => import('@/pages/DestinoPage'));
const PaquetesPage = lazy(() => import('@/pages/PaquetesPage'));
const ReservaPage = lazy(() => import('@/pages/ReservaPage'));
const HotelPage = lazy(() => import('@/pages/HotelPage'));
const TipoDocumentosPage = lazy(() => import('@/pages/TipoDocumentosPage'));
const TipoPaquetesPage = lazy(() => import('@/pages/TipoPaquetesPage'));
const PersonasPage = lazy(() => import('@/pages/PersonasPage'));
const EmpleadosPage = lazy(() => import('@/pages/EmpleadosPage'));
const FacturacionConfig = lazy(() => import('@/pages/FactuacionConfigPage'));
const UsuariosPage = lazy(() => import('@/pages/UsuariosPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const AppRouter = () => {
  const { initializeSession } = useSessionStore();
  
  useEffect(() => {
    console.log('inicializando session...')
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
                  <Route element={<PermissionRoute />}>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<HomePage />} />

                      <Route path="/paquetes_viajes">
                        <Route path="destinos" element={<DestinoPage />} />
                        <Route path="reservas" element={<ReservaPage />} />
                        <Route path="paquetes" element={<PaquetesPage />} />
                        <Route path="hoteles" element={<HotelPage />} />
                      </Route>

                      <Route path="/arqueo">
                        <Route path="cajas" element={<CajasPage />} />
                        <Route path="aperturas" element={<AperturaCajasPage />} />
                        <Route path="cierres" element={<PersonasPage />} />
                        <Route path="movimientos" element={<MovimientoCajasPage />} />
                        {/* <Route path="usuarios" element={<UsuariosPage />} /> */}
                      </Route>

                      <Route path="/seguridad">
                        <Route path="permisos" element={<PermisosPage />} />
                        <Route path="roles" element={<RolesPage />} />
                        <Route path="personas" element={<PersonasPage />} />
                        <Route path="empleados" element={<EmpleadosPage />} />
                        <Route path="usuarios" element={<UsuariosPage />} />
                      </Route>

                      <Route path="/configuracion">
                        <Route path="facturacion" element={<FacturacionConfig />} />
                        <Route path="modulos" element={<ModuloPage />} />
                        <Route path="tipo_documentos" element={<TipoDocumentosPage />} />
                        <Route path="nacionalidades" element={<NacionalidadesPage />} />
                        <Route path="tipo_paquetes" element={<TipoPaquetesPage />} />
                      </Route>

                      <Route path="/facturacion">
                        <Route path="facturas" element={<FacturacionPage />} />
                        {/* <Route path="modulos" element={<ModuloPage />} />
                        <Route path="tipo_documentos" element={<TipoDocumentosPage />} />
                        <Route path="nacionalidades" element={<NacionalidadesPage />} />
                        <Route path="tipo_paquetes" element={<TipoPaquetesPage />} /> */}
                      </Route>
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