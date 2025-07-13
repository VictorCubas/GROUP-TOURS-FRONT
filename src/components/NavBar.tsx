/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleNavigate = (url: string) => {
    navigate(url);
  }

  return (
    <NavigationMenu>
      {/* Usamos group para mantener hover entre trigger y dropdown */}
      <div
        className="relative flex items-start group"
        onMouseLeave={() => setActiveItem(null)}
      >
        {/* Menú lateral */}
        <NavigationMenuList className="flex flex-col items-start gap-2 z-10 bg-white pt-1">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="ponter hover:bg-amber-400" onClick={() => handleNavigate('/fotografia')} onMouseEnter={() => setActiveItem("item1")}>
              Fotografía & filmación
            </NavigationMenuTrigger>
          </NavigationMenuItem>


          <NavigationMenuItem>
            <NavigationMenuTrigger className="ponter" onClick={() => handleNavigate('/electronica')} onMouseEnter={() => setActiveItem("item2")}>
              Electrónica
            </NavigationMenuTrigger>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="ponter" onMouseEnter={() => setActiveItem("item3")}>
              Informática
            </NavigationMenuTrigger>
          </NavigationMenuItem>

          {/* <NavigationMenuItem>
            <NavigationMenuTrigger className="ponter" onMouseEnter={() => setActiveItem("item4")}>
              Videojuegos & juguetes
            </NavigationMenuTrigger>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="ponter" onMouseEnter={() => setActiveItem("item5")}>
              Belleza, salud & cosméticos
            </NavigationMenuTrigger>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="ponter" onMouseEnter={() => setActiveItem("item6")}>
              Electrodomésticos
            </NavigationMenuTrigger>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="ponter" onMouseEnter={() => setActiveItem("item7")}>
              Muebles
            </NavigationMenuTrigger>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="ponter" onMouseEnter={() => setActiveItem("item8")}>
              Deportes & Fitness
            </NavigationMenuTrigger>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="ponter" onMouseEnter={() => setActiveItem("item9")}>
              Accesorio para auto & moto
            </NavigationMenuTrigger>
          </NavigationMenuItem> */}
        </NavigationMenuList>

        {/* Dropdown pegado al menú (sin espacio) */}
        {activeItem && (
          <div
            className="absolute top-0 left-full w-fit p-4 border rounded-md shadow-lg z-0 bg-white"
          >
            {activeItem === "item1" && (
              <div className="flex gap-2 w-10/12 ">
                <div className="w-full">
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Cámaras</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild className="hover:text-amber-400 hover:font-medium">
                    <Link to="/camaras">Compactas</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Especial Zoom</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Reflex/Mirrorless</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Drones</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="whitespace-nowrap hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Drones & cuadricópteros</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Accesorios</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Accesorios</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Baterias & Cargadores</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Flash</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Lentes</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Memoria</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Mochilas & Estuche</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Tripode & Monopies</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Otros accesorios</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">LED</Link>
                  </NavigationMenuLink>
                </div>
                
                <div>
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Filmadoras</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Compactas</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="whitespace-nowrap hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Deportes y Acción</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Profesionales</Link>
                  </NavigationMenuLink>
                </div>
              </div>
            )}

            {activeItem === "item2" && (
              <div className="flex gap-2 w-10/12 ">
                <div className="w-full">
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Cámaras</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild className="hover:text-amber-400 hover:font-medium">
                    <Link to="/camaras">Compactas</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Especial Zoom</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Reflex/Mirrorless</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Drones</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="whitespace-nowrap hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Drones & cuadricópteros</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Accesorios</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Accesorios</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Baterias & Cargadores</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Flash</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Lentes</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Memoria</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Mochilas & Estuche</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Tripode & Monopies</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Otros accesorios</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">LED</Link>
                  </NavigationMenuLink>
                </div>
                
                <div>
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Filmadoras</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Compactas</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="whitespace-nowrap hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Deportes y Acción</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Profesionales</Link>
                  </NavigationMenuLink>
                </div>
              </div>
            )}

            {activeItem === "item3" && (
              <div className="flex gap-2 w-10/12 ">
                <div className="w-full">
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Cámaras</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild className="hover:text-amber-400 hover:font-medium">
                    <Link to="/camaras">Compactas</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Especial Zoom</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Reflex/Mirrorless</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Drones</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="whitespace-nowrap hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Drones & cuadricópteros</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Accesorios</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Accesorios</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Baterias & Cargadores</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Flash</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Lentes</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Memoria</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Mochilas & Estuche</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Tripode & Monopies</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Otros accesorios</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">LED</Link>
                  </NavigationMenuLink>
                </div>
                
                <div>
                  <NavigationMenuLink className="font-semibold hover:text-amber-400" asChild>
                    <Link to="/camaras">Filmadoras</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Compactas</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="whitespace-nowrap hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Deportes y Acción</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="hover:text-amber-400 hover:font-medium" asChild>
                    <Link to="/camaras">Profesionales</Link>
                  </NavigationMenuLink>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </NavigationMenu>
  );
};

export default NavBar;
