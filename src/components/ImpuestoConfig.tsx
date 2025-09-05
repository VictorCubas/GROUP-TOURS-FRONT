/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Percent, Check, X, Loader2Icon } from 'lucide-react';
import type { TaxConfig } from '@/types/invoice';
import { useQuery } from '@tanstack/react-query';
import { fetchDataTiposImpuestosTodo } from './utils/httpFacturacion';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Controller, useForm } from 'react-hook-form';
import type { SubtipoImpuesto, TipoImpuesto } from '@/types/facturacion';

interface TaxConfigFormProps {
  taxes: TaxConfig[];
  onChange: (taxes: TaxConfig[]) => void;
  siEditando: boolean;
  setImpuesto: (data: {impuesto: string, subimpuesto: string | undefined}) => void
  register: ReturnType<typeof useForm>['register'];
  reset: any;
  errors: any;
  control: any; // puedes tiparlo mejor con Control<FieldValues>
  clearErrors: (name?: string | string[]) => void;
  impuestoActual?: { impuesto: string; subimpuesto?: string }; // Nuevo prop
  isSubmitting?: boolean;
  tipoImpuestoConfiguracion: any
}

export const ImpuestoConfig: React.FC<TaxConfigFormProps> = ({ 
    taxes, 
    onChange, 
    siEditando, 
    setImpuesto,
    register, errors,
    control, reset,
    clearErrors, impuestoActual, isSubmitting,
    tipoImpuestoConfiguracion,
   }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [tipoImpuestoSelected, setTipoImpuestoSelected] = useState<TipoImpuesto>();
  const [selectedSubtipoId, setSelectedSubtipoId] = useState<string | null>(null); // Control de selección única
  const [noSeSeleccionoSubtimo, setNoSeSeleccionoSubtimo] = useState<boolean>(false);
  const [newTax, setNewTax] = useState<Omit<TaxConfig, 'id'>>({
    name: '',
    percentage: 0,
    isActive: true,
    description: ''
  });




  
  // const { control, formState: { errors }, clearErrors } = useForm<any>({
    //   mode: "onBlur",
    // });
    
    // console.log('TipoImpuestoSelected: ', tipoImpuestoSelected)
    
    const { data: dataTipoImpuestoList = [], isFetching: isFetchingTiposImpuestos } = useQuery({
      queryKey: ['tipos-impuestos-todos'],
      queryFn: () => fetchDataTiposImpuestosTodo(),
      staleTime: 5 * 60 * 1000
    });
    
    useEffect(() => {
  
      if (isSubmitting) {

        let tipo;
        // if(tipoImpuesto)
        console.log('submitting... tipoImpuestoSelected: ', tipoImpuestoSelected)
        if(tipoImpuestoSelected){
          tipo = dataTipoImpuestoList.filter((tipoImpuesto: TipoImpuesto) => tipoImpuesto.id === tipoImpuestoSelected?.id)

          console.log(tipo)
          console.log('tipo: ', tipo)
          const tieneSubTipo = tipo[0].subtipos.length > 0;
  
          let subimpuesto: any = '';
          if(tieneSubTipo)
              subimpuesto = selectedSubtipoId || '';
          else
            subimpuesto = undefined 
          console.log('subimpuesto: ', subimpuesto)
          console.log('isSubmitting...', {
            impuesto: tipoImpuestoSelected ? tipoImpuestoSelected.id.toString() : '',
            subimpuesto: subimpuesto
          })


          if(subimpuesto === ''){
            setNoSeSeleccionoSubtimo(true);
          }
        }

        


        console.log("El formulario se está enviando…");
        // Aquí puedes hacer cualquier operación, por ejemplo:
        // - Bloquear inputs
        // - Mostrar un loader
        // - Validaciones adicionales
      }
    }, [dataTipoImpuestoList, isSubmitting, selectedSubtipoId, tipoImpuestoSelected]);
    
  
  useEffect(() => {
    if (!tipoImpuestoConfiguracion || !dataTipoImpuestoList?.length) return;

    const payload = {
      tipo_impuesto: tipoImpuestoConfiguracion.tipo_impuesto != null
        ? String(tipoImpuestoConfiguracion.tipo_impuesto)
        : '',
      subtipo_impuesto: tipoImpuestoConfiguracion.subtipo_impuesto != null
        ? String(tipoImpuestoConfiguracion.subtipo_impuesto)
        : '',
    };

    // opcional: actualizar estados locales primero
    const tipoSelected = dataTipoImpuestoList.find(
      (t: TipoImpuesto) => t.id === tipoImpuestoConfiguracion.tipo_impuesto
    );
    setTipoImpuestoSelected(tipoSelected || undefined);
    setSelectedSubtipoId(payload.subtipo_impuesto || null);

    // deferir el reset al siguiente frame
    requestAnimationFrame(() => {
      reset(payload);
      // console.log('reset aplicado:', payload);
    });
  }, [dataTipoImpuestoList, tipoImpuestoConfiguracion, reset]);



  useEffect(() => {
  if (
    impuestoActual?.impuesto &&
    dataTipoImpuestoList.length > 0
  ) {
    const tipo_impuesto = dataTipoImpuestoList.find(
      (doc: TipoImpuesto) => doc.id.toString() === impuestoActual.impuesto
    );
    setTipoImpuestoSelected(tipo_impuesto || undefined);
    setNoSeSeleccionoSubtimo(false);

    if (impuestoActual.subimpuesto) {
      setSelectedSubtipoId(impuestoActual.subimpuesto);
    }
  }
}, [impuestoActual, dataTipoImpuestoList]);

  const handleAddTax = () => {
    if (newTax.name && newTax.percentage >= 0) {
      const tax: TaxConfig = {
        ...newTax,
        id: Date.now().toString()
      };
      onChange([...taxes, tax]);
      setNewTax({ name: '', percentage: 0, isActive: true, description: '' });
      setIsAdding(false);
    }
  };


  console.log('tipoImpuestoSelected (1): ', tipoImpuestoSelected)
  console.log('selectedSubtipoId (1): ', selectedSubtipoId)

  const toggleSubtipoSelection = (subtipoId: string) => {

    if(!siEditando) return;

    setNoSeSeleccionoSubtimo(false);
    const newSubtipoId = selectedSubtipoId === subtipoId ? null : subtipoId;
    setSelectedSubtipoId(newSubtipoId);

    // setImpuesto({
    //                     impuesto: tipo_impuesto ? tipo_impuesto.id.toString() : '',
    //                     subimpuesto: tipo_impuesto.subtipos.lenght > 0 ? '' : undefined,
    //                   });
    setImpuesto({
      impuesto: tipoImpuestoSelected ? tipoImpuestoSelected.id.toString() : '',
      subimpuesto: newSubtipoId || ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-600" />
            Tipos de IVA e Impuestos
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_impuesto" className="text-gray-700 font-medium">
            Timpo de Impuesto *
          </Label>

          {isFetchingTiposImpuestos && (
            <div className="w-full">
              <Select>
                <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 flex">
                  <div className="w-full flex items-center justify-center">
                    <Loader2Icon className="animate-spin w-6 h-6 text-gray-300" />
                  </div>
                </SelectTrigger>
              </Select>
            </div>
          )}

          {!isFetchingTiposImpuestos &&
            <Controller
              name="tipo_impuesto"
              control={control}
              rules={{ required: "Este campo es requerido" }}
              defaultValue={impuestoActual?.impuesto || ""}
              render={({ field }) => (
                <div className="w-2/6 min-w-0 select-container relative overflow-visible">
                  <Select
                      value={field.value}
                      onValueChange={(value) => {
                      field.onChange(value);
                      
                      if (value) {
                        clearErrors("tipo_impuesto");
                      }

                      const tipo_impuesto = dataTipoImpuestoList.find(
                        (doc: TipoImpuesto) => doc.id.toString() === value
                      );
                      console.log('tipo_impuesto: ', tipo_impuesto)
                      setTipoImpuestoSelected(tipo_impuesto);
                      setNoSeSeleccionoSubtimo(false);
                      setSelectedSubtipoId(null);

                      // Avisar al padre con subtipo vacío
                      setImpuesto({
                        impuesto: tipo_impuesto ? tipo_impuesto.id.toString() : '',
                        subimpuesto: tipo_impuesto?.subtipos?.length > 0 ? '' : undefined,
                      });
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
                      <SelectValue placeholder="Selecciona el tipo de impuesto" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-60 z-50 relative">
                      {dataTipoImpuestoList.map((impuesto: TipoImpuesto) =>
                        <SelectItem
                          key={impuesto.id}
                          value={impuesto.id.toString()}
                          className="pl-2 pr-4"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                            <span className="truncate">{`${impuesto.nombre}`}</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          }

          {errors.tipo_impuesto && (
            <p className="text-red-400 text-sm">{errors.tipo_impuesto.message as string}</p>
          )}
        </div>

        {tipoImpuestoSelected?.nombre === 'IVA' && (
          <div className="space-y-3 mt-8">
            {noSeSeleccionoSubtimo && (
            <p className="text-red-400 text-sm">El subtipo de {tipoImpuestoSelected?.nombre} es requerido</p>
          )}

            {tipoImpuestoSelected.subtipos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Percent className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay subtipos de IVA configurados</p>
              </div>
            ) : (
              tipoImpuestoSelected.subtipos.map((tax: SubtipoImpuesto) => (
                <div
                  key={tax.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer ${
                    selectedSubtipoId === tax.id.toString()
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white'
                  }   ${siEditando ? '': 'opacity-60'}`}
                  onClick={() => toggleSubtipoSelection(tax.id.toString())}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* <div className={`w-3 h-3 rounded-full ${selectedSubtipoId === tax.id.toString() ? 'bg-emerald-500' : 'bg-gray-400'}`} /> */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedSubtipoId === tax.id.toString() ? "bg-green-500 border-green-500" : "border-gray-300"
                        }`}
                      >
                        {selectedSubtipoId === tax.id.toString() && (
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{tax.nombre}</h4>
                        <p className="text-sm text-gray-600">
                          {`${tax.porcentaje}%`}
                        </p>
                      </div>
                    </div>
                    {selectedSubtipoId === tax.id.toString() && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tipoImpuestoSelected?.nombre && tipoImpuestoSelected?.nombre !== 'IVA' && (
          <div className="text-center py-8 text-gray-500">
            <p>Configuración para {tipoImpuestoSelected?.nombre} no disponible aún</p>
          </div>
        )}
      </div>
    </div>
  );
};
