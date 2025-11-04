/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2Icon } from "lucide-react"
import type { InvoiceData } from "@/types/invoice"
import { formatearFecha } from "@/helper/formatter"
import { useFacturaContext } from "@/context/FacturaContext"

interface InvoicePreviewProps {
  data: InvoiceData,
  onConfirm: () => void,
  isPending: boolean
}

export function DescargarFacturaPreview({ data, onConfirm, isPending }: InvoicePreviewProps) {
  const { reservaData, setActiveTab, selectedPasajeroId } = useFacturaContext();

  console.log(reservaData)
  console.log(selectedPasajeroId)

  const calculateItemTotal = (item: (typeof data.items)[0]) => {
    // Si es factura individual, usar precio unitario de la reserva
    if (selectedPasajeroId) {
      return reservaData.precio_unitario - item.discount
    }
    // Si es factura global, calcular con cantidad * precio
    return item.quantity * item.unitPrice - item.discount
  }

  const calculateSubtotal = () => {
    // Si es factura individual, retornar el precio unitario de la reserva
    if (selectedPasajeroId) {
      return reservaData.precio_unitario
    }
    // Si es factura global, sumar todos los items
    return data.items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const calculateTaxByType = (taxType: string) => {
    // Si es factura individual, retornar el precio unitario si el tipo de impuesto coincide
    if (selectedPasajeroId) {
      const item = data.items.find((item) => item.taxType === taxType)
      return item ? reservaData.precio_unitario : 0
    }
    // Si es factura global, filtrar y sumar por tipo de impuesto
    return data.items
      .filter((item) => item.taxType === taxType)
      .reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const calculateIVA = (taxType: string) => {
    const base = calculateTaxByType(taxType)
    console.log(base)
    if (taxType === "iva5") return base * 0.05
    if (taxType === "iva10") return base / 11
    return 0
  }

  console.log(calculateIVA("iva10"))

  const totalIVA = calculateIVA("iva5") + calculateIVA("iva10")
  const subtotal = calculateSubtotal()

  const handleDownload = () => {
    onConfirm();
  }

  return (
    <Card className="bg-white text-foreground">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-start border-b-2 border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                <span className="text-primary font-bold text-xs">GT</span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-primary">Group Tours</h2>
                <p className="text-xs text-muted-foreground">Agencia de Viajes</p>
              </div>
            </div>
            <p className="text-xs mt-2">Nuestra Señora de la Asunción 440, San Lorenzo, Paraguay</p>
            <p className="text-xs">Teléfono: 0971991960</p>
            <p className="text-xs">vhcubas91@gmail.com</p>
            <p className="text-xs">Actividad económica: Agencia de Viajes</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs">
              <strong>RUC:</strong> {data.ruc}
            </p>
            <p className="text-xs">
              <strong>Timbrado Nº:</strong> {data.timbrado}
            </p>
            <p className="text-xs">
              <strong>Fecha de Inicio de Vigencia:</strong> {formatearFecha(data.vigencyStartDate, false)}
            </p>
            <p className="text-sm font-bold mt-2">FACTURA ELECTRÓNICA</p>
            <p className="text-sm font-bold">{data.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs border-b border-border pb-4">
          <div className="space-y-1">
            <p>
              <strong>Fecha y hora de emisión:</strong> {new Date(data.emissionDate).toLocaleString()}
            </p>
            <p>
              <strong>Condición de venta:</strong> {data.saleCondition}
            </p>
            <p>
              <strong>Moneda:</strong> {data.currency}
            </p>
          </div>
          <div className="space-y-1">
            <p>
              <strong>RUC/Documento de identidad No:</strong> {data.customerRuc}
            </p>
            <p>
              <strong>Nombre o Razón Social:</strong> {data.customerName}
            </p>
            <p>
              <strong>Dirección:</strong> {data.customerAddress}
            </p>
            <p>
              <strong>Teléfono:</strong> {data.customerPhone}
            </p>
            <p>
              <strong>Correo Electrónico:</strong> {data.customerEmail}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto tabla-facturacion-preview">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-2 text-left">Cod</th>
                <th className="border border-border p-2 text-left">Descripción</th>
                <th className="border border-border p-2 text-center">Unidaed medida</th>
                <th className="border border-border p-2 text-center">Cantidad</th>
                <th className="border border-border p-2 text-right">Precio Unitario</th>
                <th className="border border-border p-2 text-right" colSpan={3}>
                  Descuento
                </th>
                <th className="border border-border p-2 text-right">Valor de Venta</th>
              </tr>
              <tr className="bg-muted">
                <th className="border border-border p-1" colSpan={5}></th>
                <th className="border border-border p-1 text-center text-[10px]">Exentas</th>
                <th className="border border-border p-1 text-center text-[10px]">5%</th>
                <th className="border border-border p-1 text-center text-[10px]">10%</th>
                <th className="border border-border p-1"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-border p-2">{item.code}</td>
                  <td className="border border-border p-2">{item.description}</td>
                  <td className="border border-border p-2 text-center">{item.unitMeasure}</td>
                  <td className="border border-border p-2 text-center">{selectedPasajeroId? '1': item.quantity}</td>
                  <td className="border border-border p-2 text-right">
                    {selectedPasajeroId ? reservaData.precio_unitario.toLocaleString() : item.unitPrice.toLocaleString()}
                  </td>
                  <td className="border border-border p-2 text-right">
                    {item.taxType === "exenta" ? item.discount : 0}
                  </td>
                  <td className="border border-border p-2 text-right">{item.taxType === "iva5" ? item.discount : 0}</td>
                  <td className="border border-border p-2 text-right">
                    {item.taxType === "iva10" ? item.discount : 0}
                  </td>
                  <td className="border border-border p-2 text-right">
                      {calculateItemTotal(item).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-bold">SUBTOTAL:</span>
            <span>{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">TOTAL DE LA OPERACIÓN:</span>
            <span>{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">TOTAL EN GUARANÍES:</span>
            <span>{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center border-t border-border pt-2">
            <span className="font-bold">LIQUIDACIÓN IVA:</span>
            <div className="flex gap-8">
              <span>(5%) {calculateTaxByType("iva5").toLocaleString()}</span>
              <span>(10%) {calculateTaxByType("iva10").toLocaleString()}</span>
              <span className="font-bold">TOTAL IVA: {totalIVA.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 text-[10px] text-muted-foreground space-y-2">
          <p className="font-semibold">
            Consulte la validez de esta Factura Electrónica con el número de CDC impreso abajo en:
          </p>
          <p className="text-primary">https://ekuatia.set.gov.py/consultas/</p>
          <p className="font-semibold mt-2">
            ESTE DOCUMENTO ES UNA REPRESENTACIÓN GRÁFICA DE UN DOCUMENTO ELECTRÓNICO (XML)
          </p>
          {reservaData && (
            <div className="italic mt-2 space-y-1">
              <p>Reserva asociada: {reservaData.codigo}</p>
              <p>Cantidad de pasajeros: {selectedPasajeroId ? '1' : reservaData.cantidad_pasajeros}</p>
              <p>Monto pagado: {reservaData.moneda?.simbolo || ''} {reservaData.monto_pagado?.toLocaleString()}</p>
              <p>Saldo pendiente: {reservaData.moneda?.simbolo || ''} {reservaData.saldo_pendiente?.toLocaleString()}</p>
            </div>
          )}
        </div>

        <Button 
            disabled={isPending}
            onClick={handleDownload} className="w-full px-6 py-5 bg-green-600 text-white font-medium rounded-lg
                      cursor-pointer hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" size="lg">
          
            {isPending ?
                  <>
                      <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                      generando..
                  </> :
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Generar factura
                  </>}
            {/* <Download className="h-4 w-4 mr-2" />
            Descargar Factura */}
        </Button>

        <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('form')}
              disabled={isPending}
              className="w-full px-6 py-5 text-gray-700 font-medium border border-gray-300 rounded-lg
                          cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Button>
      </CardContent>
    </Card>
  )
}
