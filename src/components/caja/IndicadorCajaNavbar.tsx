/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { verificarUsuarioTieneCajaAbierta } from '@/components/utils/httpCajas';

export const IndicadorCajaNavbar = () => {
  const [estadoCaja, setEstadoCaja] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Función para verificar el estado de la caja
  const verificarEstado = async () => {
    try {
      const data = await verificarUsuarioTieneCajaAbierta();
      setEstadoCaja(data);
    } catch (error) {
      console.error('Error verificando estado de caja:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar al montar el componente
  useEffect(() => {
    verificarEstado();
  }, []);

  // Polling: actualizar cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstado();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Función para navegar según el estado
  const handleClick = () => {
    // if (estadoCaja?.tiene_caja_abierta) {
    //   // Si tiene caja abierta, ir a movimientos de caja
    //   navigate('/arqueo/cajas');
    // } else {
      // Si no tiene caja abierta, ir a abrir caja
      navigate('/arqueo/cajas');
    // }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!estadoCaja) return null;

  if (estadoCaja.tiene_caja_abierta) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="gap-2 hover:bg-green-50 cursor-pointer"
      >
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium hidden lg:inline">
          {estadoCaja.caja_nombre}
        </span>
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          Gs. {Number(estadoCaja.saldo_actual || 0).toLocaleString('es-PY')}
        </Badge>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="gap-2 hover:bg-amber-50 cursor-pointer"
    >
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <span className="text-sm font-medium text-amber-700">
        Sin caja abierta
      </span>
    </Button>
  );
};
