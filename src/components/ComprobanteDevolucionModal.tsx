/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, Download, FileText, XCircle, Users } from 'lucide-react';
import { Button } from './ui/button';
import { formatearFecha, formatearSeparadorMiles } from '@/helper/formatter';

interface ComprobanteDevolucionModalProps {
  isOpen: boolean;
  onClose: () => void;
  responseData: any;
  reservaData: any;
  onDescargarComprobante?: (comprobanteId: number) => void;
  isPendingDescarga?: boolean;
}

const ComprobanteDevolucionModal: React.FC<ComprobanteDevolucionModalProps> = ({
  isOpen,
  onClose,
  responseData,
  reservaData,
  onDescargarComprobante,
  isPendingDescarga = false,
}) => {
  const comprobante = responseData?.comprobante_devolucion;
  const detalles = responseData?.detalles;
  const huboDevolucion = comprobante && detalles?.monto_devuelto > 0;

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
                <span className="font-semibold text-gray-900">{detalles?.pasajeros_cancelados || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Cupos liberados:</span>
                <span className="font-semibold text-green-600">
                  {detalles?.cupos_liberados ? '✅ Sí' : '❌ No'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Motivo:</span>
                <span className="font-semibold text-gray-900">
                  {responseData?.motivo || 'Cancelación de reserva'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Política aplicada:</span>
                <span className="font-semibold text-gray-900">
                  {reservaData?.info_cancelacion?.dias_hasta_salida > 20
                    ? '> 20 días (con devolución)'
                    : '≤ 20 días (sin devolución)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Facturas afectadas:</span>
                <span className="font-semibold text-green-600">
                  ✅ {detalles?.facturas_afectadas || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Proceso Completo */}
          <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              PROCESO COMPLETO
            </h4>
            <p className="text-sm text-gray-700">
              No se requieren acciones adicionales. La reserva no tenía facturas generadas,
              por lo tanto no es necesario generar Notas de Crédito.
            </p>
          </div>

          {/* Nota Importante */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">💡 NOTA IMPORTANTE</h4>
            <div className="text-sm text-gray-700 space-y-2">
              {huboDevolucion ? (
                <>
                  <p>
                    La seña de {reservaData?.paquete?.moneda?.simbolo || '$'}
                    {formatearSeparadorMiles.format(reservaData?.seña_total || 0)} NO fue devuelta
                    según política de cancelación.
                  </p>
                  <p>
                    Se generó un movimiento de EGRESO en caja por el monto devuelto (
                    {reservaData?.paquete?.moneda?.simbolo || '$'}
                    {formatearSeparadorMiles.format(detalles?.monto_devuelto || 0)}).
                  </p>
                </>
              ) : (
                <>
                  <p>
                    No se generó devolución porque la cancelación se realizó con{' '}
                    {reservaData?.info_cancelacion?.dias_hasta_salida} días o menos de anticipación.
                  </p>
                  <p className="font-medium text-red-700">
                    Monto pagado no reembolsado: {reservaData?.paquete?.moneda?.simbolo || '$'}
                    {formatearSeparadorMiles.format(reservaData?.monto_pagado || 0)}
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
    </div>,
    document.body
  );
};

export default ComprobanteDevolucionModal;


