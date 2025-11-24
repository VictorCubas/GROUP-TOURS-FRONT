/* eslint-disable @typescript-eslint/no-explicit-any */
import { use, useEffect, useState } from 'react';
import { FileText, Building2, Percent, Eye, Check, Edit, X, Loader2Icon } from 'lucide-react';
import { InformacionEmpresaForm } from '@/components/InformacionEmpresaForm';
import { ImpuestoConfig } from '@/components/ImpuestoConfig';
import { FacturaPreview } from '@/components/FacturaPreview';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ToastContext } from '@/context/ToastContext';
import { fetchDataConfigFactura, fetchDataTiposImpuestosTodo, nuevoDataFetch } from '@/components/utils/httpFacturacion';
import { useSessionStore } from '@/store/sessionStore';
import { useFacturaFormStore } from '@/store/useFacturaFormStore';
import { queryClient } from '@/components/utils/http';

type TabType = 'company' | 'taxes' | 'preview';

function FactuacionConfigPage() {
  const {siTienePermiso} = useSessionStore();
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [siEditando, setSiEditando] = useState(false);
  const [tipoImpuestoConfiguracionActual, setTipoImpuestoConfiguracionActual] = useState<any>();
  const {handleShowToast} = use(ToastContext);
  const [impuesto, setImpuesto] = useState<{impuesto: string, subimpuesto: string | undefined}>();

  console.log('impuesto despues de seleccionar otro: ', impuesto)
  const { formData } = useFacturaFormStore();

  // CONFIGURACION ACTUAL
  const {data: configFacturaData,} = useQuery({
      queryKey: ['config-factura',], //data cached
      queryFn: () => fetchDataConfigFactura(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });



  // RECUPERA LOS TIPOS DE IMPUESTOS
  const { data: dataTipoImpuestoList = [], isFetching: isFetchingTiposImpuestos } = useQuery({
      queryKey: ['tipos-impuestos-todos'],
      queryFn: () => fetchDataTiposImpuestosTodo(),
      staleTime: 5 * 60 * 1000
    });


    console.log('configFacturaData: ', configFacturaData)
    console.log('dataTipoImpuestoList: ', dataTipoImpuestoList)
    console.log('impuesto: ', impuesto)

    // if(configFacturaData && dataTipoImpuestoList){
    //   const tipoImpuestoActual = configFacturaData?.tipo_impuesto;
    //   const subtipoImpuestoActual = configFacturaData?.subtipo_impuesto;
    // }

  // DATOS DEL FORMULARIO 
    const {control, handleSubmit, register, formState: {errors, isSubmitting},
      clearErrors, reset, } = 
              useForm<any>({
                mode: "onBlur",
       
                // }
              });

    const {mutate, isPending: isPendingMutation} = useMutation({
    mutationFn: nuevoDataFetch,
    onSuccess: () => {
        handleShowToast('Se ha guardado la configuración satisfactoriamente', 'success');
        handleToggleEdit();
        setActiveTab('company');

        queryClient.invalidateQueries({
                  queryKey: ['config-factura'],
                  exact: false
                });
    },
  });

    // console.log(impuesto?.impuesto)

    console.log(formData) 
    console.log(impuesto?.impuesto)

  const handleGuardarNuevaData = async (dataForm: any) => {
      /**
       * NOTA -- subimpuesto: undefined significa que no tiene subtipo
       * NOTA -- subimpuesto: '' significa que tiene subtipo pero no selecciono ninguna
       */


    console.log('guardar.... siEditando antes: ', siEditando)
    console.log('guardar.... impuesto: ', impuesto)

      console.log('guardar.... dataForm edit: ', dataForm)
      console.log('guardar.... siEditando: ', siEditando)


    const tipo_impuesto = dataForm?.tipo_impuesto?.id || formData?.tipo_impuesto?.id;
    const subtipo_impuesto = dataForm?.subtipo_impuesto?.id ?? undefined;
    console.log(tipo_impuesto);
    console.log(subtipo_impuesto)
    const payload: any = {
      empresa: {
        nombre: dataForm.nombreEmpresa,
        ruc: dataForm.ruc,
        direccion: dataForm.direccion,
        telefono: dataForm.telefono,
        correo: dataForm.email,
        actividades: dataForm.activadComercial,
      },
      factura: {
        establecimiento: dataForm.establecimiento,
        // punto_expedicion: dataForm.expedicion,
        timbrado: dataForm.timbrado,
        tipo_impuesto,
        subtipo_impuesto
      }
    }


    if(dataForm?.id){
      payload.empresa.id = dataForm?.id;
    }

 
    console.log('payload: ', payload)    


    mutate(payload);
  }

  console.log('siTienePermiso("facturacion", "modificar"): ', siTienePermiso("facturacion", "modificar"))
  const tabs = [
    { id: 'company', label: 'Datos de Empresa', icon: Building2 },
    { id: 'taxes', label: 'Tipos de Impuestos', icon: Percent },
    { id: 'preview', label: 'Vista Previa', icon: Eye }
  ];

  const handleToggleEdit = () => {
    setSiEditando(siEditandoPrev => !siEditandoPrev)
  }


   useEffect(() => {
      if(configFacturaData){


        console.log({
            tipo_impuesto: configFacturaData?.tipo_impuesto,
            subtipo_impuesto: configFacturaData?.subtipo_impuesto
          })
            setTipoImpuestoConfiguracionActual({
            tipo_impuesto: configFacturaData?.tipo_impuesto,
            subtipo_impuesto: configFacturaData?.subtipo_impuesto
          });
      }
      
   }, [configFacturaData])

  return (
    <div className="min-h-scree">

      <form onSubmit={handleSubmit(handleGuardarNuevaData)}>
      <div className="max-w-7xl mx-auto space-y-8">
      {/* <div className="max-w-7xl mx-auto space-y-8"> */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">Facturación</h1>
              </div>
              <p className="text-gray-600">Gestiona todos los campos correspondiente a una factura.</p>
            </div>
            <div className="flex gap-3">
              {/* {siTienePermiso("facturacion", "exportar") &&
                <Button
                  type='button'
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              } */}

              {siTienePermiso("facturacion", "modificar") && !siEditando && 
                <Button 
                  onClick={handleToggleEdit}
                  type='button'
                  className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                  >
                    
                    <>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </> 
                </Button>
              }

              {siTienePermiso("facturacion", "modificar") && siEditando && 
                <>
                  <Button 
                        disabled={isPendingMutation}
                        className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer"> 
                        {isPendingMutation ? <Loader2Icon className="h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                        
                        {isPendingMutation ? 'Guardando..' : 'Guardar'} 
                  </Button>

                  <Button 
                        disabled={isPendingMutation}
                        onClick={handleToggleEdit} variant="outline"
                         type='button'
                        className=" cursor-pointer hover:bg-gray-100 bg-transparent">
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                  </Button>
                </>
              }

            </div>
          </div>
      </div>

      {/* Notification */}
      {/* {showNotification && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <CheckCircle className="w-5 h-5" />
          <span>Configuración guardada exitosamente</span>
        </div>
      )} */}

      {/* <div className="max-w-6xl mx-auto px-4 py-6"> */}
      

        <div className="max-w-7xl mx-auto space-y-8 px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    type='button'
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`cursor-pointer flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'company' && (
            <InformacionEmpresaForm
              siEditando={siEditando}
              register={register} // <-- pasar register
              errors={errors}     // <-- pasar errores
              control={control}
              reset={reset}
              clearErrors={clearErrors} // <-- también lo pasamos si lo usas
              configFacturaData={configFacturaData}
            />
          )}
          
          {activeTab === 'taxes' && (
            <ImpuestoConfig
              siEditando={siEditando}
              setImpuesto={setImpuesto}
              register={register} // <-- pasar register
              errors={errors}     // <-- pasar errores
              control={control}
              reset={reset}
              clearErrors={clearErrors} // <-- también lo pasamos si lo usas
              impuestoActual={impuesto}
              isSubmitting={isSubmitting}
              tipoImpuestoConfiguracionActual={tipoImpuestoConfiguracionActual}
              dataTipoImpuestoList={dataTipoImpuestoList}
              isFetchingTiposImpuestos={isFetchingTiposImpuestos}
            />
          )}
          
          {activeTab === 'preview' && (
            <FacturaPreview/>
          )}
        </div>

        </div>
      </form>
    </div>
  );
}

export default FactuacionConfigPage;