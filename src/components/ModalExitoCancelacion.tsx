/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPortal } from 'react-dom';
import { CheckCircle, Download, FileText, X, Package } from 'lucide-react';
import { Button } from './ui/button';
import { formatearSeparadorMiles } from '@/helper/formatter';

interface ModalExitoCancelacionProps {
  isOpen: boolean;
  onClose: () => void;
  facturaGenerada?: {
    factura: {
      id: number;
      numero_factura: string;
      total_general: number;
    };
  } | null;
  notaCredito?: {
    id: number;
    numero_nota_credito: string;
    monto_total: number;
  } | null;
  reservaCodigo: string;
  montoDevuelto: number;
  moneda?: {
    simbolo: string;
    codigo: string;
  };
  onDescargarFactura?: (facturaId: number) => void;
  onDescargarNC?: (ncId: number) => void;
  isPendingDescargaFactura?: boolean;
  isPendingDescargaNC?: boolean;
}

const ModalExitoCancelacion: React.FC<ModalExitoCancelacionProps> = ({
  isOpen,
  onClose,
  facturaGenerada,
  notaCredito,
  reservaCodigo,
  montoDevuelto,
  moneda = { simbolo: 'Gs.', codigo: 'PYG' },
  onDescargarFactura,
  onDescargarNC,
  isPendingDescargaFactura = false,
  isPendingDescargaNC = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Cancelación Exitosa</h2>
                <p className="text-green-100 text-sm">Reserva {reservaCodigo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Mensaje de confirmación */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 text-lg mb-1">
                  Proceso Completado
                </h3>
                <p className="text-green-700 text-sm">
                  La reserva ha sido cancelada exitosamente y se han generado los documentos correspondientes.
                </p>
              </div>
            </div>
          </div>

          {/* Documentos Generados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Documentos Generados
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {/* Factura (si se generó) */}
              {facturaGenerada && (
                <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">
                          Factura de Regularización
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        NUEVA
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Número de Factura:</p>
                        <p className="font-mono font-semibold text-gray-900">
                          {facturaGenerada.factura.numero_factura}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monto Total:</p>
                        <p className="font-semibold text-blue-700 text-lg">
                          {moneda.simbolo} {formatearSeparadorMiles.format(facturaGenerada.factura.total_general)}
                        </p>
                      </div>
                    </div>
                    {onDescargarFactura && (
                      <Button
                        onClick={() => onDescargarFactura(facturaGenerada.factura.id)}
                        disabled={isPendingDescargaFactura}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        {isPendingDescargaFactura ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Descargando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Factura PDF
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Nota de Crédito */}
              {notaCredito && (
                <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-purple-900">
                          Nota de Crédito
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        GENERADA
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Número de NC:</p>
                        <p className="font-mono font-semibold text-gray-900">
                          {notaCredito?.numero_nota_credito || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monto Acreditado:</p>
                        <p className="font-semibold text-purple-700 text-lg">
                          {moneda.simbolo} {formatearSeparadorMiles.format(montoDevuelto)}
                        </p>
                      </div>
                    </div>
                    {onDescargarNC && notaCredito?.id && (
                      <Button
                        onClick={() => onDescargarNC(notaCredito.id)}
                        disabled={isPendingDescargaNC}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        size="sm"
                      >
                        {isPendingDescargaNC ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Descargando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar NC PDF
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Acciones Realizadas:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span>La reserva ha sido cancelada</span>
              </li>
              {facturaGenerada && (
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Se generó la factura de regularización</span>
                </li>
              )}
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span>Se generó la Nota de Crédito por {moneda.simbolo} {formatearSeparadorMiles.format(montoDevuelto)}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span>Los cupos del paquete han sido liberados</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span>El movimiento de caja ha sido registrado</span>
              </li>
            </ul>
          </div>

          {/* Nota Importante */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              💡 Nota Importante
            </h4>
            <p className="text-sm text-yellow-800">
              Los documentos generados están disponibles para descarga. Asegúrese de descargarlos
              para sus registros contables. La Nota de Crédito puede ser utilizada para futuros
              servicios o procesada según la preferencia del cliente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-center">
          <Button
            onClick={onClose}
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizar
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalExitoCancelacion;
