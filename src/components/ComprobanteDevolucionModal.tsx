/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, Download, FileText, XCircle, Users, FileCheck } from 'lucide-react';
import { Button } from './ui/button';
import { formatearFecha, formatearSeparadorMiles } from '@/helper/formatter';
import GenerarNotaCreditoModal from './GenerarNotaCreditoModal';

interface ComprobanteDevolucionModalProps {
  isOpen: boolean;
  onClose: () => void;
  responseData: any;
  reservaData: any;
  onDescargarComprobante?: (comprobanteId: number) => void;
  isPendingDescarga?: boolean;
  onGenerarNotaCredito?: (facturaId: number, payload: any) => void;
  isPendingGenerarNC?: boolean;
}

const ComprobanteDevolucionModal: React.FC<ComprobanteDevolucionModalProps> = ({
  isOpen,
  onClose,
  responseData,
  reservaData,
  onDescargarComprobante,
  isPendingDescarga = false,
  onGenerarNotaCredito,
  isPendingGenerarNC = false,
}) => {
  const [isGenerarNotaCreditoModalOpen, setIsGenerarNotaCreditoModalOpen] = useState(false);

  // Log de verificación de datos
  if (isOpen) {
    console.log('📊 ComprobanteDevolucionModal - Datos recibidos:', {
      pasajeros_cancelados: responseData?.pasajeros_cancelados,
      fueron_liberados: responseData?.cupos_info?.fueron_liberados,
      monto_reembolsable: responseData?.monto_reembolsable,
      factura_para_nota_credito: responseData?.factura_para_nota_credito,
    });
  }

  const comprobante = responseData?.comprobante_devolucion;
  const huboDevolucion = comprobante && responseData?.monto_reembolsable > 0;
  const facturaParaNC = responseData?.factura_para_nota_credito;

  // Bloquear scroll del modal padre cuando ComprobanteDevolucionModal está abierto
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

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[95vh] h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <CheckCircle className="w-7 h-7 mr-3" />
              RESERVA CANCELADA
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-green-700 rounded-full p-1"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Mensaje inicial */}
          <div className="text-center">
            <p className="text-lg text-gray-700">
              La reserva <span className="font-bold">{reservaData?.codigo}</span> ha sido cancelada exitosamente.
            </p>
          </div>

          {/* Comprobante de Devolución - Solo si hubo devolución */}
          {huboDevolucion && comprobante && (
            <div className="border-2 border-blue-300 rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  COMPROBANTE DE DEVOLUCIÓN
                </h3>
              </div>
              <div className="p-6 bg-blue-50 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Número:</p>
                    <p className="font-semibold text-gray-900">{comprobante.numero}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha:</p>
                    <p className="font-semibold text-gray-900">
                      {formatearFecha(comprobante.fecha_creacion, true)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monto devuelto:</p>
                    <p className="font-semibold text-green-700 text-xl">
                      {reservaData?.paquete?.moneda?.simbolo || '$'}
                      {formatearSeparadorMiles.format(comprobante.monto)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Método:</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {comprobante.metodo_pago || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Botón de descarga */}
                {onDescargarComprobante && comprobante.id && (
                  <div className="pt-4 flex justify-center">
                    <Button
                      onClick={() => onDescargarComprobante(comprobante.id)}
                      disabled={isPendingDescarga}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isPendingDescarga ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Descargando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detalles de la Cancelación */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              DETALLES DE LA CANCELACIÓN
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Pasajeros cancelados:
                </span>
                <span className="font-semibold text-gray-900">{responseData?.pasajeros_cancelados || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Cupos liberados:</span>
                <span className={`font-semibold ${responseData?.cupos_info?.fueron_liberados ? 'text-green-600' : 'text-red-600'}`}>
                  {responseData?.cupos_info?.fueron_liberados ? '✅ Sí' : '❌ No'}
                </span>
              </div>
              {responseData?.cupos_info?.observacion && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Observación:</span>
                  <span className="font-medium text-gray-700 text-sm italic">
                    {responseData.cupos_info.observacion}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tipo de paquete:</span>
                <span className="font-semibold text-gray-900">
                  {responseData?.cupos_info?.es_paquete_propio ? '🏠 Propio' : '🏢 Distribuidor'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Política aplicada:</span>
                <span className="font-semibold text-gray-900">
                  {responseData?.politica_aplicada || (reservaData?.info_cancelacion?.dias_hasta_salida > 20
                    ? '> 20 días (con devolución)'
                    : '≤ 20 días (sin devolución)')}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Facturas afectadas:</span>
                <span className="font-semibold text-green-600">
                  ✅ {responseData?.facturas_afectadas || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Información de Factura para Nota de Crédito */}
          {facturaParaNC && (
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                <FileCheck className="w-5 h-5 mr-2" />
                FACTURA DISPONIBLE PARA NOTA DE CRÉDITO
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Número de Factura:</p>
                  <p className="font-semibold text-gray-900">{facturaParaNC.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo:</p>
                  <p className="font-semibold text-gray-900 capitalize">{facturaParaNC.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto Total:</p>
                  <p className="font-semibold text-purple-700 text-lg">
                    {reservaData?.paquete?.moneda?.simbolo || '$'}
                    {formatearSeparadorMiles.format(facturaParaNC.total)}
                  </p>
                </div>
                {facturaParaNC.pasajero && (
                  <div>
                    <p className="text-sm text-gray-600">Pasajero:</p>
                    <p className="font-semibold text-gray-900">{facturaParaNC.pasajero}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => setIsGenerarNotaCreditoModalOpen(true)}
                  disabled={isPendingGenerarNC}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isPendingGenerarNC ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 mr-2" />
                      Generar Nota de Crédito
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Proceso Completo */}
          <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              PROCESO COMPLETO
            </h4>
            <p className="text-sm text-gray-700">
              {responseData?.facturas_afectadas === 0 ? (
                <>
                  No se requieren acciones adicionales. La reserva no tenía facturas generadas,
                  por lo tanto no es necesario generar Notas de Crédito.
                </>
              ) : (
                <>
                  Se procesaron {responseData?.facturas_afectadas} factura(s).
                  {facturaParaNC && (
                    <span className="block mt-2 font-semibold text-purple-700">
                      ⚠️ Debe generar la Nota de Crédito manualmente usando el botón de arriba.
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Desglose de Montos */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <h4 className="font-semibold text-blue-800 mb-3">💰 DESGLOSE DE MONTOS</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Seña pagada:</span>
                <span className="font-medium text-gray-900">
                  {reservaData?.paquete?.moneda?.simbolo || '$'}
                  {formatearSeparadorMiles.format(responseData?.monto_sena || 0)}
                  <span className="ml-2 text-xs text-red-600">(no reembolsable)</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Pagos adicionales:</span>
                <span className="font-medium text-gray-900">
                  {reservaData?.paquete?.moneda?.simbolo || '$'}
                  {formatearSeparadorMiles.format(responseData?.monto_pagos_adicionales || 0)}
                </span>
              </div>
              <div className="border-t-2 border-dashed border-gray-300 my-2"></div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-gray-900">Monto reembolsado:</span>
                <span className={`text-lg font-bold ${
                  responseData?.monto_reembolsable > 0 ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {reservaData?.paquete?.moneda?.simbolo || '$'}
                  {formatearSeparadorMiles.format(responseData?.monto_reembolsable || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Nota Importante */}
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 NOTA IMPORTANTE</h4>
            <div className="text-sm text-gray-700 space-y-2">
              {huboDevolucion ? (
                <>
                  <p>
                    Se generó un movimiento de EGRESO en caja por el monto devuelto (
                    {reservaData?.paquete?.moneda?.simbolo || '$'}
                    {formatearSeparadorMiles.format(responseData?.monto_reembolsable || 0)}).
                  </p>
                  <p>
                    La seña de {reservaData?.paquete?.moneda?.simbolo || '$'}
                    {formatearSeparadorMiles.format(responseData?.monto_sena || 0)} NO fue devuelta
                    según política de cancelación.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    No se generó devolución porque la cancelación se realizó con{' '}
                    {responseData?.dias_hasta_salida || reservaData?.info_cancelacion?.dias_hasta_salida} días o menos de anticipación.
                  </p>
                  <p className="font-medium text-red-700">
                    Monto pagado no reembolsado: {reservaData?.paquete?.moneda?.simbolo || '$'}
                    {formatearSeparadorMiles.format(
                      (responseData?.monto_sena || 0) + (responseData?.monto_pagos_adicionales || 0)
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-center space-x-4">
          <Button
            onClick={onClose}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            🔙 Volver a Mis Reservas
          </Button>
        </div>
      </div>

      {/* Modal de Generar Nota de Crédito */}
      {isGenerarNotaCreditoModalOpen && facturaParaNC && (
        <GenerarNotaCreditoModal
          isOpen={isGenerarNotaCreditoModalOpen}
          onClose={() => setIsGenerarNotaCreditoModalOpen(false)}
          onConfirm={(payload) => {
            console.log('📦 Generando NC para factura ID:', facturaParaNC.id);
            console.log('📦 Payload:', payload);
            if (onGenerarNotaCredito) {
              onGenerarNotaCredito(facturaParaNC.id, payload);
            }
            setIsGenerarNotaCreditoModalOpen(false);
          }}
          isPending={isPendingGenerarNC}
          reservaData={reservaData}
          selectedPasajeroId={undefined}
        />
      )}
    </div>,
    document.body
  );
};

export default ComprobanteDevolucionModal;


