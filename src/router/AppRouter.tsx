import Camaras from '@/pages/Camaras';
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const MainLayout = lazy(() => import('@/layout/MainLayout'));
const Home = lazy(() => import('@/pages/Home'));
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
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/camaras" element={<Camaras />} />
            </Route>

            <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
      </BrowserRouter>
  )
}

export default AppRouter