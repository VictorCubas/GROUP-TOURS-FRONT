/* eslint-disable @typescript-eslint/no-unused-vars */
// import CustomHeader from '@/components/CustomHeader'
// import NavBar from '@/components/NavBar'
import NavBar from '@/components/NavBar'
import SideBar from '@/components/SideBar'
import { Suspense, useState } from 'react';
// import PromocionesBar from '@/components/PromocionesBar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SideBar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavBar onToggle={toggleSidebar}/>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
               <Suspense fallback={
                  <div id="page-loader-fallback" className="flex justify-center items-center h-full">
                    <div className="dot-loader-fallback">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                }>
                  <Outlet />
                </Suspense>
          </main>
        </div>
      </div>
    </>
  )
}

export default MainLayout