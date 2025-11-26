/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { Moneda } from '@/types/reservas';
import { Users, CheckCircle2, Loader2Icon, DollarSign, Wallet, AlertCircle, CreditCard, Coins } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from '@radix-ui/react-label';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { IoCashOutline } from 'react-icons/io5';
import { formatearSeparadorMiles } from '@/helper/formatter';
import { createPortal } from 'react-dom';
import { Badge } from './ui/badge';
import { AlertEstadoCaja } from './caja/AlertEstadoCaja';
import { verificarUsuarioTieneCajaAbierta } from '@/components/utils/httpCajas';


interface PagoParcialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any, paymentType: "deposit" | "full") => void;
  isPendingPago: boolean;
  reservaData: any; // Datos completos de la reserva desde el backend
  selectedPassengerId?: number; // ID del pasajero específico para pago individual
}

export default function PagoParcialModal({
  isOpen,
  onClose,
  onConfirm,
  isPendingPago,
  reservaData,
  selectedPassengerId,
}: PagoParcialModalProps) {

  // Extraer datos necesarios de la reserva
  const seniaPorPersona = reservaData?.salida?.senia || 0;
  const cantidadPasajeros = reservaData?.cantidad_pasajeros || 0;
  const precioUnitario = reservaData?.precio_unitario || 0;
  const saldoPendiente = reservaData?.saldo_pendiente || 0;
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | 'cash'>("cash")

  console.log(reservaData)

  // Determinar si es modo individual o múltiple
  const isSinglePassengerMode = selectedPassengerId !== undefined;

  // Encontrar el índice del pasajero seleccionado
  const selectedPassengerIndex = isSinglePassengerMode
    ? reservaData?.pasajeros?.findIndex((p: any) => p.id === selectedPassengerId)
    : -1;

  // Estado para guardar información de la caja
  const [estadoCaja, setEstadoCaja] = useState<any>(null);
  const [loadingEstadoCaja, setLoadingEstadoCaja] = useState(false);

  // Verificar estado de caja cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setLoadingEstadoCaja(true);
      verificarUsuarioTieneCajaAbierta()
        .then((data) => {
          setEstadoCaja(data);
        })
        .catch((error) => {
          console.error('Error verificando estado de caja:', error);
          setEstadoCaja(null);
        })
        .finally(() => {
          setLoadingEstadoCaja(false);
        });
    }
  }, [isOpen]);

  // Obtener el saldo pendiente del pasajero seleccionado
  const getPassengerPendingBalance = (): number => {
    if (!isSinglePassengerMode || selectedPassengerIndex < 0) return 0;

    const pasajero = reservaData?.pasajeros?.[selectedPassengerIndex];
    return pasajero?.saldo_pendiente || 0;
  };

  // Calcular el saldo pendiente total de todos los pasajeros (para modo múltiple)
  const getTotalPendingBalance = (): number => {
    return reservaData?.pasajeros?.reduce((sum: number, pasajero: any) => {
      return sum + (pasajero?.saldo_pendiente || 0);
    }, 0) || 0;
  };

  const [passengerDeposits, setPassengerDeposits] = useState<string[]>(
    Array.from({ length: cantidadPasajeros }, (_, index) => {
      const pasajero = reservaData?.pasajeros?.[index];
      const saldoPendientePasajero = pasajero?.saldo_pendiente || 0;

      // Si el saldo pendiente es menor a la seña mínima, usar el saldo pendiente
      if (saldoPendientePasajero < seniaPorPersona && saldoPendientePasajero > 0) {
        return saldoPendientePasajero.toString();
      }

      // Si el saldo pendiente es mayor o igual a la seña, usar la seña mínima
      return seniaPorPersona.toString();
    })
  )

  // Estado para trackear errores de validación por pasajero
  const [validationErrors, setValidationErrors] = useState<boolean[]>(
    Array.from({ length: cantidadPasajeros }, () => false)
  )

  // Función helper para convertir string a número de forma segura
  const safeParseNumber = (value: string): number => {
    const numericValue = value.replace(/\D/g, ''); // Solo dígitos
    const parsed = Number(numericValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Función para parsear valor formateado y extraer solo números
  const parseFormattedValue = (value: string): string => {
    // Remover todos los caracteres que no sean dígitos
    return value.replace(/\D/g, '');
  };

  // Función para formatear valor con separador de miles
  const formatValueWithThousands = (value: string): string => {
    // Remover caracteres no numéricos
    const numericValue = value.replace(/\D/g, '');

    // Si está vacío, retornar vacío
    if (!numericValue) return '';

    // Convertir a número y formatear con separador de miles
    const number = safeParseNumber(numericValue);
    return number.toLocaleString('es-PY');
  };

  // Bloquear scroll del modal padre cuando PagoParcialModal está abierto
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

  // Resetear validaciones cuando cambia el tipo de pago
  useEffect(() => {
    // Limpiar todos los errores de validación
    setValidationErrors(Array.from({ length: cantidadPasajeros }, () => false));
  }, [paymentType, cantidadPasajeros]);

  // Calcular el total de depósitos
  const totalDepositAmount = isSinglePassengerMode && selectedPassengerIndex >= 0
    ? safeParseNumber(passengerDeposits[selectedPassengerIndex] || '0')
    : passengerDeposits.reduce((sum, amount, index) => {
        // Solo sumar montos de pasajeros que tienen saldo pendiente
        const pasajero = reservaData?.pasajeros?.[index];
        const saldoPendiente = pasajero?.saldo_pendiente || 0;

        if (saldoPendiente > 0) {
          return sum + safeParseNumber(amount || '0');
        }
        return sum;
      }, 0);

  const totalDepositRequired = isSinglePassengerMode ? seniaPorPersona : seniaPorPersona * cantidadPasajeros;

  const isValidDeposit = paymentType === 'full'
    ? true // En modo pago total, siempre es válido porque se paga el saldo completo
    : isSinglePassengerMode && selectedPassengerIndex >= 0
      ? safeParseNumber(passengerDeposits[selectedPassengerIndex] || '0') > 0 && !validationErrors[selectedPassengerIndex]
      : passengerDeposits.every((amount, index) => {
          const pasajero = reservaData?.pasajeros?.[index];
          const saldoPendientePasajero = pasajero?.saldo_pendiente || 0;
          const montoIngresado = safeParseNumber(amount || '0');

          // Si el pasajero no tiene saldo, no validar
          if (saldoPendientePasajero === 0) return true;

          // Validar que el monto sea mayor a 0 Y que no exceda el saldo pendiente
          return montoIngresado > 0 && !validationErrors[index];
        });

  // Manejar cambios en los inputs de seña por pasajero
  const handlePassengerDepositChange = (index: number, value: string) => {
    const newDeposits = [...passengerDeposits]
    const newErrors = [...validationErrors]

    // Parsear el valor para obtener solo números
    const numericValue = parseFormattedValue(value);

    // Permitir strings vacíos, así el usuario puede borrar todo el contenido
    newDeposits[index] = numericValue;

    // Validar que el monto no exceda el saldo pendiente
    const pasajero = reservaData?.pasajeros?.[index];
    const saldoPendientePasajero = pasajero?.saldo_pendiente || 0;
    const montoIngresado = safeParseNumber(numericValue || '0');

    // Marcar error si el monto excede el saldo pendiente
    newErrors[index] = montoIngresado > saldoPendientePasajero;

    setPassengerDeposits(newDeposits)
    setValidationErrors(newErrors)
  }

  // Función para generar el payload del pago
  const generarPayloadPago = () => {
    const distribuciones: Array<{ pasajero: number | string; monto: number }> = [];

    // Obtener el método de pago mapeado
    const metodosPagoMap: Record<string, string> = {
      'cash': 'efectivo',
      'card': 'tarjeta',
      'transfer': 'transferencia'
    };

    // Si es modo individual, solo generar distribución para el pasajero seleccionado
    if (isSinglePassengerMode && selectedPassengerIndex >= 0) {
      const pasajero = reservaData?.pasajeros?.[selectedPassengerIndex];
      const monto = paymentType === 'deposit'
        ? safeParseNumber(passengerDeposits[selectedPassengerIndex] || '0')
        : getPassengerPendingBalance(); // En pago total, pagar el saldo pendiente del pasajero

      distribuciones.push({
        pasajero: pasajero.id,
        monto
      });
    } else {
      // Modo múltiple: generar distribuciones solo para pasajeros con saldo pendiente
      reservaData?.pasajeros?.forEach((pasajero: any, index: number) => {
        const saldoPendientePasajero = pasajero?.saldo_pendiente || 0;

        // Solo agregar al payload si el pasajero tiene saldo pendiente
        if (saldoPendientePasajero > 0) {
          const monto = paymentType === 'deposit'
            ? safeParseNumber(passengerDeposits[index] || '0')
            : saldoPendientePasajero; // En pago total, usar el saldo pendiente de cada pasajero

          distribuciones.push({
            pasajero: pasajero.id,
            monto
          });
        }
      });
    }

    const payload: any = {
      metodo_pago: metodosPagoMap[paymentMethod] || 'efectivo',
      distribuciones
    };

    if(paymentType === 'full')
      payload.tipo = 'pago_total'
    else
      payload.tipo = 'pago_parcial'

    return payload;
  };


  const seniaTotal = reservaData?.seña_total;

  console.log('=== PagoParcialModal Props ===')
  console.log('reservaData:', reservaData)
  console.log('reservaData:', reservaData?.seña_total)
  console.log('seniaPorPersona:', seniaPorPersona)
  console.log('cantidadPasajeros:', cantidadPasajeros)
  console.log('precioUnitario:', precioUnitario)
  console.log('saldoPendiente:', saldoPendiente); 
  console.log('=== Payload Generado ===');
  console.log(JSON.stringify(generarPayloadPago(), null, 2));

  if (!isOpen) return null;


    const getPassengerLabel = (index: number): string => {
    const pasajero = reservaData?.pasajeros?.[index];

    if (!pasajero) {
      return `Pasajero ${index + 1}`;
    }

    const nombre = pasajero.persona.nombre;
    const apellido = pasajero.persona.apellido;
    const esTitular = pasajero.es_titular;

    // Si es "por asignar"
    if (nombre?.toLowerCase().includes('por asignar')) {
      return nombre;
    }

    // Nombre normal con indicador de titular
    return `${nombre} ${apellido}${esTitular ? ' (Titular)' : ''}`;
  }


  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 99999 }}
    >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Alert de Estado de Caja */}
            {!loadingEstadoCaja && estadoCaja && (
              <div className="px-6 pt-6">
                <AlertEstadoCaja
                  tieneCajaAbierta={estadoCaja.tiene_caja_abierta}
                  cajaNombre={estadoCaja.caja_nombre}
                  saldoActual={estadoCaja.saldo_actual}
                  notificacion={estadoCaja.notificacion}
                />
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              <Card className="p-8 bg-white border-2 border-blue-200 ">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4 ">
                    <h2 className="text-2xl font-bold">Opciones de Pago</h2>
                    <Badge className='bg-blue-100 text-blue-700 border-blue-200 text-xl font-bold'>
                      <Coins className="moneda h-10 w-10 text-2xl text-blue-600" /> <span>{reservaData?.paquete?.moneda?.nombre}</span>
                    </Badge>
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
                            <p className="font-semibold">Pago parcial</p>
                            <p className="text-sm text-gray-600">
                              {/* Pagar seña mínima de {formatearSeparadorMiles.format(seniaPorPersona * cantidadPasajeros)} (distribuida por pasajero) */}
                              Agregar un monto parcial distribuido por pasajero
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
                              {isSinglePassengerMode
                                ? `Pagar el saldo pendiente completo de ${formatearSeparadorMiles.format(getPassengerPendingBalance())} del pasajero`
                                : `Pagar el saldo pendiente completo de ${formatearSeparadorMiles.format(getTotalPendingBalance())}`
                              }
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
                        <h3 className="font-semibold text-lg">
                          {isSinglePassengerMode ? 'Pago Individual' : 'Distribución de Pago por Pasajero'}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {isSinglePassengerMode
                          ? 'Ingresa el monto que pagará este pasajero'
                          : 'Ingresa el monto que pagará cada pasajero. Puedes distribuir el pago como prefieras'
                        }
                      </p>

                      <div className="space-y-3">
                        {isSinglePassengerMode && selectedPassengerIndex >= 0 ? (
                          // Modo individual: mostrar solo el pasajero seleccionado
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4 bg-white rounded-lg p-4 border">
                              <Label className="font-medium min-w-[120px]">
                                {getPassengerLabel(selectedPassengerIndex)}:
                              </Label>
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-gray-600">$</span>
                                <Input
                                  type="text"
                                  value={formatValueWithThousands(passengerDeposits[selectedPassengerIndex])}
                                  onChange={(e) => handlePassengerDepositChange(selectedPassengerIndex, e.target.value)}
                                  className={`flex-1 ${validationErrors[selectedPassengerIndex] ? 'border-red-500 border-2' : ''}`}
                                  placeholder="0"
                                />
                              </div>
                              {!validationErrors[selectedPassengerIndex] && safeParseNumber(passengerDeposits[selectedPassengerIndex] || '0') <= 0 && (
                                <span className="text-red-600 text-sm">Debe ingresar un monto</span>
                              )}
                            </div>
                            {validationErrors[selectedPassengerIndex] && (
                              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>
                                  El monto ingresado ({formatearSeparadorMiles.format(safeParseNumber(passengerDeposits[selectedPassengerIndex] || '0'))})
                                  excede el saldo pendiente ({formatearSeparadorMiles.format(getPassengerPendingBalance())})
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Modo múltiple: mostrar todos los pasajeros
                          Array.from({ length: cantidadPasajeros }).map((_, index) => {
                            const pasajero = reservaData?.pasajeros?.[index];
                            const saldoPendientePasajero = pasajero?.saldo_pendiente || 0;
                            const tieneSaldo = saldoPendientePasajero > 0;
                            const tieneError = validationErrors[index];

                            return (
                              <div key={index} className="flex flex-col gap-2">
                                <div
                                  className={`flex items-center gap-4 rounded-lg p-4 border ${
                                    tieneSaldo ? 'bg-white' : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <Label className={`font-medium min-w-[120px] ${!tieneSaldo ? 'text-gray-400' : ''}`}>
                                    {getPassengerLabel(index)}:
                                  </Label>
                                  <div className="flex-1 flex items-center gap-2">
                                    <span className={`${!tieneSaldo ? 'text-gray-400' : 'text-gray-600'}`}>$</span>
                                    <Input
                                      type="text"
                                      disabled={!tieneSaldo}
                                      value={tieneSaldo ? formatValueWithThousands(passengerDeposits[index]) : formatearSeparadorMiles.format(precioUnitario)}
                                      onChange={(e) => handlePassengerDepositChange(index, e.target.value)}
                                      className={`flex-1 ${
                                        !tieneSaldo
                                          ? 'bg-gray-100 cursor-not-allowed'
                                          : tieneError
                                            ? 'border-red-500 border-2'
                                            : ''
                                      }`}
                                      placeholder="0"
                                    />
                                  </div>
                                  {tieneSaldo && !tieneError && safeParseNumber(passengerDeposits[index] || '0') <= 0 && (
                                    <span className="text-red-600 text-sm">Debe ingresar un monto</span>
                                  )}
                                  {tieneSaldo && !tieneError && safeParseNumber(passengerDeposits[index] || '0') > 0 && (
                                    <span className="text-gray-600 text-sm">Saldo: {formatearSeparadorMiles.format(saldoPendientePasajero)}</span>
                                  )}
                                  {!tieneSaldo && (
                                    <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                      <CheckCircle2 className="h-4 w-4" />
                                      Pagado
                                    </span>
                                  )}
                                </div>
                                {tieneError && tieneSaldo && (
                                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>
                                      El monto ingresado ({formatearSeparadorMiles.format(safeParseNumber(passengerDeposits[index] || '0'))})
                                      excede el saldo pendiente ({formatearSeparadorMiles.format(saldoPendientePasajero)})
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="border-t border-blue-200 pt-4 mt-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">
                            {!isSinglePassengerMode && getTotalPendingBalance() < totalDepositRequired && getTotalPendingBalance() > 0
                              ? 'Saldo Pendiente Total:'
                              : 'Total a Pagar:'}
                          </span>
                          <span className={`text-3xl font-bold ${totalDepositAmount > 0 ? "text-green-600" : "text-red-600"}`}>
                            {(() => {
                              // Modo individual
                              if (isSinglePassengerMode) {
                                const saldoPasajero = getPassengerPendingBalance();
                                // Si el saldo pendiente es menor a la seña mínima, mostrar el saldo pendiente
                                if (saldoPasajero < seniaPorPersona && saldoPasajero > 0) {
                                  return formatearSeparadorMiles.format(saldoPasajero);
                                }
                                // Caso normal: mostrar el monto ingresado
                                return formatearSeparadorMiles.format(totalDepositAmount);
                              }

                              // Modo múltiple/distribución
                              const saldoTotal = getTotalPendingBalance();
                              // Si el saldo pendiente total es menor a la seña total, mostrar el saldo pendiente
                              if (saldoTotal < seniaTotal && saldoTotal > 0) {
                                return formatearSeparadorMiles.format(saldoTotal);
                              }
                              // Caso normal: mostrar el total a pagar calculado
                              return formatearSeparadorMiles.format(totalDepositAmount);
                            })()}
                          </span>

                        </div>

                        {!isValidDeposit && (
                          <p className="text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Debes ingresar al menos un monto mayor a 0
                          </p>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mt-4 bg-white rounded p-3">
                        {isSinglePassengerMode ? (
                          <>
                            <p>Precio total del paquete por persona: {formatearSeparadorMiles.format(precioUnitario)}</p>
                            <p>Saldo pendiente actual: {formatearSeparadorMiles.format(getPassengerPendingBalance())}</p>
                            {getPassengerPendingBalance() < seniaPorPersona && getPassengerPendingBalance() > 0 && (
                              <p className="font-medium mt-2 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                El saldo pendiente es menor a la seña mínima
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p>Saldo total pendiente: {formatearSeparadorMiles.format(getTotalPendingBalance())}</p>
                            <p>Seña mínima requerida: {formatearSeparadorMiles.format(totalDepositRequired)}</p>
                            {getTotalPendingBalance() < totalDepositRequired && getTotalPendingBalance() > 0 && (
                              <p className="text-amber-600 font-medium mt-2 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                El saldo pendiente total es menor a la seña mínima
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Wallet className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-lg">
                          {isSinglePassengerMode ? 'Pago Total del Pasajero' : 'Pago Total del Paquete'}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {isSinglePassengerMode
                          ? 'Paga el saldo pendiente completo de este pasajero.'
                          : 'Paga el saldo pendiente de cada pasajero que tenga deuda.'
                        }
                      </p>

                      {/* Mostrar inputs por pasajero en modo múltiple */}
                      {!isSinglePassengerMode && (
                        <div className="space-y-3 mb-4">
                          {Array.from({ length: cantidadPasajeros }).map((_, index) => {
                            const pasajero = reservaData?.pasajeros?.[index];
                            const saldoPendientePasajero = pasajero?.saldo_pendiente || 0;
                            const tieneSaldo = saldoPendientePasajero > 0;

                            return (
                              <div
                                key={index}
                                className={`flex items-center gap-4 rounded-lg p-4 border ${
                                  tieneSaldo ? 'bg-white border-green-300' : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <Label className={`font-medium min-w-[120px] ${!tieneSaldo ? 'text-gray-400' : ''}`}>
                                  {getPassengerLabel(index)}:
                                </Label>
                                <div className="flex-1 flex items-center gap-2">
                                  <span className={`${!tieneSaldo ? 'text-gray-400' : 'text-gray-600'}`}>$</span>
                                  <Input
                                    type="number"
                                    disabled={!tieneSaldo}
                                    value={tieneSaldo ? saldoPendientePasajero : precioUnitario}
                                    readOnly
                                    className={`flex-1 bg-red-300 ${!tieneSaldo ? 'bg-gray-100 cursor-not-allowed' : 'bg-green-50'}`}
                                  />
                                </div>
                                {!tieneSaldo && (
                                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Pagado
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="bg-white rounded-lg p-6 border-2 border-green-300">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold">Monto Total:</span>
                          <span className="text-4xl font-bold text-green-600">
                            {formatearSeparadorMiles.format(
                              isSinglePassengerMode
                                ? getPassengerPendingBalance()
                                : getTotalPendingBalance()
                            )}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1 bg-green-50 rounded p-3">
                          {isSinglePassengerMode ? (
                            <>
                              <p>
                                Saldo pendiente del pasajero: {formatearSeparadorMiles.format(getPassengerPendingBalance())}
                              </p>
                              <p className="font-semibold text-green-700 mt-2">
                                Al pagar el saldo completo, este pasajero quedará al día.
                              </p>
                            </>
                          ) : (
                            <>
                              <p>
                                Saldo pendiente total de todos los pasajeros: {formatearSeparadorMiles.format(getTotalPendingBalance())}
                              </p>
                              <p className="font-semibold text-green-700 mt-2">
                                Al pagar el total, todos los pasajeros quedarán al día.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

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
                Cancelar
              </Button>
              <Button
                type='button'
                disabled={isPendingPago || !isValidDeposit}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(generarPayloadPago())
                  onConfirm(generarPayloadPago(), paymentType)
                }}
                className="px-6 py-5 bg-green-600 text-white font-medium rounded-lg
                        cursor-pointer hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPendingPago ?
                  <>
                      <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                      Procesando pago...
                  </> :
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar pago
                  </>}
              </Button>
            </div>
        </div>
    </div>,
    document.body
  );
}
