import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionStore } from "@/store/sessionStore";

const PermissionRoute = () => {
  const { session, loading, siTienePermiso, hasRole } = useSessionStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-28 h-28">
          <svg
            fill="hsl(228, 97%, 42%)"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="4" cy="12" r="3">
              <animate
                attributeName="cy"
                values="12;6;12"
                dur="0.6s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="12" cy="12" r="3">
              <animate
                attributeName="cy"
                values="12;6;12"
                dur="0.6s"
                begin="0.1s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="20" cy="12" r="3">
              <animate
                attributeName="cy"
                values="12;6;12"
                dur="0.6s"
                begin="0.2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      </div>
    );
  }


  console.log('session es admin: ', session?.esAdmin)

  // Si no hay sesión → al login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Página principal siempre es accesible
  if (location.pathname === "/") {
    return <Outlet />;
  }

  // 🔥 CASO ESPECIAL: Usuarios con rol Gerencial
  const esGerencial = hasRole('Gerencial');
  
  if (esGerencial) {
    // Si es Gerencial, solo puede acceder a /reportes
    if (location.pathname.startsWith('/reportes')) {
      return <Outlet />;
    }
    // Cualquier otra ruta → redirigir a home
    return <Navigate to="/" replace />;
  }

  // 🔥 Para usuarios NO gerenciales: Reportes están bloqueados
  if (location.pathname.startsWith('/reportes')) {
    return <Navigate to="/" replace />;
  }

  // Para el resto de rutas (usuarios NO gerenciales), usar el sistema de permisos normal
  const pathParts = location.pathname.split("/").filter(Boolean);
  const lastSegment = pathParts[pathParts.length - 1]?.toLowerCase();

  // Verificar si el módulo existe y tiene permiso de lectura
  const hasPermission = siTienePermiso(lastSegment, "leer");

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PermissionRoute;
