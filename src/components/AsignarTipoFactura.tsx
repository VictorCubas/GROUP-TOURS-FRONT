/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertCircle, CheckCircle2, FileText, Loader2Icon, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useState, use } from 'react';
import { createPortal } from 'react-dom';
import { Label } from './ui/label';
import { ToastContext } from '@/context/ToastContext';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { Badge } from './ui/badge';


interface AsignarTipoFacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (modalidad: "global" | "individual" | "credito") => void;
  isPending: boolean;
  reservaData: any; // Datos completos de la reserva desde el backend
}

export default function AsignarTipoFacturaModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  reservaData,
}: AsignarTipoFacturaModalProps) {

  const [modalidadFacturacion, setModalidadFacturacion] = useState<"global" | "individual" | "credito" | "">("")

  const {handleShowToast} = use(ToastContext);

  // Verificar si la fecha de salida permite facturación a crédito
  // Crédito disponible cuando: fecha_actual < (fecha_salida - 15 días)
  // Es decir, crédito solo disponible cuando faltan MÁS de 15 días para la salida
  const fechaSalida = reservaData?.salida?.fecha_salida;
  const creditoDisponible = (() => {
    if (!fechaSalida) return false;

    const fechaSalidaDate = new Date(fechaSalida);
    const fechaActual = new Date();

    // Calcular la fecha límite: fecha_salida - 15 días
    const fechaLimite = new Date(fechaSalidaDate);
    fechaLimite.setDate(fechaLimite.getDate() - 15);

    // Crédito disponible si hoy < (fecha_salida - 15 días)
    // Es decir, si aún faltan MÁS de 15 días para la salida
    return fechaActual < fechaLimite;
  })();

  if (!isOpen) return null;


  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 99999 }}
    >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              <Card className="p-8 bg-white border-2 border-blue-200">
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h2 className="text-2xl font-bold">Seleccionar Modalidad de Facturación</h2>
                        <p className='pt-3 text-gray-500'>
                          Elige cómo deseas generar la factura para esta reserva
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  

                  <div className="space-y-4 mt-6">
                    <Label className="text-lg font-semibold">Modalidad de facturación</Label>
                    <RadioGroup
                      value={modalidadFacturacion}
                      onValueChange={(value: any) => setModalidadFacturacion(value)}
                      className="space-y-4"
                    >
                      <div
                        className={`mt-6 flex items-center space-x-2 rounded-lg p-4 transition-all ${
                          !creditoDisponible
                            ? "border-2 border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
                            : modalidadFacturacion === "credito"
                            ? "border-2 border-blue-500 bg-blue-50 cursor-pointer"
                            : "border-2 border-gray-200 hover:bg-blue-50 cursor-pointer"
                        }`}
                      >
                        <RadioGroupItem value="credito" id="credito" disabled={!creditoDisponible} />
                        <Label htmlFor="credito" className={`flex items-center gap-3 flex-1 ${!creditoDisponible ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          <div className='flex-col items-center gap-3 cursor-pointer flex-1'>
                            <div className='flex items-center justify-between gap-3 cursor-pointer flex-1'>
                                <div className='flex items-center justify-between gap-3'>
                                  <FileText
                                  className={`h-6 w-6 transition-opacity ${
                                    !creditoDisponible
                                      ? "text-gray-400 opacity-40"
                                      : modalidadFacturacion === "credito"
                                      ? "text-blue-600 opacity-100"
                                      : "text-blue-400 opacity-40"
                                  }`}
                                />
                                  <div>
                                    <p className={`font-semibold ${!creditoDisponible ? 'text-gray-500' : ''}`}>
                                      Facturación a crédito
                                      {!creditoDisponible && <span className="ml-2 text-xs text-red-600">(No disponible)</span>}
                                    </p>
                                    <p className={`text-sm ${!creditoDisponible ? 'text-gray-400' : 'text-gray-600'}`}>
                                      Factura por el monto total de la reserva, pagando solo la seña inicial
                                    </p>
                                  </div>
                                </div>

                                <Badge className={` ${
                                  !creditoDisponible
                                    ? 'bg-gray-200 text-gray-500 border-gray-300'
                                    : modalidadFacturacion === "credito"
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}>
                                  CREDITO
                                </Badge>
                            </div> 

                            {!creditoDisponible && (
                              <div className="ml-9 mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
                                  <div className="flex-1 text-sm">
                                    <p className="font-medium text-red-900">Opción no disponible</p>
                                    <p className="mt-1 text-red-700">
                                      La facturación a crédito solo está disponible cuando faltan más de 15 días para la fecha de salida del paquete.
                                    </p>
                                    <p className="mt-2 text-xs text-red-600">
                                      Fecha de salida: {fechaSalida ? new Date(fechaSalida).toLocaleDateString('es-PY', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      }) : 'No disponible'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>

                          
                        </Label>
                      </div>

                      <div
                        className={`mt-6 flex items-center space-x-2 rounded-lg p-4 cursor-pointer transition-all ${
                          modalidadFacturacion === "global"
                            ? "border-2 border-blue-500 bg-blue-50"
                            : "border-2 border-gray-200 hover:bg-blue-50"
                        }`}
                      >
                        <RadioGroupItem value="global" id="global" />
                        <Label htmlFor="global" className="flex items-center gap-3 cursor-pointer flex-1">
                                <div className='flex items-center justify-between gap-3 cursor-pointer flex-1'>
                                  <div className='flex items-center justify-between gap-3 cursor-pointer'>
                                    <FileText
                                        className={`h-6 w-6 transition-opacity ${modalidadFacturacion === "global" ? "text-blue-600 opacity-100" : "text-blue-400 opacity-40"}`}
                                      />
                                    <div>
                                      <p className="font-semibold">Facturación Global</p>
                                      <p className="text-sm text-gray-600">
                                        Una factura por el total de la reserva al finalizar
                                      </p>
                                    </div>
                                  </div>

                                  <Badge className={` ${modalidadFacturacion === "global" ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200' }`}>
                                    CONTADO
                                  </Badge>
                              </div>
                        </Label>
                      </div>

                      <div
                        className={`flex items-center space-x-2 rounded-lg p-4 cursor-pointer transition-all ${
                          modalidadFacturacion === "individual"
                            ? "border-2 border-blue-500 bg-green-50"
                            : "border-2 border-gray-200 hover:bg-green-50"
                        }`}
                      >
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className='flex items-center justify-between gap-3 cursor-pointer flex-1'>
                                <div className='flex items-center justify-between gap-3 cursor-pointer'>
                                  <UserCheck
                                      className={`h-6 w-6 transition-opacity ${modalidadFacturacion === "individual" ? "text-green-600 opacity-100" : "text-green-400 opacity-40"}`}
                                    />
                                  <div>
                                    <p className="font-semibold">Facturación por pasajeros</p>
                                    <p className="text-sm text-gray-600">
                                      Factura individual generada después de que cada pasajero abone su parte
                                    </p>
                                  </div>
                                </div>

                                <Badge className={` ${modalidadFacturacion === "individual" ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200' }`}>
                                  CONTADO
                                </Badge>
                            </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                
                </div>
              </Card>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 py-5 text-gray-700 font-medium border border-gray-300 rounded-lg
                            cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Button>
              <Button
                type='button'
                disabled={isPending || !modalidadFacturacion}
                onClick={(e) => {
                  e.stopPropagation();

                  if (!modalidadFacturacion) {
                    handleShowToast('Debes seleccionar la modalidad de facturación', 'error');
                    return;
                  }

                  // {
                  //   "modalidad_facturacion": "global",
                  //   "condicion_pago": "credito"
                  // }

                  const payload: any = {};

                   if(modalidadFacturacion === 'credito'){
                      payload.modalidad_facturacion = 'global';
                      payload.condicion_pago = 'credito';
                    }
                    else{
                      payload.modalidad_facturacion = modalidadFacturacion;
                      payload.condicion_pago = 'contado';
                    }

                  // const payload = {
                  //   modalidad_facturacion 
                  // }

                  console.log(payload)
                  console.log(modalidadFacturacion)

                  onConfirm(payload);
                }}
                className="px-6 py-5 bg-green-600 text-white font-medium rounded-lg
                        cursor-pointer hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ?
                  <>
                      <Loader2Icon className="animate-spin w-4 h-4"/>
                      Confirmando...
                  </> :
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar modalidad
                  </>}
              </Button>
            </div>
        </div>
    </div>,
    document.body
  );
}
