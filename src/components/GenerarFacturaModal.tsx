/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { Moneda } from '@/types/reservas';
import { CheckCircle2, FileText, Loader2Icon, Mail, MapPin, Phone, } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useState, useEffect, use } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDataPersonaTitular } from './utils/httpReservas';
import { Avatar, AvatarFallback } from './ui/avatar';
import { getPrimerNombreApellido } from '@/helper/formatter';
import { ToastContext } from '@/context/ToastContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { InfoFacturaTitular, type ClienteFacturaData } from './InfoFacturaTitular';


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
}: GenerarFacturaModalProps) {
  const [invoiceData, setInvoiceData] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("form")

  // const {handleShowToast} = use(ToastContext);
  // Extraer datos necesarios de la reserva


  const handleInvoiceGenerated = async (data: ClienteFacturaData) => {
    console.log('Datos del formulario:', data);

    // Aquí ya tienes acceso limpio a:
    // data.nombre, data.ruc, data.email, data.telefono, data.direccion

    // Ejemplo: Construir payload para el backend
    const payload = {
        nombre: data.nombre,
        ruc: data.ruc,
        email: data.email,
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        tipo_documento: data.tipo_documento || '',
      };
      // reserva_id: reservaData.id,
      // pasajero_id: selectedPasajeroId,
    

    onConfirm(payload);

    // setInvoiceData(data);
    // setActiveTab("preview");
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
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 99999 }}
    >
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[95vh] h-[80vh] overflow-y-auto">
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
                  <TabsTrigger className='cursor-pointer' value="preview">Vista Previa</TabsTrigger>
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
                      // <InvoicePreview data={invoiceData} />
                      <p></p>
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
    </div>,
    document.body
  );
}
