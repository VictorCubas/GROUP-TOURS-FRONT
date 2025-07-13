import CustomHeader from '@/components/CustomHeader'
import NavBar from '@/components/NavBar'
import PromocionesBar from '@/components/PromocionesBar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <>
      <PromocionesBar />
      <CustomHeader />

      <div className='px-20'>
        <NavBar />
        <main className="px-4 py-6">
            <Outlet />
        </main>
      </div>
    </>
  )
}

export default MainLayout