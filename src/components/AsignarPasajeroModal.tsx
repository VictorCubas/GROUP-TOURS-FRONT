/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { Moneda } from '@/types/reservas';
import { CheckCircle2, FileText, Loader2Icon, Mail, MapPin, Phone, UserPlus2Icon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useState, useEffect, use } from 'react';
import { createPortal } from 'react-dom';
import { DinamicSearchSelect } from './DinamicSearchSelect';
import { Label } from './ui/label';
import type { Persona } from '@/types/empleados';
import { useQuery } from '@tanstack/react-query';
import { fetchDataPersonaTitular } from './utils/httpReservas';
import { Avatar, AvatarFallback } from './ui/avatar';
import { getPrimerNombreApellido } from '@/helper/formatter';
import { ToastContext } from '@/context/ToastContext';


interface AsignarPasajeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any, pasajeroId: number | string) => void;
  isPending: boolean;
  reservaData: any; // Datos completos de la reserva desde el backend
  selectedPasajeroId?: number; // ID del pasajero específico para pago individual
}

export default function AsignarPasajeroModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  selectedPasajeroId,
}: AsignarPasajeroModalProps) {

  const [newDataPersonaList, setNewDataPersonaList] = useState<Persona[]>();

  const {handleShowToast} = use(ToastContext);
  // Extraer datos necesarios de la reserva
  const [selectedPersonaData, setSelectedPersonaData] = useState<any | undefined>();
  const [personaBusqueda, setPersonaBusqueda] = useState<string>("");
  const [selectedPersonaID, setSelectedPersonaID] = useState<number | "">("");


  // Encontrar el índice del pasajero seleccionado
  // const selectedPassengerIndex = isSinglePassengerMode
  //   ? reservaData?.pasajeros?.findIndex((p: any) => p.id === selectedPasajeroId)
  //   : -1;

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
  const generarPayloadPago = () => {
    const payload: any = {
      persona_id: selectedPersonaID,
    };

    return payload;
  };

  // const handleDataNoPersonaSeleccionada = (value: boolean | undefined) => {
  //   console.log(value)
  //   setPersonaNoSeleccionada(value);
  // }

  const {data: dataPersonaList, isFetching: isFetchingPersonas} = useQuery({
    queryKey: ['personas-disponibles', 1, 10, {activo: true, tipo: 'fisica', sexo: 'all', busqueda: personaBusqueda}], //data cached 
    queryFn: () => fetchDataPersonaTitular(1, 10, {activo: true, tipo: 'fisica', sexo: 'all', busqueda: personaBusqueda}),
    staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
    // enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
    enabled: isOpen && Boolean(personaBusqueda)
  ,
  });


  useEffect(() => {  
    if(dataPersonaList){
        console.log(dataPersonaList);

        const dataPersonasTitular = dataPersonaList.map((data: any) => ({
          ...data, tipo_documento_nombre: data?.tipo_documento?.nombre
        }))

      console.log(dataPersonasTitular)
      console.log('dataPersonaList: ', dataPersonasTitular)
      setNewDataPersonaList([...dataPersonasTitular])
      
    }
  }, [dataPersonaList]); 


  useEffect(() => {
    if(isFetchingPersonas){
      setNewDataPersonaList([])
    }
  }, [isFetchingPersonas]);
  
  
  if (!isOpen) return null;
  
  
  console.log(dataPersonaList);
  console.log(selectedPasajeroId);
  console.log(selectedPersonaData)
  console.log(selectedPersonaID)

  // {
  //   id: 18,
  //   tipo: 'fisica',
  //   nombre: 'Andrea Army',
  //   apellido: 'Escurra',
  //   fecha_nacimiento: '2005-01-01',
  //   edad: 20,
  //   sexo: 'F',
  //   nacionalidad: { id: 11, nombre: 'Corea del Sur', codigo_alpha2: 'KR' },
  //   documento: '4504883',
  //   email: 'escurracaceres.andy@gmail.com',
  //   telefono: '0985871579',
  //   direccion: 'Caacupe',
  //   activo: true,
  //   fecha_creacion: '2025-08-28T01:32:53+0000',
  //   fecha_modificacion: '2025-08-28T01:32:53+0000',
  //   tipo_documento: { id: 1, nombre: 'CI', descripcion: 'Cedula de Identidad' },
  //   tipo_documento_nombre: 'CI'
  // }

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    return parts
      .map((p) => p[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }


  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 99999 }}
    >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] h-[65vh] overflow-y-auto">
            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              <Card className="p-8 bg-white border-2 border-blue-200">
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4 ">
                      <div>
                          <div className='flex w-full justify-between'>
                            <h2 className="text-2xl font-bold">Asignación de pasajeo</h2>
                            <UserPlus2Icon className="h-8 w-8 text-blue-600" />
                          </div>

                        <p className='pt-3 text-gray-500'>
                          Busca y selecciona una persona de la lista precargada para asignar a este pasajero
                        </p>
                      </div>
                    </div>
                  
                    <div className="grid grid-cols-1 gap-6">
                        {/* Columna izquierda: Titular */}
                        <div className="space-y-2 mi-select-wrapper">
                          <Label htmlFor="persona" className="text-gray-700 font-medium">
                            Persona *
                          </Label>

                          <DinamicSearchSelect
                            // disabled={!!dataAEditar}
                            dataList={newDataPersonaList || []}
                            value={selectedPersonaID}
                            onValueChange={setSelectedPersonaID}
                            setSelectedTitularData={setSelectedPersonaData}
                            // handleDataNoSeleccionada={handleDataNoPersonaSeleccionada}
                            onSearchChange={setPersonaBusqueda}
                            isFetchingPersonas={isFetchingPersonas}
                            placeholder="Buscar persona por documento o nombre..."
                            labelKey='documento'
                            secondaryLabelKey='documento'
                            thirdLabelKey='tipo_documento_nombre'
                            valueKey="id"
                          />

                          {/* {(personaNoSeleccionada === false ||
                            (onGuardar === true && personaNoSeleccionada === undefined)) && (
                            <p className="text-red-400 text-sm">Este campo es requerido</p>
                          )} */}
                        </div>

                      
                    </div>
                
                </div> 
              </Card>
            </div>

            <div className="px-6 py-1">
              <Card className="p-8 bg-white  h-50 border-2 border-blue-200 ">
                {selectedPersonaID ?
                  <div className="space-y-6">

                    {/* <button
                      className={`w-full rounded-lg border p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50 ${
                        selectedPerson?.id === person.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-border bg-card"
                      }`}
                    > */}
                    <button
                      className={`w-full rounded-lg border p-4 text-left transition-all border-blue-500 bg-blue-50 cursor-pointer`}
                    >
                      <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 bg-blue-100">
                            <AvatarFallback className="text-blue-600">{getInitials(getPrimerNombreApellido(selectedPersonaData?.nombre, selectedPersonaData?.apellido))}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{getPrimerNombreApellido(selectedPersonaData?.nombre, selectedPersonaData?.apellido)}</h4>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                <span>{selectedPersonaData?.tipo_documento_nombre}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <span className="font-medium">{selectedPersonaData?.documento}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{selectedPersonaData?.telefono}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                <span className="truncate">{selectedPersonaData?.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{selectedPersonaData?.nacionalidad?.nombre}</span>
                              </div>
                              <div className="text-muted-foreground">
                                <span>{selectedPersonaData?.sexo ? (selectedPersonaData?.sexo === 'F' ? 'Femenino' : 'Masculino'): 'Sin especificar'} </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                  </div> :
                  <div className='flex items-center w-full justify-center mt-10'>
                    <p className='text-gray-500 text-center'>
                      Filtre la persona a asignar
                    </p>
                  </div>
                }
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
                disabled={isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(generarPayloadPago())
                  if(!selectedPasajeroId)
                    handleShowToast('Debes seleccionar primero a la persona', 'error'); 
                  else
                    onConfirm(generarPayloadPago(), selectedPasajeroId)
                }}
                className="px-6 py-5 bg-green-600 text-white font-medium rounded-lg
                        cursor-pointer hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ?
                  <>
                      <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                      Asignando...
                  </> :
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Asignar pasajero
                  </>}
              </Button>
            </div>
        </div>
    </div>,
    document.body
  );
}
