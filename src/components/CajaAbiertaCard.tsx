/* eslint-disable @typescript-eslint/no-explicit-any */
import { Clock, DollarSign, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { formatearSeparadorMiles } from "@/helper/formatter";

interface CajaAbiertaCardProps {
  dataCajaAbierta: any;
  isVerificandoCajaAbierta: boolean;
  onCerrarCaja?: () => void;
}

const CajaAbiertaCard: React.FC<CajaAbiertaCardProps> = ({
  dataCajaAbierta,
  isVerificandoCajaAbierta,
  onCerrarCaja
}) => {
  // No mostrar nada si no hay caja abierta
  if (!isVerificandoCajaAbierta && !dataCajaAbierta?.tiene_caja_abierta) {
    return null;
  }

  // Función para formatear la fecha y hora
  const formatearFechaHora = (fechaISO: string) => {
    if (!fechaISO) return { fecha: '-', hora: '-' };

    const fecha = new Date(fechaISO);
    const fechaFormateada = fecha.toLocaleDateString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const horaFormateada = fecha.toLocaleTimeString('es-PY', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return { fecha: fechaFormateada, hora: horaFormateada };
  };

  const { fecha, hora } = dataCajaAbierta?.fecha_hora_apertura
    ? formatearFechaHora(dataCajaAbierta.fecha_hora_apertura)
    : { fecha: '-', hora: '-' };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            Caja Abierta
          </CardTitle>
          <Badge className="bg-green-500 hover:bg-green-600 text-white animate-pulse">
            ACTIVA
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isVerificandoCajaAbierta ? (
          // Estado de carga
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Información de la caja */}
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Caja</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {dataCajaAbierta?.caja_nombre || '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Código Apertura</p>
                  <Badge variant="outline" className="font-mono text-sm">
                    {dataCajaAbierta?.codigo_apertura || '-'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Montos */}
            <div className="grid grid-cols-2 gap-4">
              {/* Monto en Guaraníes */}
              <div className="bg-white rounded-lg p-4 border border-green-100 hover:border-green-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 mb-1">Monto Inicial (Gs.)</p>
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {dataCajaAbierta?.monto_inicial
                        ? formatearSeparadorMiles.format(Number(dataCajaAbierta.monto_inicial))
                        : '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Monto en USD */}
              <div className="bg-white rounded-lg p-4 border border-green-100 hover:border-green-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 mb-1">Monto Inicial (USD)</p>
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {dataCajaAbierta?.monto_inicial_alternativo
                        ? Number(dataCajaAbierta.monto_inicial_alternativo).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fecha y Hora de apertura */}
            <div className="grid grid-cols-2 gap-4">
              {/* Fecha */}
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600">Fecha Apertura</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{fecha}</p>
                  </div>
                </div>
              </div>

              {/* Hora */}
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600">Hora Apertura</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{hora}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de cerrar caja */}
            {onCerrarCaja && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <Button
                  onClick={onCerrarCaja}
                  className="w-full bg-red-500 hover:bg-red-600 cursor-pointer text-white font-semibold"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Cerrar Caja
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CajaAbiertaCard;
