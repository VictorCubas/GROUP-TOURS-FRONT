/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Controller, useForm } from "react-hook-form"
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchDataTodo } from "./utils/httpTipoDocumentos"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"

export interface ClienteFacturaData {
  nombre: string;
  ruc: string;
  email: string;
  telefono?: string;
  direccion?: string;
  tipo_documento?: string;
}

interface InfoFacturaTitularProps {
  onInvoiceGenerated: (data: ClienteFacturaData) => void;
  isPending: boolean;
  onClose: () => void;
}

export function InfoFacturaTitular({ onInvoiceGenerated, isPending, onClose }: InfoFacturaTitularProps) {
  const [tipoDocumentoSelected, setTipoDocumentoSelected] = useState<any>();
  
  const {control,  register, watch, handleSubmit, setValue, formState: {errors, },clearErrors, reset} = useForm<ClienteFacturaData>({
    mode: "onBlur",
    defaultValues: {
      nombre: '',
      ruc: '',
      email: '',
      telefono: '',
      direccion: '',
      tipo_documento: ''
    }
  });

  const onSubmit = async (data: ClienteFacturaData) => {
    console.log(data)
    onInvoiceGenerated(data);
  };


  const {data: dataTipoDocumentoList, isFetching: isFetchingTipoDocumento,} = useQuery({
      queryKey: ['tipo-documentos-de-personas',], //data cached
      queryFn: () => fetchDataTodo(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });


  console.log('dataTipoDocumentoList:', dataTipoDocumentoList)
  console.log('isFetchingTipoDocumento:', isFetchingTipoDocumento)
  console.log('Es array?:', Array.isArray(dataTipoDocumentoList))
  console.log('Longitud:', dataTipoDocumentoList?.length)

  console.log(tipoDocumentoSelected)

  return (
    <form
        id="facturaForm"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="nombre" className="text-gray-700 font-medium">
                  Nombre / Razón social *
                </Label>
                <Input
                  id="nombre"
                  autoComplete="name"
                  placeholder="Nombre completo o razón social"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  {...register('nombre', {
                    required: 'Este campo es requerido',
                    validate: {
                      notBlank: (value) => value.trim().length > 0 || 'El nombre no puede estar vacío'
                    },
                    minLength: {
                      value: 3,
                      message: 'El nombre debe tener mínimo 3 caracteres'
                    }
                  })}
                />
                {errors.nombre && (
                  <span className='text-red-400 text-sm'>{errors.nombre.message}</span>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="tipo_documento" className="text-gray-700 font-medium">
                  Tipo Documento *
                </Label>

                {isFetchingTipoDocumento && (
                  <div className="w-full"> {/* Contenedor adicional para controlar el ancho */}
                    <Select>
                      <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 flex">
                      <div className="w-full flex items-center justify-center">
                        <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                      </div>
                      </SelectTrigger>
                    </Select>
                  </div>
                )}

                {!isFetchingTipoDocumento && 
                  <Controller
                    name="tipo_documento"
                    control={control}
                    rules={{ required: "Este campo es requerido" }}
                    render={({ field }) => (
                      <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            if (value) {
                              clearErrors("tipo_documento")
                            }

                            console.log('value: ', value);
                            const tipoDocumento = dataTipoDocumentoList.filter((doc: any) => doc.id.toString() === value)
                            console.log('tipo_documento 1: ', tipoDocumento[0])
                            setTipoDocumentoSelected(tipoDocumento[0]);
                          }}
                          onOpenChange={(open) => {
                            if (!open && !field.value) {
                              field.onBlur(); 
                            }
                          }}
                        >
                          <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-left">
                            <SelectValue placeholder="Selecciona el tipo de documento" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="min-w-[var(--radix-select-trigger-width)] max-h-60 z-[100000]"
                          >
                            {dataTipoDocumentoList && dataTipoDocumentoList.length > 0 ? (
                              dataTipoDocumentoList.map((data: any) => (
                                <SelectItem
                                  key={data.id}
                                  value={data.id.toString()}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                    {data.nombre}
                                </div>
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-4 text-center text-gray-500 text-sm">
                                No hay tipos de documento disponibles
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                }

                {errors.tipo_documento && (
                  <p className="text-red-400 text-sm">{errors.tipo_documento.message as string}</p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="ruc" className="text-gray-700 font-medium">
                  CI / RUC *
                </Label>
                <Input
                  id="ruc"
                  autoComplete="off"
                  placeholder="Ej: 80000000-0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  {...register('ruc', {
                    required: 'Este campo es requerido',
                    minLength: {
                      value: 3,
                      message: 'El RUC debe tener mínimo 3 caracteres'
                    }
                  })}
                />
                {errors.ruc && (
                  <span className='text-red-400 text-sm'>{errors.ruc.message}</span>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-gray-700 font-medium">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="Ej: 0981234567"
                autoComplete="tel"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                {...register('telefono')}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Correo *
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ejemplo@correo.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register('email', {
                required: 'Este campo es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Correo electrónico inválido'
                }
              })}
            />
            {errors.email && (
              <span className='text-red-400 text-sm'>{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion" className="text-gray-700 font-medium">Dirección</Label>
            <Input
              id="direccion"
              placeholder="Dirección del cliente"
              autoComplete="street-address"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register('direccion')}
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="px-6 py-5 text-gray-700 font-medium border border-gray-300 rounded-lg
                          cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="px-6 py-5 bg-green-600 text-white font-medium rounded-lg
                      cursor-pointer hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Generando...' : 'Generar Factura'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
