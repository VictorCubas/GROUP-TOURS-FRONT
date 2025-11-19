/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, use } from "react";
import { X, AlertTriangle, Loader2, CheckCircle2, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { formatearSeparadorMiles } from "@/helper/formatter";
import { NumericFormat } from "react-number-format";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchResumenApertura, cerrarCajaSimple } from "@/components/utils/httpAperturasCajas";
import { ToastContext } from "@/context/ToastContext";
import { queryClient } from "@/components/utils/http";

interface CerrarCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  aperturaId: number;
  cajaNombre: string;
  codigoApertura: string;
}

const CerrarCajaModal: React.FC<CerrarCajaModalProps> = ({
  isOpen,
  onClose,
  aperturaId,
  cajaNombre,
  codigoApertura,
}) => {
  const { handleShowToast } = use(ToastContext);
  const [montoRealEfectivo, setMontoRealEfectivo] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultadoCierre, setResultadoCierre] = useState<any>(null);

  // Query para obtener el resumen de la apertura
  const { data: resumen, isLoading: cargandoResumen } = useQuery({
    queryKey: ['resumen-apertura', aperturaId],
    queryFn: () => fetchResumenApertura(aperturaId),
    enabled: isOpen && !!aperturaId,
    staleTime: 0, // Siempre obtener datos frescos
  });

  console.log(cajaNombre);
  console.log(codigoApertura);

  // Mutation para cerrar la caja
  const { mutate: cerrarCaja, isPending: procesandoCierre } = useMutation({
    mutationFn: cerrarCajaSimple,
    onSuccess: (data) => {
      console.log('Respuesta del cierre:', data);
      setResultadoCierre(data);
      setMostrarResultado(true);

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
      queryClient.invalidateQueries({ queryKey: ['cajas-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['usuario-tiene-caja-abierta'] });
      queryClient.invalidateQueries({
        queryKey: ['movimientos'],
        exact: false
      });

      // Mostrar toast de éxito
      if (data?.requiere_autorizacion) {
        handleShowToast(
          `Cierre registrado con código ${data.codigo_cierre}. Requiere autorización de supervisor.`,
          'warning'
        );
      } else {
        handleShowToast(
          `¡Cierre completado exitosamente! Código: ${data.codigo_cierre}`,
          'success'
        );
      }
    },
    onError: (error: any) => {
      console.error('Error al cerrar caja:', error);
      handleShowToast(
        error?.response?.data?.detail || 'Error al procesar el cierre de caja',
        'error'
      );
    }
  });

  // Calcular diferencia en tiempo real
  const saldoEsperado = resumen?.totales?.saldo_esperado_efectivo || 0;
  const diferencia = montoRealEfectivo !== null ? montoRealEfectivo - saldoEsperado : 0;
  const diferenciaPorcentaje = saldoEsperado > 0
    ? ((diferencia / saldoEsperado) * 100).toFixed(2)
    : '0.00';
  const diferenciaSuperaLimite = Math.abs(parseFloat(diferenciaPorcentaje)) > 2;

  // Resetear estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setMontoRealEfectivo(null);
      setObservaciones("");
      setMostrarResultado(false);
      setResultadoCierre(null);
    }
  }, [isOpen]);

  // Manejar cierre con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !procesandoCierre) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, procesandoCierre]);

  // Formatear fecha y hora para mostrar
  const formatearFechaHora = (fechaISO: string) => {
    if (!fechaISO) return '-';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular duración de la sesión
  const calcularDuracion = () => {
    if (!resumen?.apertura?.fecha_hora_apertura) return '-';
    const apertura = new Date(resumen.apertura.fecha_hora_apertura);
    const ahora = new Date();
    const diferenciaMilisegundos = ahora.getTime() - apertura.getTime();
    const horas = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60));
    const minutos = Math.floor((diferenciaMilisegundos % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}min`;
  };

  const handleCerrarCaja = () => {
    if (montoRealEfectivo === null) {
      handleShowToast('Debes ingresar el monto real contado', 'error');
      return;
    }

    const payload = {
      apertura_caja: aperturaId,
      saldo_real_efectivo: montoRealEfectivo.toFixed(2),
      observaciones: observaciones.trim() || undefined
    };

    console.log('Payload cierre:', payload);
    cerrarCaja(payload);
  };

  const handleCerrarModal = () => {
    onClose();
  };

  if (!isOpen) return null;

  // ESTADO 6: Pantalla de resultado
  if (mostrarResultado && resultadoCierre) {
    const requiereAutorizacion = resultadoCierre.requiere_autorizacion;

    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white/95 rounded-xl shadow-xl max-w-lg w-full backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            {/* Ícono y título */}
            <div className="text-center mb-6">
              <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                requiereAutorizacion ? 'bg-amber-100' : 'bg-green-100'
              }`}>
                {requiereAutorizacion ? (
                  <AlertTriangle className="h-10 w-10 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {requiereAutorizacion ? '¡CIERRE REGISTRADO - REQUIERE AUTORIZACIÓN!' : '¡CIERRE COMPLETADO!'}
              </h2>
              <p className="text-gray-600">
                {requiereAutorizacion
                  ? 'El cierre fue registrado pero presenta una diferencia superior al límite permitido (±2%).'
                  : 'El cierre de caja se realizó exitosamente'}
              </p>
            </div>

            {/* Información del cierre */}
            <div className="space-y-3 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Código de Cierre</p>
                <p className="text-xl font-bold text-gray-900">{resultadoCierre.codigo_cierre}</p>
              </div>

              <div className={`rounded-lg p-4 text-center ${
                diferenciaSuperaLimite ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <p className="text-sm text-gray-600 mb-1">Diferencia</p>
                <p className={`text-lg font-bold ${
                  diferenciaSuperaLimite ? 'text-red-600' : 'text-green-600'
                }`}>
                  Gs {formatearSeparadorMiles.format(Number(resultadoCierre.diferencia || 0))} ({resultadoCierre.diferencia_porcentaje}%)
                </p>
              </div>
            </div>

            {requiereAutorizacion && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800 text-center">
                  Un supervisor debe autorizar este cierre para finalizarlo.
                  Puede hacerlo desde el panel de "Cierres Pendientes de Autorización".
                </p>
              </div>
            )}

            {/* Botón */}
            <Button
              onClick={handleCerrarModal}
              className="w-full bg-blue-500 hover:bg-blue-600 cursor-pointer"
            >
              {requiereAutorizacion ? 'Entendido' : 'Aceptar'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={handleCerrarModal}
    >
      <div
        className="bg-white/95 rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="mb-6 border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Cerrar Caja</h2>
                    <p className="text-gray-600">Verifica el efectivo y cierra la sesión</p>
                  </div>
                </div>
                <button
                  onClick={handleCerrarModal}
                  disabled={procesandoCierre}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* ESTADO 1: Cargando */}
            {cargandoResumen && (
              <div className="py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Cargando datos...</p>
              </div>
            )}

            {/* ESTADO 2-4: Formulario principal */}
            {!cargandoResumen && resumen && !procesandoCierre && (
              <div className="space-y-6">
                {/* Resumen de la Sesión */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Resumen de la Sesión</h3>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Apertura</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatearFechaHora(resumen?.apertura?.fecha_hora_apertura)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Monto Inicial</p>
                      <p className="text-sm font-semibold text-gray-900">
                        Gs {formatearSeparadorMiles.format(Number(resumen?.totales?.monto_inicial || 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Duración</p>
                      <p className="text-sm font-semibold text-gray-900">{calcularDuracion()}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <p className="text-xs text-gray-600">Movimientos</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {resumen?.totales?.cantidad_movimientos || 0}
                    </p>
                  </div>
                </div>

                {/* Tarjetas de Totales */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-medium text-green-900">Ingresos</p>
                    </div>
                    <p className="text-lg font-bold text-green-700">
                      Gs {formatearSeparadorMiles.format(Number(resumen?.totales?.total_ingresos || 0))}
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <p className="text-sm font-medium text-red-900">Egresos</p>
                    </div>
                    <p className="text-lg font-bold text-red-700">
                      Gs {formatearSeparadorMiles.format(Number(resumen?.totales?.total_egresos || 0))}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">Digital</p>
                    </div>
                    <p className="text-lg font-bold text-blue-700">Gs 0</p>
                  </div>
                </div>

                {/* Saldo Esperado */}
                <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-300">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-900">Saldo Esperado en Efectivo</h3>
                  </div>
                  <p className="text-2xl font-bold text-amber-700 mb-2">
                    Gs {formatearSeparadorMiles.format(Number(saldoEsperado))}
                  </p>
                  <p className="text-sm text-amber-700">
                    Cuenta el efectivo físico y registra el monto real encontrado
                  </p>
                </div>

                {/* Input de Monto Real */}
                <div className="space-y-2">
                  <Label htmlFor="monto_real" className="text-gray-700 font-medium">
                    Monto Real Contado (Efectivo) *
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium">Gs</span>
                    <NumericFormat
                      value={montoRealEfectivo ?? ''}
                      onValueChange={(values) => {
                        const val = values.floatValue ?? null;
                        setMontoRealEfectivo(val);
                      }}
                      thousandSeparator="."
                      decimalSeparator=","
                      allowNegative={false}
                      decimalScale={0}
                      allowLeadingZeros={false}
                      placeholder="Ingrese el monto contado"
                      className="flex-1 p-3 pl-3 rounded-md border-2 border-gray-300 focus:border-blue-500 focus:ring-0 outline-none"
                    />
                  </div>
                </div>

                {/* Mostrar diferencia si hay monto ingresado */}
                {montoRealEfectivo !== null && (
                  <div className={`rounded-lg p-4 border-2 ${
                    diferenciaSuperaLimite
                      ? 'bg-red-50 border-red-300'
                      : 'bg-green-50 border-green-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {diferenciaSuperaLimite ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      <p className={`font-semibold ${
                        diferenciaSuperaLimite ? 'text-red-700' : 'text-green-700'
                      }`}>
                        Diferencia: Gs {formatearSeparadorMiles.format(Number(diferencia))} ({diferenciaPorcentaje}%)
                        {diferencia === 0 && ' - ¡Perfecto!'}
                      </p>
                    </div>
                    {diferenciaSuperaLimite && (
                      <p className="text-sm text-red-600 mt-2">
                        Requerirá autorización de supervisor
                      </p>
                    )}
                  </div>
                )}

                {/* Notas de Cierre */}
                <div className="space-y-2">
                  <Label htmlFor="observaciones" className="text-gray-700 font-medium">
                    Notas de Cierre
                  </Label>
                  <Textarea
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Observaciones finales del día (opcional)..."
                    className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCerrarModal}
                    disabled={procesandoCierre}
                    className="flex-1 cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCerrarCaja}
                    disabled={montoRealEfectivo === null || procesandoCierre}
                    className="flex-1 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cerrar Caja
                  </Button>
                </div>
              </div>
            )}

            {/* ESTADO 5: Procesando cierre */}
            {procesandoCierre && (
              <div className="py-12">
                <div className="bg-blue-50 rounded-lg p-8 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-4">Procesando cierre...</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Creando registro de cierre</p>
                    <p>• Calculando totales</p>
                    <p>• Registrando arqueo</p>
                    <p>• Validando diferencias</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="flex-1 cursor-not-allowed opacity-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled
                    className="flex-1 cursor-not-allowed opacity-50"
                  >
                    Procesando...
                  </Button>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default CerrarCajaModal;
