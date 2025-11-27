/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { formatearSeparadorMiles } from '@/helper/formatter';

interface CancelarReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any) => void;
  isPending: boolean;
  reservaData: any;
  forzarCancelacion?: boolean;
}

const CancelarReservaModal: React.FC<CancelarReservaModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  reservaData,
  forzarCancelacion = false,
}) => {
  const infoCancelacion = reservaData?.info_cancelacion;

  // Bloquear scroll del modal padre cuando CancelarReservaModal está abierto
  useEffect(() => {
    const modalDetalles = document.querySelector('.modal-detalles-reserva') as HTMLElement;

    if (isOpen && modalDetalles) {
      // Guardar el estilo original y la posición de scroll
      const originalOverflow = modalDetalles.style.overflow;
      const scrollPosition = modalDetalles.scrollTop;

      // Bloquear scroll del modal de detalles
      modalDetalles.style.overflow = 'hidden';

      // Restaurar cuando se cierra
      return () => {
        modalDetalles.style.overflow = originalOverflow;
        // Restaurar la posición de scroll
        modalDetalles.scrollTop = scrollPosition;
      };
    }
  }, [isOpen]);

  // 🆕 Handler simplificado - Solo pasa información al siguiente paso
  const handleContinuar = () => {
    // Payload simple solo con información del flujo
    const payloadCompleto = {
      tiene_factura: infoCancelacion?.tiene_factura,
      factura_id: infoCancelacion?.factura?.id,
      items_nc: infoCancelacion?.items_nc || [],
      monto_nc: infoCancelacion?.monto_nc,
      monto_total_pagado: infoCancelacion?.monto_total_pagado,
      flujo: infoCancelacion?.flujo,
    };

    onConfirm(payloadCompleto);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 99999 }}
      onClick={(e) => {
        // Prevenir el cierre al hacer clic fuera del modal si está forzando cancelación
        if (forzarCancelacion) {
          e.stopPropagation();
        } else if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[95vh] h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <AlertCircle className="w-7 h-7 mr-3" />
              INFORMACIÓN DE CANCELACIÓN
            </h2>
            {!forzarCancelacion && (
              <button
                onClick={onClose}
                disabled={isPending}
                className="text-white hover:bg-red-700 rounded-full p-1"
              >
                <AlertCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                INFORMACIÓN IMPORTANTE
              </h3>
              {/* Badge del flujo */}
              {infoCancelacion?.flujo && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                  infoCancelacion.flujo === 'facturar_y_nc'
                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                    : infoCancelacion.flujo === 'generar_nc'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                }`}>
                  {infoCancelacion.flujo === 'facturar_y_nc' && '📄 Facturar + NC'}
                  {infoCancelacion.flujo === 'generar_nc' && '📋 Generar NC'}
                  {infoCancelacion.flujo === 'cancelar_directo' && '🚫 Sin NC'}
                </span>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">• Tipo de cancelación:</span>
                <span className="font-semibold uppercase">{infoCancelacion?.tipo_cancelacion}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">• Pasajeros afectados:</span>
                <span className="font-semibold">{infoCancelacion?.pasajeros_afectados}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">• Días hasta salida:</span>
                <span className="font-semibold">{infoCancelacion?.dias_hasta_salida}</span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Estado de Facturación:</span>
                </div>
                <div className="ml-6 space-y-1">
                  {infoCancelacion?.tiene_factura ? (
                    <>
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-gray-700">
                          Ya tiene {infoCancelacion?.facturas_activas || 1} factura(s) generada(s)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-orange-600 mr-2" />
                        <span className="text-gray-700">Se generará Nota de Crédito automáticamente</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-gray-700">Sin facturas generadas aún</span>
                      </div>
                      {infoCancelacion?.monto_nc > 0 && (
                        <div className="flex items-center">
                          <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                          <span className="text-gray-700">Se requerirá facturar para generar NC</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Proceso que se ejecutará */}
              {infoCancelacion?.flujo && (
                <div className="mt-3 pt-3 border-t border-yellow-200 bg-orange-50 rounded p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-orange-900">Proceso de Cancelación:</span>
                  </div>
                  <div className="ml-6 space-y-2 text-sm text-gray-700">
                    {infoCancelacion.flujo === 'facturar_y_nc' && (
                      <>
                        <div className="flex items-start space-x-2">
                          <span className="text-orange-600 font-bold">1.</span>
                          <span>Se cancelará la reserva</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-orange-600 font-bold">2.</span>
                          <span>Se generará una factura por los pagos realizados</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-orange-600 font-bold">3.</span>
                          <span>Podrá generar una Nota de Crédito por Gs. {formatearSeparadorMiles.format(infoCancelacion.monto_nc)}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-orange-600 font-bold">4.</span>
                          <span>Los cupos serán liberados</span>
                        </div>
                      </>
                    )}
                    {infoCancelacion.flujo === 'generar_nc' && (
                      <>
                        <div className="flex items-start space-x-2">
                          <span className="text-red-600 font-bold">1.</span>
                          <span>Se cancelará la reserva</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-red-600 font-bold">2.</span>
                          <span>Podrá generar una Nota de Crédito por Gs. {formatearSeparadorMiles.format(infoCancelacion.monto_nc)}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-red-600 font-bold">3.</span>
                          <span>Los cupos serán liberados</span>
                        </div>
                      </>
                    )}
                    {infoCancelacion.flujo === 'cancelar_directo' && (
                      <>
                        <div className="flex items-start space-x-2">
                          <span className="text-gray-600 font-bold">1.</span>
                          <span>Se cancelará la reserva sin generar documentos fiscales</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-gray-600 font-bold">2.</span>
                          <span>Los cupos serán liberados</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-red-600 font-bold">⚠️</span>
                          <span className="text-red-600 font-medium">No habrá devolución de dinero</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Desglose de Devolución */}
              <div className={`mt-3 pt-3 border-t border-yellow-200 rounded p-4 ${
                infoCancelacion?.monto_nc > 0 ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  {infoCancelacion?.monto_nc > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="font-semibold text-gray-900">DESGLOSE DE PAGOS:</span>
                </div>

                <div className="space-y-2 text-sm">
                  {/* Total pagado */}
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-gray-600 font-medium">Total pagado:</span>
                    <span className="font-semibold text-gray-900">
                      {reservaData?.paquete?.moneda?.simbolo || '$'}
                      {formatearSeparadorMiles.format(infoCancelacion?.monto_total_pagado || 0)}
                    </span>
                  </div>

                  {/* Seña pagada */}
                  <div className="flex justify-between items-center pl-4">
                    <span className="text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      Seña:
                    </span>
                    <span className="font-medium text-gray-900">
                      {reservaData?.paquete?.moneda?.simbolo || '$'}
                      {formatearSeparadorMiles.format(infoCancelacion?.monto_sena || 0)}
                      <span className="ml-2 text-xs text-red-600 font-semibold">(no reembolsable)</span>
                    </span>
                  </div>

                  {/* Pagos adicionales */}
                  <div className="flex justify-between items-center pl-4">
                    <span className="text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Pagos adicionales:
                    </span>
                    <span className="font-medium text-gray-900">
                      {reservaData?.paquete?.moneda?.simbolo || '$'}
                      {formatearSeparadorMiles.format(infoCancelacion?.monto_pagos_adicionales || 0)}
                    </span>
                  </div>

                  {/* Línea divisoria */}
                  <div className="border-t-2 border-dashed border-gray-300 my-2"></div>

                  {/* Monto de NC (si aplica) */}
                  {infoCancelacion?.monto_nc > 0 && (
                    <div className="flex justify-between items-center pt-1 bg-orange-100 -mx-2 px-2 py-2 rounded">
                      <span className="font-semibold text-orange-900">Monto para Nota de Crédito:</span>
                      <span className="text-xl font-bold text-orange-700">
                        {reservaData?.paquete?.moneda?.simbolo || '$'}
                        {formatearSeparadorMiles.format(infoCancelacion?.monto_nc)}
                      </span>
                    </div>
                  )}

                  {/* Monto a devolver en efectivo/caja */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-semibold text-gray-900">Devolución en caja:</span>
                    <span className={`text-xl font-bold ${
                      infoCancelacion?.monto_nc > 0 && infoCancelacion?.monto_reembolsable > 0
                        ? 'text-green-700'
                        : 'text-gray-700'
                    }`}>
                      {reservaData?.paquete?.moneda?.simbolo || '$'}
                      {formatearSeparadorMiles.format(infoCancelacion?.monto_reembolsable || 0)}
                    </span>
                  </div>

                  {/* Tipo de devolución */}
                  {infoCancelacion?.tipo_devolucion && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 italic">
                        ℹ️ {infoCancelacion.tipo_devolucion}
                      </p>
                    </div>
                  )}
                </div>

                {/* Advertencia o política según corresponda */}
                {infoCancelacion?.monto_nc === 0 || !infoCancelacion?.monto_nc ? (
                  <div className="mt-3 pt-3 border-t border-gray-300 bg-red-50 rounded p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                      <div className="text-sm text-red-700">
                        <p className="font-semibold mb-1">⚠️ Política de cancelación:</p>
                        <p className="mb-2">{infoCancelacion?.politica}</p>
                        {infoCancelacion?.tipo_devolucion && (
                          <p className="text-xs italic border-t border-red-200 pt-2 mt-2">
                            📌 {infoCancelacion.tipo_devolucion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Información positiva cuando SÍ aplica NC */
                  infoCancelacion?.tipo_devolucion && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-green-700 italic flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {infoCancelacion.tipo_devolucion}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
            <p className="text-sm font-medium text-orange-800 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Al continuar, {infoCancelacion?.tiene_factura
                ? 'se generará una Nota de Crédito basada en la factura existente'
                : 'primero se generará una factura de cancelación y luego la Nota de Crédito correspondiente'}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
          {!forzarCancelacion && (
            <Button
              onClick={onClose}
              disabled={isPending}
              variant="outline"
              className="px-6"
            >
              Volver
            </Button>
          )}
          <Button
            onClick={handleContinuar}
            disabled={isPending}
            className={`px-6 bg-orange-600 hover:bg-orange-700 text-white ${forzarCancelacion ? 'ml-auto' : ''}`}
          >
            {isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Procesando...
              </>
            ) : (
              <>
                Continuar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CancelarReservaModal;



