/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Shield,
  FileText,
  Settings,
  LogOut,
  Plane,
} from "lucide-react";
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useSessionStore } from '@/store/sessionStore';

const sidebarItems = [
  { icon: Plane, label: "Paquetes de viajes", href: "#", color: "text-purple-400" ,
    submenu: [
      { label: "Paquetes", href: "/paquetes_viajes/paquetes", color: "text-emerald-400", bgcolor: "bg-emerald-400" },
      { label: "Pasajeros", href: "/paquetes_viajes/pasajeros", color: "text-orange-400", bgcolor: "bg-orange-400" },
      // { label: "Pasajeros", href: "/paquetes_viajes/pasajeros", color: "text-pink-400", bgcolor: "bg-pink-400" },
    ],
  },
  {
    icon: Shield,
    label: "Seguridad",
    href: "#",
    color: "text-blue-400",
    submenu: [
      { label: "Usuarios", href: "/seguridad/usuarios", color: "text-emerald-400", bgcolor: "bg-emerald-400" },
      { label: "Empleados", href: "/seguridad/empleados", color: "text-orange-400", bgcolor: "bg-orange-400" },
      { label: "Personas", href: "/seguridad/personas", color: "text-pink-400", bgcolor: "bg-pink-400" },
      { label: "Roles", href: "/seguridad/roles", color: "text-yellow-400", bgcolor: "bg-yellow-400" },
      { label: "Permisos", href: "/seguridad/permisos", color: "text-blue-400", bgcolor: "bg-blue-400" },
    ],
  },
  { icon: FileText, label: "Ventas", href: "#", color: "text-amber-400" },
  // { icon: Settings, label: "Proveedores", href: "#", color: "text-indigo-400" },
  { icon: Settings, label: "Configuración", href: "#", color: "text-indigo-400" ,
      submenu: [
      { label: "Facturacion", href: "/configuracion/facturacion", color: "text-emerald-400", bgcolor: "bg-emerald-400" },
      { label: "Modulos", href: "/configuracion/modulos", color: "text-orange-400", bgcolor: "bg-orange-400" },
      { label: "Tipo Documentos", href: "/configuracion/tipo_documentos", color: "text-pink-400", bgcolor: "bg-pink-400" },
      { label: "Nacionalidades", href: "/configuracion/nacionalidades", color: "text-yellow-400", bgcolor: "bg-yellow-400" },
      { label: "Tipo Paquetes", href: "/configuracion/tipo_paquetes", color: "text-blue-400", bgcolor: "bg-blue-400" },
      { label: "Destino", href: "/configuracion/destino", color: "text-emerald-400", bgcolor: "bg-emerald-400" },
      // { label: "Personas", href: "/personas", color: "text-pink-400", bgcolor: "bg-pink-400" },
      // { label: "Roles", href: "/seguridad/roles", color: "text-yellow-400", bgcolor: "bg-yellow-400" },
      // { label: "Permisos", href: "/seguridad/permisos", color: "text-blue-400", bgcolor: "bg-blue-400" },
    ],
  },
  { icon: FileText, label: "Documentos", href: "#", color: "text-teal-400" },
]

interface SiderBarProps{
    isCollapsed: boolean; 
    onToggle: () => void
}


const SideBar: React.FC<SiderBarProps> = ({isCollapsed}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const {logout, siTienePermiso} = useSessionStore();
  const navigate = useNavigate()

  const toggleExpanded = (label: string) => {
    if (isCollapsed) return // No expandir si está colapsado
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const cssDefault = 'flex items-center gap-3 p-2 rounded-lg transition-colors';

  return (
    <TooltipProvider>
      <div
        className={`${
          isCollapsed ? "w-16" : "w-64"
        } bg-slate-900 text-white h-screen flex flex-col transition-all duration-300 ease-in-out`}
      >
        <div className={`p-6 border-b border-slate-700 ${isCollapsed ? "px-4" : ""}`}>
          {!isCollapsed ? (
            <>
              <Link to='/' className="text-xl font-bold">GROUP TOURS</Link>
              <div className="w-8 h-1 bg-blue-400 rounded-full mt-2"></div>
            </>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>

        <nav className={`flex-1 p-4 space-y-2 overflow-y-auto scrollable ${isCollapsed ? "px-2" : ""}`}>
          {sidebarItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <Collapsible
                  open={!isCollapsed && expandedItems.includes(item.label)}
                  onOpenChange={() => toggleExpanded(item.label)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger
                        className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-slate-800 transition-colors group ${
                          isCollapsed ? "justify-center" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                          {!isCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isCollapsed &&
                          (expandedItems.includes(item.label) ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          ))}
                      </CollapsibleTrigger>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                  </Tooltip>
                  {!isCollapsed && (
                    <CollapsibleContent className="ml-8 mt-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <>
                          {siTienePermiso(subItem.label.toLowerCase(), 'leer') &&     
                          <Tooltip key={subItem.label}> 
                            <TooltipTrigger asChild>
                              <span>
                                <NavLink
                                  to={subItem.href}
                                className={({isActive}) => isActive ? `${cssDefault}  bg-blue-600/20 text-blue-300 border-l-2 border-blue-400`
                                : `${cssDefault} hover:bg-slate-800` } 
                                >
                                  <div className={`w-2 h-2 rounded-full ${subItem.bgcolor}`}></div> 
                                  <span className="text-sm">{subItem.label}</span>
                                </NavLink>
                              </span>
                            </TooltipTrigger>
                          </Tooltip>
                          }
                        </>
                      ))}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={item.href}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group ${
                        isCollapsed ? "justify-center" : ""
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </a>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              )}
            </div>
          ))}
        </nav>

        <div className={`p-4 border-t border-slate-700 ${isCollapsed ? "px-2" : ""}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleLogout}
                className={`cursor-pointer flex items-center justify-start gap-3 p-6 rounded-lg hover:bg-red-900/20 transition-colors w-full group ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <LogOut className="h-5 w-5 text-red-400" />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default SideBar;