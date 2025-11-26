/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Controller, useForm } from "react-hook-form"
import { useQuery } from '@tanstack/react-query';
import { fetchDataTodo } from "./utils/httpTipoDocumentos"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Loader2Icon } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useFacturaContext } from "@/context/FacturaContext"
import { getPrimerNombreApellido } from "@/helper/formatter"

export interface ClienteFacturaData {
  nombre: string;
  ruc: string;
  email: string;
  telefono?: string;
  direccion?: string;
  tipo_documento?: string;
  factura_nombre?: string;
  documento_original: string;
  algunValorHaCambiado?: boolean;
}


export interface Titular {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  tipo_documento: number;
  tipo_documento_nombre: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string; // formato ISO (YYYY-MM-DD)
  sexo: 'M' | 'F' | string; // en caso de que haya otros valores
  sexo_display: string;
  nacionalidad: number;
  nacionalidad_nombre: string;
}

export interface PasajeroPersona {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  tipo_documento?: number;
  tipo_documento_nombre?: string;
  nacionalidad_nombre?: string;
  genero_display?: string;
  fecha_nacimiento?: string;
}

interface InfoFacturaTitularProps {
  onInvoiceGenerated: (data: ClienteFacturaData) => void;
  isPending: boolean;
  onClose: () => void;
  titular: Titular;
  selectedPasajeroId?: number;
  pasajeroSeleccionado?: PasajeroPersona; // Persona del pasajero seleccionado
}

export function FormularioFacturaTitular({
  onInvoiceGenerated,
  isPending,
  onClose,
  titular,
  selectedPasajeroId,
  pasajeroSeleccionado
}: InfoFacturaTitularProps) {
  const [tipoDocumentoSelected, setTipoDocumentoSelected] = useState<any>();
  const { formData, activeTab } = useFacturaContext();

  // Determinar si es facturación individual (por pasajero) o global (por titular)
  const esFacturacionIndividual = Boolean(selectedPasajeroId);
  const personaBase = esFacturacionIndividual ? pasajeroSeleccionado : titular;

  const {control,  register, handleSubmit, watch, setValue, formState: {errors, }, clearErrors, reset, trigger } = useForm<ClienteFacturaData>({
    mode: "onBlur",
    defaultValues: {
      nombre: '',
      ruc: '',
      email: '',
      telefono: '',
      direccion: '',
      tipo_documento: '',
      documento_original: '',
      factura_nombre: esFacturacionIndividual ? 'pasajero' : 'titular',
    }
  });

  const {data: dataTipoDocumentoList, isFetching: isFetchingTipoDocumento,} = useQuery({
      queryKey: ['tipo-documentos-de-personas',], //data cached
      queryFn: () => fetchDataTodo(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });


  const facturaNombre = watch('factura_nombre');
  const tipoDocumento = watch('tipo_documento');
  const documentoOriginal = watch('documento_original');

  // Guardar valores iniciales del titular (solo cuando se setean por primera vez)
  const valoresInicialesTitular = useRef<{
    tipo_documento: string;
    documento_original: string;
    inicializado: boolean;
  }>({
    tipo_documento: '',
    documento_original: '',
    inicializado: false
  });

  // Capturar valores iniciales cuando se setean (titular o pasajero según el caso)
  useEffect(() => {
    const esPersonaBase = facturaNombre === 'titular' || facturaNombre === 'pasajero';

    if (personaBase && esPersonaBase && !valoresInicialesTitular.current.inicializado) {
      valoresInicialesTitular.current = {
        tipo_documento: personaBase.tipo_documento?.toString() || '',
        documento_original: personaBase.documento || '',
        inicializado: true
      };
    }
  }, [personaBase, facturaNombre]);

  // Detectar si han cambiado los valores solo cuando factura_nombre es 'titular' o 'pasajero'
  const esPersonaBaseActiva = facturaNombre === 'titular' || facturaNombre === 'pasajero';

  const tipoDocumentoHaCambiado = esPersonaBaseActiva &&
    tipoDocumento !== valoresInicialesTitular.current.tipo_documento;

  const documentoHaCambiado = esPersonaBaseActiva &&
    documentoOriginal !== valoresInicialesTitular.current.documento_original;

  const algunValorHaCambiado = tipoDocumentoHaCambiado || documentoHaCambiado;

  console.log('Es facturación individual:', esFacturacionIndividual);
  console.log('Persona base:', personaBase);
  console.log('Valores iniciales:', valoresInicialesTitular.current);
  console.log('Valores actuales:', { tipoDocumento, documentoOriginal });
  console.log('Tipo documento ha cambiado:', tipoDocumentoHaCambiado);
  console.log('Documento ha cambiado:', documentoHaCambiado);
  console.log('Algún valor ha cambiado:', algunValorHaCambiado);

  

  // Restaurar valores del formulario cuando volvemos al tab
  useEffect(() => {
    if (activeTab === 'form' && formData) {
      reset(formData);
      // También restaurar el tipo de documento seleccionado si existe
      if (formData.tipo_documento && dataTipoDocumentoList) {
        setTipoDocumentoSelected(
          dataTipoDocumentoList?.find((doc: any) => doc.id.toString() === formData.tipo_documento)
        );
      }
    }
  }, [activeTab, formData, reset, dataTipoDocumentoList]);

  // Setear valores iniciales de la persona base (titular o pasajero) cuando el componente se monta
  useEffect(() => {
    if (!personaBase) return;

    const valorFacturaNombreEsperado = esFacturacionIndividual ? 'pasajero' : 'titular';

    // Si no hay formData guardado (modal recién abierto) y facturaNombre coincide con la persona base
    if (facturaNombre === valorFacturaNombreEsperado && !formData) {
      setValue('documento_original', personaBase.documento);
      setValue('tipo_documento', personaBase.tipo_documento?.toString() || '');
    }
    // Si cambiamos de 'tercero' a la persona base, restaurar datos
    else if (facturaNombre === valorFacturaNombreEsperado && formData?.factura_nombre !== valorFacturaNombreEsperado) {
      setValue('documento_original', personaBase.documento);
      setValue('tipo_documento', personaBase.tipo_documento?.toString() || '');
    }
  }, [personaBase, facturaNombre, setValue, formData, esFacturacionIndividual]);

  const onSubmit = async (data: ClienteFacturaData) => {
    console.log(data) 
    console.log(dataTipoDocumentoList)
    const documentoSelected = dataTipoDocumentoList.filter((doc: any) => doc.id.toString() === watch('tipo_documento'))
    console.log(documentoSelected);
    console.log(titular) 
    onInvoiceGenerated({...data, algunValorHaCambiado: algunValorHaCambiado});
  };


  console.log('dataTipoDocumentoList:', dataTipoDocumentoList)
  console.log('isFetchingTipoDocumento:', isFetchingTipoDocumento)
  console.log('Es array?:', Array.isArray(dataTipoDocumentoList))
  console.log('Longitud:', dataTipoDocumentoList?.length)

  console.log(tipoDocumentoSelected)
  console.log(titular);
  console.log(facturaNombre);

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
                <Label htmlFor="factura_nombre" className="text-gray-700 font-medium">
                  Factura a nombre del *
                </Label>
                <Controller
                    name="factura_nombre"
                    control={control}
                    rules={{ required: "Este campo es requerido" }}
                    render={({ field }) => (
                      <div className="w-full min-w-0 select-container">
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                                    field.onChange(value)
                                    if (value) {
                                      clearErrors("factura_nombre") // Limpia el error cuando selecciona un valor
                                    }
                                  }}
                          onOpenChange={(open) => {
                              if (!open && !field.value) {
                                field.onBlur(); 
                              }
                            }}
                        >
                          <SelectTrigger 
                            className="cursor-pointer border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                            <SelectValue placeholder="Selecciona a nombre de quien irá la factura" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="min-w-[var(--radix-select-trigger-width)] max-h-60 z-[100000]">
                            {esFacturacionIndividual ? (
                              <SelectItem value="pasajero">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                  Pasajero
                                </div>
                              </SelectItem>
                            ) : (
                              <SelectItem value="titular">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                  Titular
                                </div>
                              </SelectItem>
                            )}
                            <SelectItem value="tercero">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                Tercero
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  {errors.factura_nombre && (
                    <p className="text-red-400 text-sm">{errors.factura_nombre.message as string}</p>
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

                                // Re-validar los campos de documento cuando cambia el tipo
                                setTimeout(() => {
                                  if (facturaNombre === 'titular' || facturaNombre === 'pasajero') {
                                    trigger('documento_original');
                                  } else {
                                    trigger('ruc');
                                  }
                                }, 0);
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

            {facturaNombre !== 'titular' && facturaNombre !== 'pasajero'
            &&
              <>
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
                          message: 'El documento debe tener mínimo 3 caracteres'
                        },
                        validate: {
                          formatoDocumento: (value) => {
                            if (!tipoDocumentoSelected) return true;

                            const esRUC = tipoDocumentoSelected.nombre?.toUpperCase() === 'RUC';

                            // Si el tipo de documento es RUC, validar formato con guion
                            if (esRUC) {
                              if (!value.includes('-')) {
                                return 'El RUC debe tener el formato: 12345678-9';
                              }
                              // Validar formato básico: números-dígito
                              if (!/^\d+-\d$/.test(value)) {
                                return 'El RUC debe tener el formato: 12345678-9';
                              }
                            } else {
                              // Si NO es RUC, no debe tener guion
                              if (value.includes('-')) {
                                return `El ${tipoDocumentoSelected.nombre} no debe contener guiones`;
                              }
                            }
                            return true;
                          }
                        }
                      })}
                    />
                    {errors.ruc && (
                      <span className='text-red-400 text-sm'>{errors.ruc.message}</span>
                    )}
                </div>
              </>
            }
          </div>

             {facturaNombre !== 'titular' && facturaNombre !== 'pasajero'
            ?
              <>
              <div className="grid grid-cols-2 gap-4">

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
                <Label htmlFor="direccion" className="text-gray-700 font-medium">Dirección</Label>
                <Input
                  id="direccion"
                  placeholder="Dirección del cliente"
                  autoComplete="street-address"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  {...register('direccion')}
                />
              </div>
              </>
            :
                <>
                  <div className="border border-gray-200 rounded-lg p-5 mb-6">
                    {/* <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      DATOS DEL CLIENTE
                    </h3> */}
                    <div className="space-y-3">
                      <div className="flex">
                        <span className="text-gray-600 w-32">• {esFacturacionIndividual ? 'Pasajero' : 'Titular'}:</span>
                        <span className="font-semibold text-gray-900">
                          {personaBase && getPrimerNombreApellido(personaBase.nombre, personaBase.apellido)}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-32 mt-2">• Documento:</span>
                        {/* <span className="font-semibold text-gray-900">
                          {titular.documento}
                        </span> */}
                        <div className="space-y-1">
                          <Input
                            id="documento_original"
                            autoComplete="off"
                            placeholder="Ej: 80000000-0"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            {...register('documento_original', {
                              required: 'Este campo es requerido',
                              minLength: {
                                value: 3,
                                message: 'El documento debe tener mínimo 3 caracteres'
                              },
                              validate: {
                                formatoDocumento: (value) => {
                                  if (!tipoDocumentoSelected) return true;

                                  const esRUC = tipoDocumentoSelected.nombre?.toUpperCase() === 'RUC';

                                  // Si el tipo de documento es RUC, validar formato con guion
                                  if (esRUC) {
                                    if (!value.includes('-')) {
                                      return 'El RUC debe tener el formato: 12345678-9';
                                    }
                                    // Validar formato básico: números-dígito
                                    if (!/^\d+-\d$/.test(value)) {
                                      return 'El RUC debe tener el formato: 12345678-9';
                                    }
                                  } else {
                                    // Si NO es RUC, no debe tener guion
                                    if (value.includes('-')) {
                                      return `El ${tipoDocumentoSelected.nombre} no debe contener guiones`;
                                    }
                                  }
                                  return true;
                                }
                              }
                            })}
                          />
                          {errors.documento_original && (
                            <p className="text-red-400 text-sm">{errors.documento_original.message}</p>
                          )}
                      </div>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-32">• Correo:</span>
                        <span className="font-semibold text-gray-900">
                          {personaBase?.email}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-32">• Teléfono:</span>
                        <span className="font-semibold text-gray-900">
                          {personaBase?.telefono}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
            }

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
              {/* {isPending ? 'Generando...' : 'Generar Factura'} */}
              {/* {isPending ? 'Generando...' : 'Generar Factura'} */}
              Ver Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
