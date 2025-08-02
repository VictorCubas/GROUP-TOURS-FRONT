import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import SideBar from './SideBar';


const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SideBar isCollapsed={false} onToggle={() => {}} />
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar