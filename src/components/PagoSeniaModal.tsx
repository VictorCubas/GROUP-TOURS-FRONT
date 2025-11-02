/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { Moneda } from '@/types/reservas';
import { Users, CheckCircle2, Loader2Icon, DollarSign, Wallet, AlertCircle, CreditCard, FileText, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from '@radix-ui/react-label';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { use, useState } from 'react';
import { Input } from './ui/input';
import { IoCashOutline } from 'react-icons/io5';
import { formatearSeparadorMiles } from '@/helper/formatter';
import { ToastContext } from '@/context/ToastContext';


interface PagoSeniaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any, aymentType: "deposit" | "full") => void;
  reservationData: any;
  isPendingPagarSenia: boolean;
  reservationResponse: any;
  seniaPorPersona: number;
  cantidadActualPasajeros: number;
  precioFinalPorPersona: number;
  selectedPasajerosData: any;
  titular: any
}

export default function PagoSeniaModal({
  isOpen,
  onClose,
  onConfirm,
  reservationData,
  isPendingPagarSenia,
  reservationResponse,
  seniaPorPersona,
  cantidadActualPasajeros,
  precioFinalPorPersona,
  selectedPasajerosData,
  titular
}: PagoSeniaModalProps) {
  const {handleShowToast} = use(ToastContext);
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit")
  const [modalidadFacturacion, setModalidadFacturacion] = useState<"global" | "individual" | "">("")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | 'cash'>("cash")
  const [passengerDeposits, setPassengerDeposits] = useState<string[]>(
    Array.from({ length: cantidadActualPasajeros }, () => seniaPorPersona.toString())
  )

  // Calcular el total de depósitos
  const totalDepositAmount = passengerDeposits.reduce((sum, amount) => sum + Number(amount || 0), 0)
  const totalDepositRequired = seniaPorPersona * cantidadActualPasajeros
  const isValidDeposit = passengerDeposits.every(amount => Number(amount || 0) >= seniaPorPersona)

  // Manejar cambios en los inputs de seña por pasajero
  const handlePassengerDepositChange = (index: number, value: string) => {
    const newDeposits = [...passengerDeposits]
    // Permitir strings vacíos, así el usuario puede borrar todo el contenido
    newDeposits[index] = value
    setPassengerDeposits(newDeposits)
  }

  // Función para generar el payload del pago de seña
  const generarPayloadPago = () => {
    console.log(reservationResponse?.pasajeros);
    console.log(cantidadActualPasajeros);
    console.log(selectedPasajerosData);
    const titularViaja = reservationResponse?.pasajeros?.some((p: any) => p.es_titular);
    const distribuciones: Array<{ pasajero: number | string; monto: number }> = [];

    // Obtener el método de pago mapeado
    const metodosPagoMap: Record<string, string> = {
      'cash': 'efectivo',
      'card': 'tarjeta',
      'transfer': 'transferencia'
    };

    // Contador para pasajeros pendientes
    let contadorPendientes = 1;

    for (let index = 0; index < cantidadActualPasajeros; index++) {
      const monto = Number(passengerDeposits[index] || 0);

      if (titularViaja) {
        // Caso 1: El titular SÍ viaja
        if (index === 0) {
          // El primer pasajero es el titular
          const pasajeroTitular = reservationResponse?.pasajeros?.find((p: any) => p.es_titular);
          if (pasajeroTitular?.id) {
            distribuciones.push({ pasajero: pasajeroTitular.id, monto: paymentType === 'deposit' ? monto : precioFinalPorPersona });
          } else {
            distribuciones.push({ pasajero: `pendiente_${contadorPendientes++}`, monto: paymentType === 'deposit' ? monto : precioFinalPorPersona });
          }
        } else {
          // Los demás pasajeros
          const pasajeroIndex = index - 1;
          const pasajero = selectedPasajerosData?.[pasajeroIndex];
          const pasajeroEnReserva = reservationResponse?.pasajeros?.find(
            (p: any) => {
              console.log(p)
              return !p.es_titular && p.persona.id === pasajero?.id
            }
          );

          console.log(pasajeroEnReserva)

          if (pasajeroEnReserva?.id) {
            distribuciones.push({ pasajero: pasajeroEnReserva.id, monto: paymentType === 'deposit' ? monto : precioFinalPorPersona });
          } else {
            distribuciones.push({ pasajero: `pendiente_${contadorPendientes++}`, monto: paymentType === 'deposit' ? monto : precioFinalPorPersona });
          }
        }
      } else {
        // Caso 2: El titular NO viaja
        const pasajero = selectedPasajerosData?.[index];
        const pasajeroEnReserva = reservationResponse?.pasajeros?.find(
          (p: any) => p.persona === pasajero?.id
        );

        if (pasajeroEnReserva?.id) {
          distribuciones.push({ pasajero: pasajeroEnReserva.id, monto: paymentType === 'deposit' ? monto : precioFinalPorPersona });
        } else {
          distribuciones.push({ pasajero: `pendiente_${contadorPendientes++}`, monto: paymentType === 'deposit' ? monto : precioFinalPorPersona});
        }
      }
    }

    const payload: any = {
      metodo_pago: metodosPagoMap[paymentMethod] || 'efectivo',
      // referencia: `${metodosPagoMap[paymentMethod].toUpperCase()}-${Date.now()}`,
      distribuciones
    };

    if(paymentType === 'full')
      payload.tipo = 'pago_total'


    if(!modalidadFacturacion)
      return null


    payload.modalidad_facturacion = modalidadFacturacion;

    return payload;
  };

  console.log('=== PagoSeniaModal Props ===')
  console.log('reservationData:', reservationData)
  console.log('reservationResponse:', reservationResponse)
  console.log('seniaPorPersona:', seniaPorPersona)
  console.log('cantidadActualPasajeros:', cantidadActualPasajeros)
  console.log('precioFinalPorPersona:', precioFinalPorPersona)
  console.log('selectedPasajerosData:', selectedPasajerosData);
  console.log('titular:', titular);
  console.log('Titular viaja?:', reservationResponse?.pasajeros?.some((p: any) => p.es_titular));
  console.log('=== Payload Generado ===');
  console.log(JSON.stringify(generarPayloadPago(), null, 2));

  if (!isOpen) return null;


    const getPassengerLabel = (index: number): string => {
    // Verificar si hay un titular que viaja (es_titular en el array de pasajeros de la reserva)
    const titularViaja = reservationResponse?.pasajeros?.some((p: any) => p.es_titular);

    if (titularViaja) {
      // Caso 1: El titular SÍ viaja
      // El titular está en index 0, los demás pasajeros en 1, 2, 3...
      if (index === 0 && titular) {
        return `${titular.nombre} ${titular.apellido} (Titular)`;
      }

      // Para los demás pasajeros, usar selectedPasajerosData
      if (selectedPasajerosData && selectedPasajerosData.length > 0) {
        const pasajeroIndex = index - 1; // Ajustamos el índice porque el titular ocupa la posición 0
        if (pasajeroIndex >= 0 && pasajeroIndex < selectedPasajerosData.length) {
          const pasajero = selectedPasajerosData[pasajeroIndex];
          return `${pasajero.nombre} ${pasajero.apellido}`;
        }
      }
    } else {
      // Caso 2: El titular NO viaja
      // Todos los pasajeros vienen de selectedPasajerosData (sin titular)
      if (selectedPasajerosData && selectedPasajerosData.length > 0) {
        if (index >= 0 && index < selectedPasajerosData.length) {
          const pasajero = selectedPasajerosData[index];
          return `${pasajero.nombre} ${pasajero.apellido}`;
        }
      }
    }

    // Fallback si no hay datos - pasajero por asignar
    return `Pasajero ${index + 1} (Por asignar)`;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white/95 rounded-xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
            <Card className="border-2 border-green-200 bg-green-50/30 p-6 md:p-8">
              <div className="mb-6 flex flex-col items-center text-center">
                <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />
                <h1 className="mb-2 text-2xl font-bold text-green-900">¡Reserva Creada Exitosamente!</h1>
                <p className="text-gray-600">
                  Tu número de reserva es: <span className="font-mono font-bold text-green-700">{reservationData.codigo}</span>
                </p>

                <div className="mb-6 flex justify-center items-center text-center mt-2 gap-1">
                  <span className="text-sm font-medium text-green-800">Estado actual:</span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    {reservationData?.estado_display || 'PENDIENTE DE SEÑA'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              <Card className="p-8 bg-white border-2 border-blue-200 ">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4 ">
                    <h2 className="text-2xl font-bold">Opciones de Pago</h2>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>

                  <div className="space-y-4 mt-6">
                    <Label className="text-lg font-semibold">Tipo de Pago</Label>
                    <RadioGroup value={paymentType} onValueChange={(value: any) => setPaymentType(value)} className="space-y-4">
                      <div
                        className={`mt-6 flex items-center space-x-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentType === "deposit"
                            ? "border-2 border-blue-500 bg-blue-50"
                            : "border-2 border-gray-200 hover:bg-blue-50"
                        }`}
                      >
                        <RadioGroupItem value="deposit" id="deposit" />
                        <Label htmlFor="deposit" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Users
                            className={`h-6 w-6 transition-opacity ${paymentType === "deposit" ? "text-blue-600 opacity-100" : "text-blue-400 opacity-40"}`}
                          />
                          <div>
                            <p className="font-semibold">Pago de Seña</p>
                            <p className="text-sm text-gray-600">
                              {/* Pagar seña mínima de ${data.totalDeposit.toLocaleString("es-AR")} (distribuida por pasajero) */}
                              Pagar seña mínima de {formatearSeparadorMiles.format(seniaPorPersona * cantidadActualPasajeros)} (distribuida por pasajero)
                            </p>
                          </div>
                        </Label>
                      </div>

                      <div
                        className={`flex items-center space-x-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentType === "full"
                            ? "border-2 border-blue-500 bg-green-50"
                            : "border-2 border-gray-200 hover:bg-green-50"
                        }`}
                      >
                        <RadioGroupItem value="full" id="full" />
                        <Label htmlFor="full" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Wallet
                            className={`h-6 w-6 transition-opacity ${paymentType === "full" ? "text-green-600 opacity-100" : "text-green-400 opacity-40"}`}
                          />
                          <div>
                            <p className="font-semibold">Pago Total</p>
                            <p className="text-sm text-gray-600">
                              Pagar el monto completo de {formatearSeparadorMiles.format(precioFinalPorPersona * cantidadActualPasajeros)}
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
 
                  {paymentType === "deposit" ? (
                    <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">Distribución de Seña por Pasajero</h3>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        Cada pasajero debe pagar un mínimo de <strong>{formatearSeparadorMiles.format(seniaPorPersona)}</strong>,
                        pero puede señar más si lo desea.
                      </p>

                      <div className="space-y-3">
                        {Array.from({ length: cantidadActualPasajeros }).map((_, index) => (
                          <div key={index} className="flex items-center gap-4 bg-white rounded-lg p-4 border">
                            <Label className="font-medium min-w-[120px]">
                              {getPassengerLabel(index)}:
                            </Label>
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-gray-600">$</span>
                              <Input
                                type="number"
                                min={seniaPorPersona}
                                value={passengerDeposits[index]}
                                onChange={(e) => handlePassengerDepositChange(index, e.target.value)}
                                className="flex-1"
                              />
                            </div>
                            {Number(passengerDeposits[index] || 0) < seniaPorPersona && (
                              <span className="text-red-600 text-sm">Mínimo: {formatearSeparadorMiles.format(seniaPorPersona)}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-blue-200 pt-4 mt-4 space-y-2">
                        <div className="flex justify-between items-center text-gray-700">
                          <span>Seña mínima total:</span>
                          <span className="font-semibold">{formatearSeparadorMiles.format(totalDepositRequired)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">Total a Pagar:</span>
                          <span
                            className={`text-3xl font-bold ${totalDepositAmount >= totalDepositRequired ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatearSeparadorMiles.format(totalDepositAmount)}
                          </span>
                        </div>

                        {!isValidDeposit && (
                          <p className="text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Todos los pasajeros deben pagar al menos el mínimo requerido
                          </p>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mt-4 bg-white rounded p-3">
                        <p>Precio total del paquete: {formatearSeparadorMiles.format(precioFinalPorPersona * cantidadActualPasajeros)}</p>
                        <p>Saldo restante: {formatearSeparadorMiles.format((precioFinalPorPersona * cantidadActualPasajeros) - totalDepositAmount)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Wallet className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-lg">Pago Total del Paquete</h3>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        Paga el monto completo del paquete y confirma tu reserva inmediatamente.
                      </p>

                      <div className="bg-white rounded-lg p-6 border-2 border-green-300">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold">Monto Total:</span>
                          <span className="text-4xl font-bold text-green-600">{formatearSeparadorMiles.format(precioFinalPorPersona * cantidadActualPasajeros)}</span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1 bg-green-50 rounded p-3">
                          <p>
                            Precio por persona: {precioFinalPorPersona} x {cantidadActualPasajeros} personas
                          </p>
                          <p className="font-semibold text-green-700 mt-2">
                            Al pagar el total, tu reserva se confirmará automáticamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}


                  <div className="space-y-4 mt-6">
                    <Label className="text-lg font-semibold">Modalidad de facturación</Label>
                    <RadioGroup value={modalidadFacturacion} onValueChange={(value: any) => setModalidadFacturacion(value)} className="space-y-4">
                      <div
                        className={`mt-6 flex items-center space-x-2 rounded-lg p-4 cursor-pointer transition-all ${
                          modalidadFacturacion === "global"
                            ? "border-2 border-blue-500 bg-blue-50"
                            : "border-2 border-gray-200 hover:bg-blue-50"
                        }`}
                      >
                        <RadioGroupItem value="global" id="global" />
                        <Label htmlFor="global" className="flex items-center gap-3 cursor-pointer flex-1">
                          <FileText
                            className={`h-6 w-6 transition-opacity ${modalidadFacturacion === "global" ? "text-blue-600 opacity-100" : "text-blue-400 opacity-40"}`}
                          />
                          <div>
                            <p className="font-semibold">Facturación Global</p>
                            <p className="text-sm text-gray-600">
                              Una factura por el total de la reserva al finalizar
                            </p>
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
                          <UserCheck
                            className={`h-6 w-6 transition-opacity ${modalidadFacturacion === "individual" ? "text-green-600 opacity-100" : "text-green-400 opacity-40"}`}
                          />
                          <div>
                            <p className="font-semibold">Facturación por pasajeros</p>
                            <p className="text-sm text-gray-600">
                              Factura individual generada después de que cada pasajero abone su parte
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Método de Pago</Label>
                    <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)} className="space-y-4">
                      <div
                        className={`flex items-center space-x-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === "cash"
                            ? "border-2 border-blue-500 bg-gray-50"
                            : "border-2 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                          <IoCashOutline
                            className={`h-5 w-5 transition-opacity ${paymentMethod === "cash" ? "text-blue-600 opacity-100" : "text-gray-400 opacity-40"}`}
                          />
                          Efectivo
                        </Label>
                      </div>

                      <div
                        className={`flex items-center space-x-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === "card"
                            ? "border-2 border-blue-500 bg-gray-50"
                            : "border-2 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                          <CreditCard
                            className={`h-5 w-5 transition-opacity ${paymentMethod === "card" ? "text-blue-600 opacity-100" : "text-gray-400 opacity-40"}`}
                          />
                          Tarjeta de Crédito/Débito
                        </Label>
                      </div>

                      <div
                        className={`flex items-center space-x-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === "transfer"
                            ? "border-2 border-blue-500 bg-gray-50"
                            : "border-2 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label htmlFor="transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                          <DollarSign
                            className={`h-5 w-5 transition-opacity ${paymentMethod === "transfer" ? "text-blue-600 opacity-100" : "text-gray-400 opacity-40"}`}
                          />
                          Transferencia Bancaria
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
                Omitir y dejar en pendiente
              </Button>
              <Button
                type='button'
                disabled={isPendingPagarSenia}
                onClick={(e) => {
                  e.stopPropagation();
                  
                  if(!modalidadFacturacion){
                    handleShowToast('### Debes seleccionar la modalidad de facturación', 'error');
                    return;
                  }
                  else{
                    console.log('generarPayloadPago(): ', generarPayloadPago());
                    const payload = generarPayloadPago();
                    console.log(payload)
                    if(payload)
                      onConfirm(generarPayloadPago(), paymentType)
                  }
                  
                }}
                className="px-6 py-5 bg-green-600 text-white font-medium rounded-lg
                        cursor-pointer hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                {isPendingPagarSenia ? 
                  <>
                      <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                      Pagando...
                  </> : 
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar pago
                  </>}
              </Button> 
            </div>
        </div>
    </div>
  );
}
