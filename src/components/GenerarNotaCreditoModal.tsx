/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertCircle, CheckCircle2, FileText, Info, Loader2Icon, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Label } from './ui/label';
import { ToastContext } from '@/context/ToastContext';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { formatearSeparadorMiles } from '@/helper/formatter';


interface GenerarNotaCreditoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (modalidad: "total" | "parcial" | "credito") => void;
  isPending: boolean;
  reservaData: any; // Datos completos de la reserva desde el backend
  selectedPasajeroId?: number; // ID del pasajero específico para pago individual
}


const motivosNC = [
  { value: 1, label: "Devolución y Ajuste de precios (cancelación)" },
  { value: 2, label: "Devolución/Cancelación" },
  { value: 3, label: "Descuento" },
  { value: 4, label: "Bonificación" },
  { value: 5, label: "Crédito incobrable" },
  { value: 6, label: "Recupero de costo" },
  { value: 7, label: "Recupero de gasto" },
  { value: 8, label: "Ajuste de precio" },
]

export default function GenerarNotaCreditoModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  reservaData,
  selectedPasajeroId
}: GenerarNotaCreditoModalProps) {

  const [tipoNC, setTipoNC] = useState<"total" | "parcial" | "">("")

  const [motivo, setMotivo] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [monto, setMonto] = useState("")

  console.log(reservaData)

  console.log(selectedPasajeroId)

  // Calcular el monto base según si es por pasajero o global
  const montoBase = (() => {
    if (selectedPasajeroId) {
      // Nota de crédito por pasajero individual
      // Buscar el pasajero en el array de pasajeros
      const pasajero = reservaData?.pasajeros?.find((p: any) => p.id === selectedPasajeroId);
      return pasajero?.precio_asignado || reservaData?.precio_unitario || 0;
    } else {
      // Nota de crédito global (toda la reserva)
      return reservaData?.costo_total_estimado || 0;
    }
  })();

  const {handleShowToast} = useContext(ToastContext);

  if (!isOpen) return null;


  // ('1', 'Devolución y Ajuste de precios'),
  //     ('2', 'Devolución'),
  //     ('3', 'Descuento'),
  //     ('4', 'Bonificación'),
  //     ('5', 'Crédito incobrable'),
  //     ('6', 'Recupero de costo'),
  //     ('7', 'Recupero de gasto'),
  //     ('8', 'Ajuste de precio'),


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
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold">Generar Nota de Crédito</h2>
                          {selectedPasajeroId && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                              Por Pasajero
                            </Badge>
                          )}
                        </div>
                        <p className='pt-3 text-gray-500'>
                          {selectedPasajeroId
                            ? "La nota de crédito se generará para el pasajero seleccionado"
                            : "La nota de crédito se generará automáticamente y se asociará a la factura ya generada"}
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  

                  <div className="space-y-4 mt-6">
                    <Label className="text-lg font-semibold">Tipo de Nota de Crédito</Label>
                    <RadioGroup
                      value={tipoNC}
                      onValueChange={(value: any) => setTipoNC(value)}
                      className="space-y-4"
                    >
                      

                      <div
                        className={`mt-6 flex items-center space-x-2 rounded-lg p-4 cursor-pointer transition-all ${
                          tipoNC === "total"
                            ? "border-2 border-blue-500 bg-blue-50"
                            : "border-2 border-gray-200 hover:bg-blue-50"
                        }`}
                      >
                        <RadioGroupItem value="total" id="total" />
                        <Label htmlFor="total" className="flex items-center gap-3 cursor-pointer flex-1">
                                <div className='flex items-center justify-between gap-3 cursor-pointer flex-1'>
                                  <div className='flex items-center justify-between gap-3 cursor-pointer'>
                                    <FileText
                                        className={`h-6 w-6 transition-opacity ${tipoNC === "total" ? "text-blue-600 opacity-100" : "text-blue-400 opacity-40"}`}
                                      />
                                    <div>
                                      <p className="font-semibold">Nota de Crédito Total</p>
                                      <p className="text-sm text-gray-600">
                                        Anula completamente el saldo restante de la factura
                                      </p>
                                    </div>
                                  </div>

                                  <Badge className={` ${tipoNC === "total" ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200' }`}>
                                    TOTAL
                                  </Badge>
                              </div>
                        </Label>
                      </div>

                      <div
                        className={`flex items-center space-x-2 rounded-lg p-4 cursor-pointer transition-all ${
                          tipoNC === "parcial"
                            ? "border-2 border-blue-500 bg-green-50"
                            : "border-2 border-gray-200 hover:bg-green-50"
                        }`}
                      >
                        <RadioGroupItem value="parcial" id="parcial" />
                        <Label htmlFor="parcial" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className='flex items-center justify-between gap-3 cursor-pointer flex-1'>
                                <div className='flex items-center justify-between gap-3 cursor-pointer'>
                                  <UserCheck
                                      className={`h-6 w-6 transition-opacity ${tipoNC === "parcial" ? "text-green-600 opacity-100" : "text-green-400 opacity-40"}`}
                                    />
                                  <div>
                                    <p className="font-semibold">Nota de Crédito Parcial</p>
                                    <p className="text-sm text-gray-600">
                                      Acredita solo una parte del monto de la factura (especifique el monto abajo)
                                    </p>
                                  </div>
                                </div>

                                <Badge className={` ${tipoNC === "parcial" ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200' }`}>
                                  PARCIAL
                                </Badge>
                            </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                
                  {tipoNC === "parcial" && (
                    <div className="space-y-2">
                      <Label htmlFor="monto" className="text-base font-semibold">
                        Monto a Acreditar <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                        <Input
                          id="monto"
                          type="number"

                          placeholder="0.00"
                          value={monto}
                          onChange={(e) => setMonto(e.target.value)}
                          className="text-base pl-8 font-medium"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3" />
                        Máximo disponible: {formatearSeparadorMiles.format(montoBase)} {selectedPasajeroId ? "(precio del pasajero)" : "(total reserva)"}
                      </p>
                    </div>
                  )}

                  {/* Motivo */}
                  <div className="space-y-2">
                    <Label htmlFor="motivo" className="text-base font-semibold">
                      Motivo <span className="text-destructive">*</span>
                    </Label>
                    <Select value={motivo} onValueChange={setMotivo}>
                      <SelectTrigger id="motivo" className="text-base">
                        <SelectValue placeholder="Seleccione un motivo" />
                      </SelectTrigger>
                      <SelectContent className="z-[999999]">
                        {motivosNC.map((m) => (
                          <SelectItem key={m.value} value={String(m.value)} className="text-base">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Observaciones */}
                  <div className="space-y-2">
                    <Label htmlFor="observaciones" className="text-base font-semibold">
                      Observaciones
                    </Label>
                    <Textarea
                      id="observaciones"
                      placeholder="Información adicional sobre la nota de crédito (opcional)..."
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{observaciones.length}/500 caracteres</p>
                  </div>

                  <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-base">Resumen de la Operación</h4>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tipo de NC:</span>
                        <span className="font-semibold">{tipoNC === "total" ? "Total" : tipoNC === "parcial" ? "Parcial" : "No seleccionado"}</span>
                      </div>
                      {tipoNC && (
                        <>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-muted-foreground font-medium">Monto a acreditar:</span>
                            <span className="font-bold text-base text-destructive">
                              {tipoNC === "total" ? formatearSeparadorMiles.format(montoBase) : monto ? `${formatearSeparadorMiles.format(Number(monto))}` : "$0.00"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
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
                disabled={isPending || !tipoNC || !motivo || (tipoNC === "parcial" && !monto)}
                onClick={(e) => {
                  e.stopPropagation();

                  if (!tipoNC) {
                    handleShowToast('Debes seleccionar el tipo de nota de crédito', 'error');
                    return;
                  }

                  if (!motivo) {
                    handleShowToast('Debes seleccionar un motivo', 'error');
                    return;
                  }

                  if (tipoNC === "parcial" && !monto) {
                    handleShowToast('Debes ingresar el monto a acreditar', 'error');
                    return;
                  }

                  if (tipoNC === "parcial" && parseFloat(monto) > montoBase) {
                    handleShowToast(
                      `El monto no puede exceder ${formatearSeparadorMiles.format(montoBase)}`,
                      'error'
                    );
                    return;
                  }

                  if (tipoNC === "parcial" && parseFloat(monto) <= 0) {
                    handleShowToast('El monto debe ser mayor a cero', 'error');
                    return;
                  }

                  const payload: any = {
                    tipo_nota_credito: tipoNC,
                    motivo: parseInt(motivo),
                    observaciones: observaciones || '',
                  };

                  // 🆕 Para NC Parcial, construir el array de items según la especificación del backend
                  if (tipoNC === "parcial") {
                    payload.items = [
                      {
                        descripcion: observaciones || "Nota de crédito parcial",
                        cantidad: 1,
                        precio_unitario: parseFloat(monto)
                      }
                    ];
                  }

                  console.log('📦 Payload NC generado:', payload);

                  onConfirm(payload);
                }}
                className="px-6 py-5 bg-green-600 text-white font-medium rounded-lg
                        cursor-pointer hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ?
                  <>
                      <Loader2Icon className="animate-spin w-4 h-4"/>
                      generando...
                  </> :
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Generar NC
                  </>}
              </Button>
            </div>
        </div>
    </div>,
    document.body
  );
}
