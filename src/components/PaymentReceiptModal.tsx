/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatearFecha, formatearSeparadorMiles, getHoraDesdeFecha, getPrimerNombreApellido } from '@/helper/formatter';
import { X, Download, Mail, CheckCircle2, Loader2Icon, AlertCircle, XCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

type ReservationStatus = "pendiente" | "confirmado-completo" | "confirmado-incompleto" | "finalizada" | "cancelada";

const statusConfig: Record<
  ReservationStatus,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    variant: "default" | "secondary" | "destructive" | "outline"
    className: string
  }
> = {
  pendiente: {
    label: "Pendiente de Seña",
    icon: Clock,
    variant: "outline",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800",
  },
  "confirmado-completo": {
    label: "Confirmado Completo",
    icon: CheckCircle2,
    variant: "default",
    className:
      "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800",
  },
  "confirmado-incompleto": {
    label: "Confirmado Incompleto",
    icon: AlertCircle,
    variant: "secondary",
    className:
      "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
  },
  finalizada: {
    label: "Finalizado",
    icon: CheckCircle2,
    variant: "default",
    className: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
  },
  cancelada: {
    label: "Cancelado",
    icon: XCircle,
    variant: "destructive",
    className: "bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
  },
}

// Helper function para mapear estado_display del backend a ReservationStatus
const getReservationDisplayStatus = (estadoDisplay: string | undefined): ReservationStatus => {
  // Si no hay estado_display, retornar pendiente por defecto
  if (!estadoDisplay) {
    return "pendiente";
  }

  // Normalizar estado_display a minúsculas y sin espacios para comparación
  const estadoNormalizado = estadoDisplay.toLowerCase().replace(/\s+/g, '-');

  // Mapeo directo del estado_display del backend
  const statusMap: Record<string, ReservationStatus> = {
    'pendiente': 'pendiente',
    'pendiente-de-seña': 'pendiente',
    'confirmado-completo': 'confirmado-completo',
    'confirmado-incompleto': 'confirmado-incompleto',
    'finalizada': 'finalizada',
    'finalizado': 'finalizada',
    'cancelada': 'cancelada',
    'cancelado': 'cancelada',
  };

  // Buscar el estado en el mapa
  const mappedStatus = statusMap[estadoNormalizado];

  if (mappedStatus) {
    return mappedStatus;
  }

  // Fallback a pendiente si el estado no es reconocido
  console.warn(`Estado desconocido: ${estadoDisplay}, usando 'pendiente' por defecto`);
  return "pendiente";
}

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  handleDescargarPDF: () => void;
  receiptData: any;
  isPendingDescargaComprobante: boolean;
}

export default function PaymentReceiptModal({
  isOpen,
  onClose,
  receiptData,
  handleDescargarPDF,
  isPendingDescargaComprobante,
}: PaymentReceiptModalProps) {
  if (!isOpen) return null;

  // Usar estado_display del backend para determinar el estado visual
  const displayStatus = getReservationDisplayStatus(receiptData?.reserva?.estado_display);
  const status = statusConfig[displayStatus];
  const StatusIcon = status.icon

  const handleDownloadPDF = () => {
    console.log('Descargando PDF...');
    handleDescargarPDF()
  };

  const handleSendEmail = () => {
    console.log('Enviando email...');
  };

  console.log(receiptData)



    // const sampleReceipt = {
    //       receiptNumber: 'CPG-2025-0001',
    //       date: '23/10/2025',
    //       time: '14:30',
    //       paymentType: 'SEÑA',
    //       customerName: 'Juan Pérez',
    //       customerDocument: '1.234.567',
    //       customerPhone: '+595 981 123456',
    //       reservationCode: 'RSV-2025-0001',
    //       package: 'Río Aéreo Flexible x2',
    //       destination: 'Rio de Janeiro, Brasil',
    //       paymentMethod: 'Transferencia Bancaria',
    //       paymentReference: 'TRF-20251022-001',
    //       amountPaid: 500000,
    //       totalPrice: 2500000,
    //       remainingBalance: 2000000,
    //       currency: 'Gs.',
    //     };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 rounded-xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center justify-between mb-4">
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={isPendingDescargaComprobante}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadPDF()
              }}
              className="px-6 py-5 bg-blue-600 text-white font-medium rounded-lg
                        cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
                {isPendingDescargaComprobante ? 
                  <>
                      <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                      Descargando...
                  </> : 
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </>}
            </Button>
            <button
              disabled
              onClick={handleSendEmail}
              className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Enviar Email
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="" id="receipt-content">
          {/* Success Icon & Title */}
          <div  className='relative bg-gradient-to-b from-green-100 to-transparent dark:from-green-950/30 dark:to-transparent border-b border-green-100 dark:border-green-900/30'>

            <div className="text-center mb-8 pt-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                COMPROBANTE DE PAGO
              </h2>
              <p className="text-xl font-mono text-gray-600">
                #{receiptData.comprobante.numero_comprobante}
              </p>
            </div>
          </div>


          <div className='px-8 py-8 '>
              <div className="flex justify-center pt-2">
              <Badge
                variant={status.variant}
                className={cn("gap-1.5 px-3 py-1.5 text-sm font-medium", status.className)}
              >
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </Badge>
            </div>

              
            {/* <Card className="border-2 border-green-200 bg-green-50/30 p-6 md:p-8">
                <div className="mb-6 flex flex-col items-center text-center">
                  <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />
                  <h1 className="mb-2 text-2xl font-bold text-green-900">Pago Registrado Exitosamente!</h1>
                  <p className="text-gray-600">
                    Tu número de reserva es: <span className="font-mono font-bold text-green-700">#{receiptData.comprobante.numero_comprobante}</span>
                  </p> */}

                  {/* <div className="mb-6 flex justify-center items-center text-center mt-2 gap-1">
                    <span className="text-sm font-medium text-green-800">Estado actual:</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      {reservationData?.estado_display || 'PENDIENTE DE SEÑA'}
                    </span>
                  </div> */}
                {/* </div>
              </Card> */}

            {/* Date, Time & Type */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-gray-600">Fecha:</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatearFecha(receiptData.comprobante.fecha_pago, false)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hora:</p>
                  <p className="text-base font-semibold text-gray-900">
                    {getHoraDesdeFecha(receiptData.comprobante.fecha_pago)}
                  </p>
                </div>
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <p className="text-sm font-bold text-blue-800">
                  Tipo: {receiptData.comprobante.tipo_display}
                </p>
              </div>
            </div>

            {/* Customer Data */}
            <div className="border border-gray-200 rounded-lg p-5 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                DATOS DEL CLIENTE
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-600 w-32">• Titular:</span>
                  <span className="font-semibold text-gray-900">
                    {receiptData.customerName}
                    {getPrimerNombreApellido(receiptData.titular.nombre, receiptData.titular.apellido)}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">• Documento:</span>
                  <span className="font-semibold text-gray-900">
                    {receiptData.titular.documento}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">• Teléfono:</span>
                  <span className="font-semibold text-gray-900">
                    {receiptData.titular.telefono}
                  </span>
                </div>
              </div>
            </div>

            {/* Reservation Data */}
            <div className="border border-gray-200 rounded-lg p-5 mb-6">
              <div className='flex items-center justify-between mb-4 pb-2 border-b border-gray-200'>
                <h3 className="text-lg font-bold text-gray-900">
                  DATOS DE LA RESERVA
                </h3>

                <div className=''>
                  <div className="flex justify-center">
                    <Badge
                      variant={status.variant}
                      className={cn("gap-1.5 px-3 py-1.5 text-sm font-medium", status.className)}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-600 w-32">• Código:</span>
                  <span className="font-semibold text-gray-900 font-mono">
                    {receiptData.comprobante.reserva_codigo}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">• Paquete:</span>
                  <span className="font-semibold text-gray-900">
                    {receiptData?.reserva?.nombre_paquete}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">• Destino:</span>
                  <span className="font-semibold text-gray-900">
                    {receiptData?.reserva?.nombre_destino}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border border-gray-200 rounded-lg p-5 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                DETALLE DEL PAGO
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-600 w-32">• Método:</span>
                  <span className="font-semibold text-gray-900">
                    {receiptData.comprobante.metodo_pago_display}
                  </span>
                </div>
                {receiptData.comprobante.referencia && (
                  <div className="flex">
                    <span className="text-gray-600 w-32">• Referencia:</span>
                    <span className="font-semibold text-gray-900 font-mono">
                      {receiptData.comprobante.referencia}
                    </span>
                  </div>
                )}
                <div className="flex">
                  <span className="text-gray-600 w-32">• Monto pagado:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {receiptData.reserva.moneda.simbolo} {formatearSeparadorMiles.format(receiptData.comprobante.monto)}
                  </span>
                </div>
              </div>
            </div>

            {/* Passenger Distribution */}
            {receiptData.comprobante.distribuciones && receiptData.comprobante.distribuciones.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-5 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  DISTRIBUCIÓN POR PASAJERO
                </h3>
                <div className="overflow-x-auto tabla-comprobante">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pasajero</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {receiptData.comprobante.distribuciones.map((dist: any) => (
                        <tr key={dist.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {dist.pasajero_nombre} {dist.pasajero_apellido}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {receiptData.reserva.moneda.simbolo} {formatearSeparadorMiles.format(dist.monto)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                          {receiptData.reserva.moneda.simbolo} {formatearSeparadorMiles.format(receiptData.comprobante.monto)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Economic Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 pb-2 border-b-2 border-blue-300">
                RESUMEN ECONÓMICO
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">• Precio total:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {receiptData.reserva.moneda.simbolo} {formatearSeparadorMiles.format(receiptData.reserva.costo_total_estimado)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">• Total pagado:</span>
                  <span className="text-xl font-bold text-green-600">
                    {receiptData.reserva.moneda.simbolo} {formatearSeparadorMiles.format(receiptData.reserva.monto_pagado)}
                  </span>
                </div>
                <div className="border-t-2 border-blue-300 pt-4 flex justify-between items-center">
                  <span className="text-gray-900 font-bold text-lg">
                    • Saldo pendiente:
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {receiptData.reserva.moneda.simbolo} {formatearSeparadorMiles.format(receiptData.reserva.saldo_pendiente)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
              <p>Este comprobante es válido como constancia de pago.</p>
              <p className="mt-1">
                Para cualquier consulta, contacte a nuestro servicio de atención al cliente.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
