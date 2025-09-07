/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Building2, Mail, Phone, MapPin, Hash, Loader2Icon, } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from '@tanstack/react-query';
import { fetchDataEmpresaTodo, fetchDataEstablecimientosTodo, fetchDataPuntoExpedicionTodo, fetchDataTimbradosTodo } from './utils/httpFacturacion';
import type { Establecimiento, PuntoExpedicion, Timbrado } from '@/types/facturacion';
import { formatearFecha } from '@/helper/formatter';
import { Input } from './ui/input';
import { useFacturaFormStore } from '@/store/useFacturaFormStore';

interface CompanyConfigFormProps {
  siEditando: boolean;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  reset: any;
  control: any; // puedes tiparlo mejor con Control<FieldValues>
  clearErrors: (name?: string | string[]) => void;
  configFacturaData: any;
}

export const InformacionEmpresaForm: React.FC<CompanyConfigFormProps> = 
        ({  
          siEditando, 
          register, errors,
          control, reset,
          clearErrors,
          configFacturaData,}) => {
            
  const { updateFormData } = useFacturaFormStore();
  const [establecimientoSelected, setEstablecimientoSelected] = useState<Establecimiento>();
  const [expedicionSelected, setPuntoExpedicionSelected] = useState<PuntoExpedicion>();
  const [timbradoSelected, setTimbradoSelected] = useState<PuntoExpedicion>();

  console.log(establecimientoSelected)
  console.log(expedicionSelected)
  console.log(timbradoSelected)

   const {data: empresaData,} = useQuery({
      queryKey: ['empresa-todos',], //data cached
      queryFn: () => fetchDataEmpresaTodo(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

    console.log('empresaData: ', empresaData)

   const {data: dataTimbradoList, isFetching: isFetchingTimbrado,} = useQuery({
      queryKey: ['timbrados-todos',], //data cached
      queryFn: () => fetchDataTimbradosTodo(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });
    
   const {data: dataEstablecimientoList, isFetching: isFetchingEstablecimientos,} = useQuery({
      queryKey: ['establecimientos-todos',], //data cached
      queryFn: () => fetchDataEstablecimientosTodo(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

   const {data: dataPuntoExpedicionList, isFetching: isFetchingPuntoExpedicion,} = useQuery({
      queryKey: ['puntos-expedicion-todos',], //data cached
      queryFn: () => fetchDataPuntoExpedicionTodo(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });



    // Efecto que inicializa el formulario y los selects locales
    // cuando están disponibles los datos de la empresa, configuración de factura
    // y listas necesarias (Timbrados, Establecimientos, Puntos de Expedición).
    // - Usa `reset()` para establecer los valores iniciales del formulario
    //   asegurando que los IDs sean string para que coincidan con los <Select>.
    // - También actualiza el estado local de cada select para mostrar la selección actual.
    useEffect(() => {
    if (
      empresaData &&
      configFacturaData &&
      dataTimbradoList &&
      dataEstablecimientoList &&
      dataPuntoExpedicionList
    ) {
      // Guardamos los datos locales para selects
      setTimbradoSelected(dataTimbradoList.find((t:any) => t.id === configFacturaData.timbrado));
      setEstablecimientoSelected(dataEstablecimientoList.find((e: any) => e.id === configFacturaData.establecimiento));
      setPuntoExpedicionSelected(dataPuntoExpedicionList.find((p: any) => p.id === configFacturaData.punto_expedicion));

      

      // Deferimos el reset para evitar condición de carrera
      requestAnimationFrame(() => {
        const formularioData = {
          id: empresaData.id,
          nombreEmpresa: empresaData.nombre,
          ruc: empresaData.ruc,
          activadComercial: empresaData.actividades,
          telefono: empresaData.telefono,
          email: empresaData.correo,
          direccion: empresaData.direccion,
          timbrado: configFacturaData.timbrado,
          establecimiento: configFacturaData.establecimiento,
          expedicion: configFacturaData.punto_expedicion,
        };

        reset(formularioData);

      //   setEstablecimientoSelected(dataEstablecimientoList.find((e: any) => e.id === configFacturaData.establecimiento));
      // setPuntoExpedicionSelected(dataPuntoExpedicionList.find((p: any) => p.id === configFacturaData.punto_expedicion));
        formularioData.timbrado = dataTimbradoList.find((t:any) => t.id === configFacturaData.timbrado);
        formularioData.establecimiento = dataEstablecimientoList.find((e: any) => e.id === configFacturaData.establecimiento);
        formularioData.expedicion = dataPuntoExpedicionList.find((p: any) => p.id === configFacturaData.punto_expedicion)
        console.log('guardando.... ', formularioData )
        updateFormData(formularioData)
      });

    }
  }, [configFacturaData, 
      empresaData, reset, dataPuntoExpedicionList,
      dataEstablecimientoList, dataTimbradoList, updateFormData]);

   const getStatusColor = (fecha_fin?: string) => {
    if(!fecha_fin){
      return "text-green-600";
    }

    return 'text-red-600';
  }

  const getStatusText = (fecha_fin?: string) => {
    if(!fecha_fin){
      return 'Vigente';
    }
    
    return 'Vencido'
  }

  return (
    <div className="space-y-6" >
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          Información de la Empresa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor='nombreEmpresa' className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa *
            </Label>
            <Input
              type="text"
              autoComplete='nombreEmpresa'
              disabled={!siEditando}
              // value={config.companyName}
              // onChange={(e) => handleChange('companyName', e.target.value)}
              className='border-gray-300  w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'
              placeholder="Ej: Group Tours"
              {...register('nombreEmpresa', {
                  required: true, 
                  validate: {blankSpace: (value) => !!value.trim()},
                  minLength: 2})}
                />
                <div>
                  {(errors?.nombreEmpresa?.type === 'required' || errors?.nombreEmpresa?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                  {errors?.nombreEmpresa?.type === 'minLength' && <span className='text-red-400 text-sm'>Este campo debe tener minimo 3 caracteres</span>}
                </div>
          </div>
          
          <div>
            <Label htmlFor="ruc" className="block text-sm font-medium text-gray-700 mb-2">
              RUC *
            </Label>
            <Input
              disabled={!siEditando}
              type="text"
              id='ruc'
              autoComplete='ruc'
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Ej: 80030805-0"
              {...register('ruc', {
                required: true, 
                validate: {blankSpace: (value) => !!value.trim()},
                minLength: 2})}
              />
              <div>
                {(errors?.ruc?.type === 'required' || errors?.ruc?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                {errors?.ruc?.type === 'minLength' && <span className='text-red-400 text-sm'>Este campo debe tener minimo 3 caracteres</span>}
              </div>
          </div>

          <div>
            <Label htmlFor='activadComercial' className="block text-sm font-medium text-gray-700 mb-2">
              Actividad Comercial *
            </Label>
            <Input
              disabled={!siEditando}
              type="text"
              id='activadComercial'
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Ej: OTRAS ACTIVIDADES DE SERVICIOS DE APOYO A EMPRESAS N.C.P."
              {...register('activadComercial', {
                required: true, 
                validate: {blankSpace: (value) => !!value.trim()},
                minLength: 2})}
              />
              <div>
                {(errors?.activadComercial?.type === 'required' || errors?.activadComercial?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                {errors?.activadComercial?.type === 'minLength' && <span className='text-red-400 text-sm'>Este campo debe tener minimo 15 caracteres</span>}
              </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Teléfono *
            </Label>
            <Input
              disabled={!siEditando}
              type="tel"
              id='telefono'
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Ej: 212471000"
              {...register('telefono', {
                required: true, 
                validate: {blankSpace: (value) => !!value.trim()},
                minLength: 2})}
              />
              <div>
                {(errors?.telefono?.type === 'required' || errors?.telefono?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                {errors?.telefono?.type === 'minLength' && <span className='text-red-400 text-sm'>Este campo debe tener minimo 3 caracteres</span>}
              </div>
          </div>

          <div>
            <Label htmlFor='email' className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Correo Electrónico *
            </Label>
            <Input
              disabled={!siEditando}
              type="email"
              id='email'
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Ej: info@negofin.com.py"
              {...register('email', {
                required: true, 
                validate: {blankSpace: (value) => !!value.trim()},
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Ingrese un correo válido",
                },
                 }
              )}
              />
              <div>
                {(errors?.email?.type === 'required' || errors?.email?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                {errors?.email?.type === "pattern" && (
                    <span className="text-red-400 text-sm">
                      {errors.email.message as string}
                    </span>
                  )}
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor='direccion' className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dirección *
            </Label>
            <Input
              disabled={!siEditando}
              type="text"
              id='direccion'
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Ej: Mcal. Lopez c/Waldino Lovera y Jose Vinuales"
              {...register('direccion', {
                required: true, 
                validate: {blankSpace: (value) => !!value.trim()},
                minLength: 10})}
              />
              <div>
                {(errors?.direccion?.type === 'required' || errors?.direccion?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                {errors?.direccion?.type === 'minLength' && <span className='text-red-400 text-sm'>Este campo debe tener minimo 10 caracteres</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Hash className="w-5 h-5 text-blue-600" />
          Información Fiscal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TIMBRADO */}
          <div className="space-y-2">
              <Label htmlFor="timbrado" className="text-gray-700 font-medium">
                Timbrado *
              </Label>

              {isFetchingTimbrado && (
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

              {!isFetchingTimbrado && 
                <Controller
                  name="timbrado"
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field }) => (
                    <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          if (value) {
                            clearErrors("timbrado")
                          }

                          console.log('value: ', value);
                          const timbrado = dataTimbradoList.filter((doc: Timbrado) => doc.id.toString() === value)
                          setTimbradoSelected(timbrado[0]);
                        }}
                        onOpenChange={(open) => {
                          if (!open && !field.value) {
                            field.onBlur(); 
                          }
                        }}
                      >
                        <SelectTrigger 
                            disabled={!siEditando}
                          className="select-trigger w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-left">
                          <SelectValue placeholder="Selecciona el establecimiento" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-60">
                          {dataTimbradoList.map((timbrado: Timbrado) => 
                            <SelectItem 
                              key={timbrado.id} 
                              value={timbrado.id.toString()}
                              className="pl-2 pr-4"
                            >
                              {/* <div className="flex items-center gap-2 min-w-0">
                                <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                                <span className="truncate">{`${timbrado.codigo} - ${timbrado.nombre}`} </span>
                              </div> */}
                              <div className="flex flex-col">
                                <div className="flex items-center justify-between gap-5">
                                  <span className="font-medium">{timbrado.numero}</span>
                                  <span className={`text-xs font-semibold ${getStatusColor(timbrado.fin_vigencia)}`}>
                                    {getStatusText(timbrado.fin_vigencia)}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Vigencia: {formatearFecha(timbrado.inicio_vigencia, false)} -{" "}
                                  {timbrado.fin_vigencia ? formatearFecha(timbrado.fin_vigencia ?? '') : 'Sin vencimiento'}
                                </div>
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              }

              {errors.timbrado && (
                <p className="text-red-400 text-sm">{errors.timbrado.message as string}</p>
              )}
          </div>

          {/* ESTABLECIMIENTOS */}
          <div className="space-y-2">
              <Label htmlFor="tipo_remuneracion" className="text-gray-700 font-medium">
                Establecimientos *
              </Label>

              {isFetchingEstablecimientos && (
                <div className="w-full"> {/* Contenedor adicional para controlar el ancho */}
                  <Select>
                    <SelectTrigger 
                      className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 flex">
                      <div className="w-full flex items-center justify-center">
                        <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                      </div>
                    </SelectTrigger>
                  </Select>
                </div>
              )}

              {!isFetchingEstablecimientos && 
                <Controller
                  name="establecimiento"
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field }) => (
                    <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          if (value) {
                            clearErrors("establecimiento")
                          }

                          console.log('value: ', value);
                          const establecimiento = dataEstablecimientoList.filter((doc: Establecimiento) => doc.id.toString() === value)
                          console.log('tipoRemuneracion: ', establecimiento[0])
                          setEstablecimientoSelected(establecimiento[0]);
                        }}
                        onOpenChange={(open) => {
                          if (!open && !field.value) {
                            field.onBlur(); 
                          }
                        }}
                      >
                        <SelectTrigger 
                            disabled={!siEditando}
                            className="select-trigger w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-left">
                          <SelectValue placeholder="Selecciona el establecimiento" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-60">
                          {dataEstablecimientoList.map((estab: {id:number, codigo: string, nombre: string}) => 
                            <SelectItem 
                              key={estab.id} 
                              value={estab.id.toString()}
                              className="pl-2 pr-4"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                                <span className="truncate">{`${estab.codigo} - ${estab.nombre}`} </span>
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              }

              {errors.establecimiento && (
                <p className="text-red-400 text-sm">{errors.establecimiento.message as string}</p>
              )}
          </div>

            {/* PUNTOS DE EXPEDICION */}
          <div className="space-y-2">
              <Label htmlFor="tipo_remuneracion" className="text-gray-700 font-medium">
                Puntos de expedición *
              </Label>

              {isFetchingPuntoExpedicion && (
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

              {!isFetchingPuntoExpedicion && 
                <Controller
                  name="expedicion"
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field }) => (
                    <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          if (value) {
                            clearErrors("expedicion")
                          }

                          console.log('value: ', value);
                          const puntoExpedicion = dataPuntoExpedicionList.filter((doc: PuntoExpedicion) => doc.id.toString() === value)
                          // console.log('tipoRemuneracion: ', puntoExpedicion[0])
                          setPuntoExpedicionSelected(puntoExpedicion[0]);
                        }}
                        onOpenChange={(open) => {
                          if (!open && !field.value) {
                            field.onBlur(); 
                          }
                        }}
                      >
                        <SelectTrigger 
                          disabled={!siEditando}
                          className="select-trigger w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-left">
                          <SelectValue placeholder="Selecciona el punto de expedición" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-60">
                          {dataPuntoExpedicionList.map((punto: PuntoExpedicion) => 
                            <SelectItem 
                              key={punto.id} 
                              value={punto.id.toString()}
                              className="pl-2 pr-4"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                                <span className="truncate">{punto.codigo} - {punto.establecimiento.nombre}</span>
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              }

              {errors.expedicion && (
                <p className="text-red-400 text-sm">{errors.expedicion.message as string}</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};