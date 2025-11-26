import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertEstadoCajaProps {
  tieneCajaAbierta: boolean;
  cajaNombre?: string;
  saldoActual?: string;
  notificacion?: string;
  mostrarBotonAbrir?: boolean;
}

export const AlertEstadoCaja = ({
  tieneCajaAbierta,
  cajaNombre,
  saldoActual,
  notificacion,
  mostrarBotonAbrir = true
}: AlertEstadoCajaProps) => {
  const navigate = useNavigate();

  if (tieneCajaAbierta && cajaNombre) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Caja Abierta - {cajaNombre}</AlertTitle>
        <AlertDescription className="text-blue-700">
          {saldoActual && (
            <span className="font-semibold">
              Saldo actual: Gs. {Number(saldoActual).toLocaleString('es-PY')}
            </span>
          )}
          <br />
          Los pagos se registrarán automáticamente como movimientos de caja.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">Sin Caja Abierta</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="text-amber-700">
          {notificacion || 'No tienes una caja abierta. Los pagos se registrarán sin movimiento de caja.'}
        </span>
        {mostrarBotonAbrir && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/arqueo/cajas')}
            className="ml-4 shrink-0 border-amber-300 hover:bg-amber-100"
          >
            Abrir Caja
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
