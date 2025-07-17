/* eslint-disable @typescript-eslint/no-unused-vars */

import { Bell, Menu, User } from "lucide-react";
import MobileSidebar from "./MobileSidebar";
import { Button } from "./ui/button";
import { Separator } from "@/components/ui/separator"

interface NavBarProps{
  onToggle: () => void
}

const NavBar: React.FC<NavBarProps> = ({onToggle}) => {
  return <>
       {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger */}
              <MobileSidebar />

              {/* Desktop Hamburger */}
              <Button variant="ghost" size="icon" onClick={onToggle} className="hidden lg:flex hover:bg-gray-100 cursor-pointer">
                <Menu className="h-5 w-5" />
              </Button>

              <div className="lg:hidden">
                <h1 className="text-xl font-semibold text-gray-900">GROUP TOURS</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></div>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3 bg-blue-50 rounded-full px-4 py-2 border border-blue-200">
                <span className="text-sm text-blue-700 font-medium">Bienvenido</span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>
  </>
};

export default NavBar;
