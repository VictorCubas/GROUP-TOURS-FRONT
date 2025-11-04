/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { Moneda } from '@/types/reservas';
import {  FileText, X} from 'lucide-react';
import { Card } from './ui/card';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { InfoFacturaTitular, type ClienteFacturaData } from './InfoFacturaTitular';
import { DescargarFacturaPreview } from './DescargarFacturaPreview';
import { useQuery } from '@tanstack/react-query';
import { fetchDataConfigFactura } from './utils/httpFacturacion';
import type { InvoiceData } from '@/types/invoice';
import { FacturaContext } from '@/context/FacturaContext';
import { Button } from './ui/button';


interface GenerarFacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any) => void;
  isPending: boolean;
  reservaData: any; // Datos completos de la reserva desde el backend
  selectedPasajeroId?: number; // ID del pasajero específico para pago individual
}

export default function GenerarFacturaModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  selectedPasajeroId,
  reservaData,
}: GenerarFacturaModalProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [activeTab, setActiveTab] = useState("form")
  const [clienteData, setClienteData] = useState<ClienteFacturaData | null>(null)
  const [payLoad, setPayLoad] = useState<any | null>(null)
  const [formData, setFormData] = useState<ClienteFacturaData | null>(null)

  // Obtener la configuración de facturación
  const { data: configFacturaData } = useQuery({
    queryKey: ['config-factura'],
    queryFn: () => fetchDataConfigFactura(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen
  });

  console.log('configFacturaData:', configFacturaData);
  console.log('reservaData:', reservaData);

  const handleInvoiceGenerated = async (data: ClienteFacturaData) => {
    console.log('Datos del formulario:', data);

    // Guardar los datos del formulario para poder restaurarlos
    setFormData(data);

    // Guardar los datos del cliente
    setClienteData(data);

    // Construir payload para el backend
    const payload = {
      nombre: data.nombre,
      ruc: data.ruc,
      email: data.email,
      telefono: data.telefono || '',
      direccion: data.direccion || '',
      tipo_documento: data.tipo_documento || '',
    };

    setPayLoad(payload);

    // Construir la vista previa inmediatamente
    const previewData = buildInvoicePreviewDataWithClient(data);
    if (previewData) {
      setInvoiceData(previewData);
    }

    // Cambiar al tab de vista previa
    setActiveTab("preview");
  }

  // Función auxiliar para construir invoice preview con datos del cliente específicos
  const buildInvoicePreviewDataWithClient = (clientData: ClienteFacturaData): InvoiceData | null => {
    if (!configFacturaData || !reservaData) {
      return null;
    }

    console.log('Construyendo invoice preview con configFacturaData:', configFacturaData);
    console.log('reservaData:', reservaData);
    console.log('clientData:', clientData);

    return {
      // Datos de la empresa (desde config - usando los campos correctos del servicio)
      ruc: configFacturaData.empresa_nombre || '',
      timbrado: configFacturaData.timbrado_numero || '',
      timbrado_numero: configFacturaData.timbrado_numero || '',
      vigencyStartDate: configFacturaData.fecha_emision || new Date().toISOString().split('T')[0],
      invoiceNumber: configFacturaData.numero_factura || `${configFacturaData.establecimiento_nombre || '001'}-001-${String(Math.floor(Math.random() * 10000)).padStart(7, '0')}`,

      // Metadata de la factura
      emissionDate: new Date().toISOString(),
      saleCondition: configFacturaData.condicion_venta === 'contado' ? 'Contado' : 'Crédito',
      currency: reservaData.moneda?.codigo || 'PYG',

      // Datos del cliente (desde el formulario)
      customerRuc: clientData.ruc,
      customerName: clientData.nombre,
      customerAddress: clientData.direccion || '',
      customerPhone: clientData.telefono || '',
      customerEmail: clientData.email,

      // Items (desde reservaData con datos reales)
      items: [{
        code: reservaData.paquete?.codigo || 'PKG-001',
        description: reservaData.paquete?.nombre || 'Paquete Turístico',
        unitMeasure: 'Unidad',
        quantity: reservaData.cantidad_pasajeros || 1,
        unitPrice: reservaData.precio_unitario || 0,
        discount: 0,
        taxType: configFacturaData.subtipo_impuesto_nombre?.includes('10') ? 'iva10' :
                 configFacturaData.subtipo_impuesto_nombre?.includes('5') ? 'iva5' : 'exenta'
      }]
    };
  }

  const buildInvoicePreviewData = (): InvoiceData | null => {
    if (!clienteData) {
      return null;
    }
    return buildInvoicePreviewDataWithClient(clienteData);
  }

  // Bloquear scroll del modal padre cuando AsignarPasajeroModal está abierto
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

  // Limpiar el contexto cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData(null);
      setClienteData(null);
      setInvoiceData(null);
      setPayLoad(null);
      setActiveTab('form');
    }
  }, [isOpen]);

  // Función para generar el payload del asignacion de pasajero
  // const generarPayloadPago = () => {
  //   const payload: any = {
  //     // persona_id: selectedPersonaID,
  //   };

  //   return payload;
  // };

  // const handleDataNoPersonaSeleccionada = (value: boolean | undefined) => {
  //   console.log(value)
  //   setPersonaNoSeleccionada(value);
  // }

  // const {data: dataPersonaList, isFetching: isFetchingPersonas} = useQuery({
  //   queryKey: ['personas-disponibles', 1, 10, {activo: true, tipo: 'fisica', sexo: 'all', busqueda: personaBusqueda}], //data cached 
  //   queryFn: () => fetchDataPersonaTitular(1, 10, {activo: true, tipo: 'fisica', sexo: 'all', busqueda: personaBusqueda}),
  //   staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
  //   enabled: isOpen && Boolean(personaBusqueda)
  // ,
  // });
  
  
  if (!isOpen) return null;



  return createPortal(
    <FacturaContext.Provider
      value={{
        clienteData,
        setClienteData,
        invoiceData,
        setInvoiceData,
        configFacturaData,
        payLoad,
        setPayLoad,
        activeTab,
        setActiveTab,
        formData,
        setFormData,
        reservaData,
      }}
    >
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
        style={{ zIndex: 99999 }}
      >
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[95vh] h-[80vh] overflow-y-auto">
            <div className="absolute top-25 right-40 flex space-x-2">
                  
                  <Button
                    onClick={onClose}
                    className="cursor-pointer w-10 h-10 bg-gray-200 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </Button>
                </div>
              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                <Card className="p-8 bg-white border-2 border-blue-200">
                  <div className="space-y-6">
                      <div className="flex items-center justify-between b pb-4 ">
                        <div>
                            <div className='flex w-full justify-between'>
                              <h2 className="text-2xl font-bold">Registro de Factura - Paquetes de Viajes</h2>
                              <FileText className="h-8 w-8 text-blue-600" />
                            </div>

                          <p className='pt-3 text-gray-500'>
                            Registro de facturas para paquetes turísticos
                          </p>
                        </div>
                      </div>
                    
                      {/* <div className="grid grid-cols-1 gap-6">
                          Inputs                      
                      </div> */}
                  
                  </div> 
                </Card>
              </div>

              <div className="px-6 py-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                    <TabsTrigger className='cursor-pointer' value="form">Formulario</TabsTrigger>
                    <TabsTrigger
                      className='cursor-pointer'
                      value="preview"
                      disabled={!clienteData}
                      onClick={() => {
                        const previewData = buildInvoicePreviewData();
                        if (previewData) {
                          setInvoiceData(previewData);
                        }
                      }}
                    >
                      Vista Previa
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="form" className="mt-6">
                    <div className="max-w-4xl mx-auto">
                      {/* <InvoiceForm onInvoiceGenerated={handleInvoiceGenerated} /> */}
                      <InfoFacturaTitular 
                        onInvoiceGenerated={handleInvoiceGenerated}
                        isPending={isPending}
                        onClose={onClose}
                        />
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="mt-6">
                    <div className="max-w-4xl mx-auto">
                      {invoiceData ? (
                        <DescargarFacturaPreview 
                            data={invoiceData} 
                            isPending={isPending}
                            onConfirm={() => {
                            console.log(payLoad);
                            onConfirm(payLoad);
                            }
                        }/>
                      ) : (
                        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                          <p className="text-muted-foreground">Complete el formulario para ver la vista previa de la factura</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Footer */}
              {/* <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
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
                  disabled={isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(generarPayloadPago())
                    // if(!selectedPasajeroId)
                    //   handleShowToast('Debes seleccionar primero a la persona', 'error'); 
                    // else
                    //   onConfirm(generarPayloadPago(), selectedPasajeroId)
                  }}
                  className="px-6 py-5 bg-green-600 text-white font-medium rounded-lg
                          cursor-pointer hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ?
                    <>
                        <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                        generando..
                    </> :
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Generar factura
                    </>}
                </Button>
              </div> */}
          </div>
      </div>
    </FacturaContext.Provider>,
    
    document.body
  );
}
