/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatearFecha, formatearSeparadorMiles, getHoraDesdeFecha, getPrimerNombreApellido } from '@/helper/formatter';
import { X, Download, Mail, Printer, CheckCircle2 } from 'lucide-react';

// interface PaymentReceiptData {
//   receiptNumber: string;
//   date: string;
//   codigo: string;
//   time: string;
//   paymentType: string;
//   customerName: string;
//   customerDocument: string;
//   customerPhone: string;
//   reservationCode: string;
//   package: string;
//   destination: string;
//   paymentMethod: string;
//   paymentReference: string;
//   amountPaid: number;
//   totalPrice: number;
//   remainingBalance: number;
//   currency: string;
// }

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  handleDescargarPDF: () => void;
  receiptData: any;
}

export default function PaymentReceiptModal({
  isOpen,
  onClose,
  receiptData,
  handleDescargarPDF,
}: PaymentReceiptModalProps) {
  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    console.log('Descargando PDF...');
    handleDescargarPDF()
  };

  const handleSendEmail = () => {
    console.log('Enviando email...');
  };

  const handlePrint = () => {
    window.print();
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
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors
                cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button
              disabled
              onClick={handleSendEmail}
              className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Enviar Email
            </button>
            <button
              disabled
              onClick={handlePrint}
              className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="px-8 py-8" id="receipt-content">
          {/* Success Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              COMPROBANTE DE PAGO
            </h2>
            <p className="text-xl font-mono text-gray-600">
              #{receiptData.codigo}
            </p>
          </div>

          {/* Date, Time & Type */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-gray-600">Fecha:</p>
                <p className="text-base font-semibold text-gray-900">
                  {formatearFecha(receiptData.fecha_reserva, false)} 
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hora:</p>
                <p className="text-base font-semibold text-gray-900">
                  {/* {receiptData.time} */}
                  {getHoraDesdeFecha(receiptData.fecha_reserva)}
                </p>
              </div>
            </div>
            <div className="bg-blue-100 px-4 py-2 rounded-lg">
              <p className="text-sm font-bold text-blue-800">
                {/* Tipo: {receiptData?.tipo_paquete?.nombre} */}
                Tipo: SEÑA
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
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              DATOS DE LA RESERVA
            </h3>
            <div className="space-y-3">
              <div className="flex">
                <span className="text-gray-600 w-32">• Código:</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {receiptData.codigo}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32">• Paquete:</span>
                <span className="font-semibold text-gray-900">
                  {receiptData?.paquete?.nombre}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32">• Destino:</span>
                <span className="font-semibold text-gray-900">
                  {receiptData?.paquete?.destino?.ciudad}
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
                  {/* {receiptData.paymentMethod} */}
                  EFECTIVO
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32">• Referencia:</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {/* {receiptData.paymentReference}                   */}
                  TRF-20251022-001
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32">• Monto pagado:</span>
                <span className="font-bold text-green-600 text-lg">
                  {receiptData.paquete.moneda.simbolo} {formatearSeparadorMiles.format(receiptData.monto_pagado)}
                </span>
              </div>
            </div>
          </div>

          {/* Economic Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 pb-2 border-b-2 border-blue-300">
              RESUMEN ECONÓMICO
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">• Precio total:</span>
                <span className="text-xl font-bold text-gray-900">
                  {receiptData.paquete.moneda.simbolo} {formatearSeparadorMiles.format(receiptData.costo_total_estimado)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">• Total pagado:</span>
                <span className="text-xl font-bold text-green-600">
                  {receiptData.paquete.moneda.simbolo} {formatearSeparadorMiles.format(receiptData.monto_pagado)}
                </span>
              </div>
              <div className="border-t-2 border-blue-300 pt-4 flex justify-between items-center">
                <span className="text-gray-900 font-bold text-lg">
                  • Saldo pendiente:
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {receiptData.paquete.moneda.simbolo} {formatearSeparadorMiles.format(Number(receiptData.costo_total_estimado) - Number(receiptData.monto_pagado))}
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
