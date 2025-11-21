/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { MOTIVOS_CANCELACION, METODOS_DEVOLUCION } from '@/types/reservas';
import { formatearSeparadorMiles } from '@/helper/formatter';

interface CancelarReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any) => void;
  isPending: boolean;
  reservaData: any;
}

const CancelarReservaModal: React.FC<CancelarReservaModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  reservaData,
}) => {
  const [formData, setFormData] = useState({
    motivo_cancelacion_id: '',
    motivo_observaciones: '',
    metodo_devolucion: '',
    observaciones: '',
    referencia: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Limpiar el formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        motivo_cancelacion_id: '',
        motivo_observaciones: '',
        metodo_devolucion: '',
        observaciones: '',
        referencia: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.motivo_cancelacion_id) {
      newErrors.motivo_cancelacion_id = 'Debe seleccionar un motivo de cancelación';
    }

    if (infoCancelacion?.aplica_reembolso && !formData.metodo_devolucion) {
      newErrors.metodo_devolucion = 'Debe seleccionar un método de devolución';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload: any = {
      motivo_cancelacion_id: formData.motivo_cancelacion_id,
    };

    // Campos opcionales
    if (formData.motivo_observaciones.trim()) {
      payload.motivo_observaciones = formData.motivo_observaciones;
    }

    // Solo incluir metodo_devolucion si aplica reembolso
    if (infoCancelacion?.aplica_reembolso) {
      payload.metodo_devolucion = formData.metodo_devolucion;
    }

    if (formData.observaciones.trim()) {
      payload.observaciones = formData.observaciones;
    }
    if (formData.referencia.trim()) {
      payload.referencia = formData.referencia;
    }

    onConfirm(payload);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[95vh] h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <XCircle className="w-7 h-7 mr-3" />
              CANCELAR RESERVA
            </h2>
            <button
              onClick={onClose}
              disabled={isPending}
              className="text-white hover:bg-red-700 rounded-full p-1"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
              INFORMACIÓN IMPORTANTE
            </h3>
            
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
                  <span className="font-medium text-gray-900">Facturación:</span>
                </div>
                <div className="ml-6 space-y-1">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-700">Sin facturas generadas aún</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-700">No requiere Nota de Crédito</span>
                  </div>
                </div>
              </div>

              {infoCancelacion?.aplica_reembolso ? (
                <div className="mt-3 pt-3 border-t border-yellow-200 bg-green-50 rounded p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">DEVOLUCIÓN APLICABLE:</span>
                  </div>
                  <div className="ml-7">
                    <span className="text-2xl font-bold text-green-700">
                      {reservaData?.paquete?.moneda?.simbolo || '$'}
                      {formatearSeparadorMiles.format(infoCancelacion?.monto_reembolsable || 0)}
                    </span>
                  </div>
                  <div className="ml-7 mt-2 text-xs text-gray-600">
                    ℹ️ La seña NO es reembolsable
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-yellow-200 bg-red-50 rounded p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">NO CORRESPONDE DEVOLUCIÓN</span>
                  </div>
                  <div className="ml-7 text-sm text-gray-700">
                    {infoCancelacion?.politica}
                  </div>
                  <div className="ml-7 mt-2 text-sm font-medium text-red-700">
                    ⚠️ Se perderán los {reservaData?.paquete?.moneda?.simbolo || '$'}
                    {formatearSeparadorMiles.format(reservaData?.monto_pagado || 0)} pagados
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de cancelación: <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.motivo_cancelacion_id}
                onChange={(e) => setFormData({ ...formData, motivo_cancelacion_id: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.motivo_cancelacion_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isPending}
              >
                <option value="">Seleccione un motivo...</option>
                {MOTIVOS_CANCELACION.map((motivo) => (
                  <option key={motivo.id} value={motivo.id}>
                    {motivo.label}
                  </option>
                ))}
              </select>
              {errors.motivo_cancelacion_id && (
                <p className="mt-1 text-sm text-red-600">{errors.motivo_cancelacion_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones adicionales (opcional):
              </label>
              <textarea
                value={formData.motivo_observaciones}
                onChange={(e) => setFormData({ ...formData, motivo_observaciones: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                placeholder="Describa el motivo de la cancelación..."
                disabled={isPending}
              />
            </div>

            {infoCancelacion?.aplica_reembolso && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Método de devolución: <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {METODOS_DEVOLUCION.map((metodo) => (
                    <label
                      key={metodo.id}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.metodo_devolucion === metodo.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="metodo_devolucion"
                        value={metodo.id}
                        checked={formData.metodo_devolucion === metodo.id}
                        onChange={(e) => setFormData({ ...formData, metodo_devolucion: e.target.value })}
                        className="mr-3"
                        disabled={isPending}
                      />
                      <span className="text-sm font-medium">{metodo.label}</span>
                    </label>
                  ))}
                </div>
                {errors.metodo_devolucion && (
                  <p className="mt-1 text-sm text-red-600">{errors.metodo_devolucion}</p>
                )}
              </div>
            )}

          </div>

          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
            <p className="text-sm font-medium text-red-800 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
          <Button
            onClick={onClose}
            disabled={isPending}
            variant="outline"
            className="px-6"
          >
            Volver
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Procesando...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Confirmar Cancelación
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


