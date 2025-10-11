/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, use, startTransition } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Check,
  X,
  Download,
  Eye,
  Calendar,
  Loader2Icon,
  CheckIcon,
  Boxes,
  Shield,
  Star,
  Building2,
  BedIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from "react-icons/fa"
import { useMutation, useQuery } from "@tanstack/react-query"
import { activarDesactivarData, fetchData, fetchDataCadenas, fetchDataHoteles, fetchDataServiciosTodos, fetchResumen, guardarDataEditado, nuevoDataFetch } from "@/components/utils/httpHotel"
import type { Hotel, HotelPaginatedResponse } from "@/types/hotel"
import { ToastContext } from "@/context/ToastContext"
import { Controller, useForm } from "react-hook-form"
import { capitalizePrimeraLetra, formatearFecha, formatearSeparadorMiles } from "@/helper/formatter"
import { queryClient } from "@/components/utils/http"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { fetchDataCiudadesTodos, fetchDataNacionalidadTodos } from "@/components/utils/httpNacionalidades"
import { CountrySearchSelect } from "@/components/CountrySearchSelect"
import { useSessionStore } from "@/store/sessionStore"
import { DinamicSearchSelect } from "@/components/DinamicSearchSelect"
import type { Moneda } from "@/types/paquetes"
import type { Servicio } from "@/types/hotel"
import { GenericSearchSelect } from "@/components/GenericSearchSelect"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { fetchDataMonedaTodos } from "@/components/utils/httpPaquete"


const roleStatusColors = {
  true: "bg-emerald-100 text-emerald-700 border-emerald-200",
  false: "bg-gray-100 text-gray-700 border-gray-200",
}

let dataList: Hotel[] = [];

export default function HotelPage() {
  const {siTienePermiso } = useSessionStore();
  const [newDataCiudadList, setNewDataCiudadList] = useState<Hotel[]>();
  const [paisDataSelected, setPaisDataSelected] = useState<any>();
  const [selectedCiudadID, setSelectedCiudadID] = useState<number | "">("");
  const [selectedCadenaID, setSelectedCadenaID] = useState<number | "">("");
  const [cadenaNoSeleccionada, setCadenaNoSeleccionada] = useState<boolean | undefined>();
  const [ciudadBusqueda, setCiudadBusqueda] = useState<string>("");
  const [ciudadNoSeleccionada, setCiudadNoSeleccionada] = useState<boolean | undefined>();
  const [selectedNacionalidadID, setSelectedNacionalidadid] = useState<number | "">("");
  const [nacionalidadNoSeleccionada, setNacionalidadNoSeleccionada] = useState<boolean | undefined>();
  const [busquedaPorFiltro, setBusquedaPorFiltro] = useState("")
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [dataAEditar, setDataAEditar] = useState<Hotel>();
  const [dataADesactivar, setDataADesactivar] = useState<Hotel>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerData, setOnVerData] = useState(false);
  const [dataDetalle, setDataDetalle] = useState<Hotel>();
  const {handleShowToast} = use(ToastContext);
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [onGuardar, setOnGuardar] = useState(false);
  const [filtros, setFiltros] = useState({
                  activo: true,   // null = todos, true = solo activos
                  fecha_desde: "",
                  fecha_hasta: "",
                  nombre: "",
                  estrellas: "",
                });
  
  // DATOS DEL FORMULARIO 
  const {register, control, watch, handleSubmit, formState: {errors, }, setValue, reset, clearErrors} = 
            useForm<any>({
              mode: "onBlur",
              defaultValues: {
                nombre: "",
                descripcion: "",
                estrellas: 4,
                estrellas_filtros: 0,
                moneda: '2'
              }
            });
  // DATOS DEL FORMULARIO 

  //DATOS DE HABITACION
  const [rooms, setRooms] = useState<any[]>([])

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    number: "",
    type: "",
    capacity: 1,
    price: 0,
    currency: "2",
  })

  const [isEditMode, setIsEditMode] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)

  //DATOS DE HABITACION
  


  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('list');
  const [paginacion, setPaginacion] = useState<HotelPaginatedResponse>({
                                                      next: null,
                                                      totalItems: 5,
                                                      previous: null,
                                                      totalPages: 5,
                                                      results: [],
                                                      pageSize: 10
                                              });


  const {data, isFetching, isError} = useQuery({
      queryKey: ['hoteles', currentPage, paginacion.pageSize, filtros], //data cached
      queryFn: () => fetchData(currentPage, paginacion.pageSize, filtros),
      staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
      enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
    });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['hoteles-resumen'], //data cached
    queryFn: () => fetchResumen(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  const {data: dataHotelesList, isFetching: isFetchingHoteles,} = useQuery({
      queryKey: ['todos-hoteles',], //data cached
      queryFn: () => fetchDataHoteles(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  console.log(isFetchingHoteles)

  const {data: dataCadenaList, isFetching: isFetchingCadenas,} = useQuery({
      queryKey: ['todos-cadenas',], //data cached
      queryFn: () => fetchDataCadenas(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });


  const {data: dataNacionalidadList, isFetching: isFetchingNacionalidad,} = useQuery({
        queryKey: ['nacionalidades-de-personas',], //data cached
        queryFn: () => fetchDataNacionalidadTodos(),
        staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
      });

  const {data: dataCiudadList, isFetching: isFetchingCiudad,} = useQuery({
        queryKey: ['ciudades-disponibles', ciudadBusqueda, paisDataSelected?.id], //data cached
        queryFn: () => fetchDataCiudadesTodos(ciudadBusqueda, paisDataSelected?.id),
        staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
      });


  const {data: dataServiciosList, isFetching: isFetchingServicios,} = useQuery({
        queryKey: ['servicios-disponibles',], //data cached
        queryFn: () => fetchDataServiciosTodos(),
        staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
      });

  const {data: dataMonedaList, isFetching: isFetchingMoneda,} = useQuery({
        queryKey: ['monedas-disponibles',], //data cached
        queryFn: () => fetchDataMonedaTodos(),
        staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
      });

      console.log(isFetchingMoneda)

  if(!isFetching && !isError){
    if(data?.results){
      dataList = data.results.map((per: Hotel, index: number) => ({...per, numero: index + 1}));
    }
  }


  useEffect(() => {
      if(isFetchingCiudad){
        setNewDataCiudadList([])
      }
    }, [isFetchingCiudad]);
    

  useEffect(() => {
      if(selectedNacionalidadID){
        const selectedPais = dataNacionalidadList.filter((pais: any) => pais.id.toString() === selectedNacionalidadID.toString());

        if(selectedPais.length){
          const pais = selectedPais[0];
          console.log('pais: ', pais);
          // const selectedCiudad = dataNacionalidadList.filter((ciudad: any) => ciudad.id.toString() === selectedNacionalidadID.toString());
          setPaisDataSelected(pais);
          if(!dataAEditar){
            setSelectedCiudadID("");
            setCiudadBusqueda("");
          }
        }
      }
    }, [dataAEditar, dataNacionalidadList, selectedNacionalidadID]);

  useEffect(() => {  
    if(dataCiudadList){
      if(dataAEditar){
        setNewDataCiudadList([...dataCiudadList, dataAEditar.ciudad]);
      }
      else{
        setNewDataCiudadList([...dataCiudadList])
      }
    }
  }, [dataAEditar, dataCiudadList]);


  // Cálculos de paginación
  const totalItems = dataList?.length
  // const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * paginacion.pageSize
  const endIndex = startIndex + paginacion.pageSize
  // const paginatedPermisos = filteredPermissions.slice(startIndex, endIndex);

  // Función para cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }

  // Función para cambiar items por página
  const handleItemsPerPageChange = (value: string) => {
    // setItemsPerPage(Number(value))
    setPaginacion(prevPagination => ({...prevPagination, pageSize: Number(value)}))
    setCurrentPage(1) // Reset a la primera página
  }

    useEffect(() => {
      if (!data) return;
      setPaginacion({
              next: data?.next ?? null,
              totalItems: data?.count ?? null,
              previous: data?.previous ??  null,
              totalPages: data?.totalPages,
              results: [],
              pageSize: data?.pageSize ?? null
            });
    }, [data])


  const handleReset = () => {
    startTransition(() => {
        setShowActiveOnly(true);
        setBusquedaPorFiltro("")
      });
  }


  
  const handleActiveOnly = () => {
    setShowActiveOnly(prev => !prev)
    setFiltros({ ...filtros, activo: !showActiveOnly })
    setCurrentPage(1);
  }

  useEffect(() => {
      const handler = setTimeout(() => {
        console.log('cambiando nombre')
        setFiltros(filtroAnterior => ({
          ...filtroAnterior, nombre: busquedaPorFiltro,
        }))
      }, 750) // ⏱️ medio segundo de espera
  
      return () => {
        clearTimeout(handler) // limpia el timeout si se sigue escribiendo
      }
    }, [busquedaPorFiltro,]);
  

  const {mutate, isPending: isPendingMutation} = useMutation({
    mutationFn: nuevoDataFetch,
    onSuccess: () => {
        handleShowToast('Se ha creado un nuevo hotel satisfactoriamente', 'success');
        reset({
            nombre: "",
            descripcion: "",
          });

        setSelectedPermissions([])
        setSelectedNacionalidadid("")
        setSelectedCadenaID("");
        handleCadenaNoSeleccionada(undefined);
        setOnGuardar(false);
        
        handleCancel();

        setActiveTab('list');
         queryClient.invalidateQueries({
          queryKey: ['hoteles'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['hoteles-resumen'],
        });

        queryClient.invalidateQueries({
          queryKey: ['todos-hoteles'],
        });

          queryClient.invalidateQueries({
            queryKey: ['paquetes'],
            exact: false
          });

        queryClient.invalidateQueries({
          queryKey: ['paquetes-resumen'],
        });
    },
  });

  const {mutate: mutateGuardarEditado, isPending: isPendingEdit} = useMutation({
    mutationFn: guardarDataEditado,
    onSuccess: () => {
        handleShowToast('Se ha guardado el modulo satisfactoriamente', 'success');
        setDataAEditar(undefined);
        setSelectedNacionalidadid("");
        setOnGuardar(false);
        setSelectedCiudadID("");
        setPaisDataSelected(undefined);
        handleCancel();
        setActiveTab('list');
         queryClient.invalidateQueries({
          queryKey: ['hoteles'],
          exact: false
        });

         queryClient.invalidateQueries({
          queryKey: ['hoteles-resumen'],
        });

        queryClient.invalidateQueries({
          queryKey: ['todos-hoteles'],
        });

        queryClient.invalidateQueries({
          queryKey: ['hoteles'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['usuarios'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['usuarios-resumen'],
        });
    },
  });

  const {mutate: mutateDesactivar, isPending: isPendingDesactivar} = useMutation({
    mutationFn: activarDesactivarData,
    onSuccess: () => {
        handleShowToast('Se ha desactivado el modulo satisfactoriamente', 'success');
        setOnDesactivarData(false);
        setDataADesactivar(undefined);
        //desactivamos todas las queies
        queryClient.invalidateQueries({
          queryKey: ['hoteles'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['hoteles-resumen'],
        });

        queryClient.invalidateQueries({
          queryKey: ['todos-hoteles'],
        });
    },
  });


  const handleCancel = () => {
        setOnGuardar(false);
        setDataAEditar(undefined);
        setNewDataCiudadList([...dataCiudadList]);
        setSelectedCiudadID("");
        setSelectedNacionalidadid("");
        setSelectedCadenaID("");
        setPaisDataSelected(undefined);
        handleDataNoCiudadSeleccionada(undefined);
        handleCadenaNoSeleccionada(undefined);
        reset({
            nombre: "",
            descripcion: "",
            estrellas: 4,
            direccion: "",
          });
        setActiveTab('list');
        setRooms([]);
  }


  const handleGuardarNuevaData = async (dataForm: any) => {

    console.log('dataForm: ', dataForm);
    console.log('selectedPermissions: ', selectedPermissions)
    console.log('newRoom: ', newRoom);
    console.log('rooms: ', rooms);
    console.log('selectedCiudadID: ', selectedCiudadID);

    if (cadenaNoSeleccionada === undefined) {
        setCadenaNoSeleccionada(true);
        return;
      }

    
//       "servicios": [],
// //       "activo": true
    const habitaciones = rooms.map(room => ({
      numero: room.number,
      tipo: room.type,
      capacidad: room.capacity,
      precio_noche: room.price,
      moneda: room.currency,
      activo: true,
      servicios: []
    }))
    
    const payload = {...dataForm, 
        activo: true, 
        en_uso: false, 
        ciudad: selectedCiudadID,
        cadena: selectedCadenaID,
        servicios: selectedPermissions,
        habitaciones: [...habitaciones]
      }

      
      
      delete payload.estrellas_filtros;
      delete payload.moneda;
      console.log(payload)
    
    if(selectedPermissions.length){
      mutate(payload);
    }
  }

  const handleGuardarDataEditado = async (dataForm: any) => {
    const dataEditado = {...dataAEditar, ...dataForm};
    delete dataEditado.numero;
    delete dataEditado.hoteles;
    delete dataEditado.fecha_creacion;
    delete dataEditado.fecha_modificacion;
    delete dataEditado.estrellas_filtros;

    if (cadenaNoSeleccionada === undefined) {
        setCadenaNoSeleccionada(true);
        return;
      }


    console.log(rooms)
    const habitaciones = rooms.map(room => ({
      numero: room.number,
      tipo: room.type,
      capacidad: room.capacity,
      precio_noche: room.price,
      moneda: room.currency,
      activo: true,
      servicios: []
    }))
    
    const payload = {...dataForm, 
        // activo: true, 
        // en_uso: false, 
        ciudad: selectedCiudadID,
        cadena: selectedCadenaID,
        servicios: selectedPermissions,
        habitaciones: [...habitaciones]
      }

      
      
      delete payload.moneda;
      console.log(payload)
    
    if(selectedPermissions.length){
      mutateGuardarEditado(payload);
    }
  }



  useEffect(() => {
      if (dataAEditar) {
        console.log('reset data para editar: ', dataAEditar)
        reset({
          ...dataAEditar,
          nombre: dataAEditar.nombre,
          // ciudad: dataAEditar.ciudad.id.toString(),
          // nacionalidad: dataAEditar.ciudad.pais_id.toString(),
        });

      }
    }, [dataAEditar, reset]);


  const handleEditar = (data: Hotel) => {
    setActiveTab('form');
    setDataAEditar(data);
    console.log(data)

    // ciudad_id: selectedCiudadID,
    //             hoteles_ids: selectedPermissions,
    //             pais_id: selectedNacionalidadID,
    //             destino_id: selectedCadenaID,
    // const hoteles = data.hoteles;
    // const hotelesIds = hoteles.map(hotel => hotel.id)
    // console.log(data)
    // console.log('dataAEditar.persona.id: ', data.ciudad)
    // setSelectedNacionalidadid(Number(data.ciudad.pais_id));
    // setSelectedCiudadID(data.ciudad.id); 
    setSelectedCadenaID(data.cadena)
    // setSelectedNacionalidadid(data.cadena);
    setSelectedCiudadID(data.ciudad);
    setSelectedNacionalidadid(data.pais_id)
    setSelectedPermissions(data.servicios);

    // number: "",
    // type: "",
    // capacity: 1,
    // price: 0,
    // currency: "",
    const habitaciones = data.habitaciones.map(room => ({
      id: room.id,
      number: room.numero,
      type: room.tipo,
      capacity: room.capacidad,
      price: room.precio_noche,
      currency: room.moneda,
    }))

    //  habitaciones: [
    //   {
    //     id: 6,
    //     hotel: 23,
    //     numero: '100',
    //     tipo: 'doble',
    //     capacidad: 2,
    //     precio_noche: 260000,
    //     moneda: 1,
    //     moneda_nombre: 'Guaraní',
    //     servicios: [],
    //     activo: true,
    //     fecha_creacion: '2025-09-19T16:32:29+0000',
    //     fecha_modificacion: '2025-09-19T16:32:29+0000'
    //   }
    // ],
    setRooms([...habitaciones]);
  }

  console.log(rooms)

  const toggleActivar = (modulo: Hotel) => {
    setOnDesactivarData(true);
    setDataADesactivar(modulo);
  }

  const handleCloseModal = () => {
    setOnDesactivarData(false);
  }

  const handleConfirmActivo = (activo=true) => {
    mutateDesactivar({ dataId: dataADesactivar!.id, activo })
  }

  const handleVerDetalles = (data: Hotel) => {
    setDataDetalle(data);
    setOnVerData(true);
  }

  const handleCloseVerDetalles = () => {
    setOnVerData(false);
    setDataDetalle(undefined);
  }

  const handleCadenaNoSeleccionada = (value: boolean | undefined) => {
    setCadenaNoSeleccionada(value);
  }


  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const updated =
        prev.includes(permissionId)
          ? prev.filter((p) => p !== permissionId) // quitar
          : [...prev, permissionId];              // agregar

      return updated;
    });
  };


  const handleNacionalidadNoSeleccionada = (value: boolean | undefined) => {
    setNacionalidadNoSeleccionada(value);
  };

  const handleDataNoCiudadSeleccionada = (value: boolean | undefined) => {
    setCiudadNoSeleccionada(value);
  }

  console.log(rooms)

  // FUNCIONES DE HABITACION
  const handleAddRoom = () => { 
    if (!newRoom.number || !newRoom.type || newRoom.price <= 0) {
      return; // Validación básica
    }

    console.log(isEditMode);
    console.log(editingRoomId);

    if (isEditMode && editingRoomId) {
      // 🔹 Editando habitación existente
      // console.log(newRoom)
      const roomEdited = {...newRoom, currency: watch('moneda')};
      console.log(roomEdited)
      setRooms((prev) =>
        prev.map((room) =>
          room.id === editingRoomId
            ? { ...room, ...roomEdited } // Reemplazamos los valores con los del formulario
            : room
        )
      );
    } else {
      // 🔹 Agregando nueva habitación
      const room: any = {
        id: Date.now().toString(), // ID temporal
        ...newRoom,
        currency: watch('moneda'), // o newRoom.currency
      };
      setRooms((prev) => {
        console.log(prev)
        return [...prev, room]
      });
    }

    // Resetear formulario
    resetRoomForm();
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== roomId))
  }

  const resetRoomForm = () => {
    setNewRoom({
      number: "",
      type: "",
      capacity: 1,
      price: 0,
      currency: "2",
    })
    setIsAddRoomOpen(false);
    setIsEditMode(false);
    setEditingRoomId(null);
  }

  const handleEditRoom = (room: any) => {
    // ciudad_id: selectedCiudadID,
    //             hoteles_ids: selectedPermissions,
    //             pais_id: selectedNacionalidadID,
    //             destino_id: selectedCadenaID,

    console.log(room) 
      setNewRoom({
        number: room.number,
        type: room.type,
        capacity: room.capacity,
        price: room.price,
        currency: room.currency, // 🔹 esto está bien
      });

      setEditingRoomId(room.id);
      setIsEditMode(true);
      setIsAddRoomOpen(true);

      // 🔹 Seteamos el value del Controller también
      setValue('moneda', room.currency.toString()); 
    };
      // FUNCIONES DE HABITACION

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`h-3 w-3 ${
              index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <>
      {onVerData && <Modal onClose={handleCloseVerDetalles} claseCss={'modal-detalles'}>
            <div className=" bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                      <Boxes className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 capitalize">
                        {dataDetalle?.nombre}
                      </h2>
                      <p className="text-gray-600">Detalles completos del hotel</p>
                    </div>
                  </div>
                </div>

                
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Estado</Label>
                        <div className="mt-1">
                          <Badge
                            className={roleStatusColors[dataDetalle?.activo.toString() as keyof typeof roleStatusColors]}
                          >
                            {dataDetalle?.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Clasificación por Estrellas</Label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="p-1"
                            >
                              <Star
                                className={`h-6 w-6 cursor-pointer ${
                                  star <= dataDetalle!.estrellas ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-500">Descripción</Label>
                        <p className="mt-1 text-gray-900">{dataDetalle?.descripcion}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-500">Cadena Hotelera</Label>
                        <Badge
                          className={dataDetalle?.cadena_nombre ? `text-xs bg-blue-100 text-blue-700 border-blue-200` :
                                "bg-gray-100 text-gray-700 border-gray-200"
                          }
                        >
                          {dataDetalle?.cadena_nombre ?? 'Independiente'}
                        </Badge>
                      </div>
                    </div>


                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Habitaciones ({dataDetalle?.habitaciones.length})
                      </Label>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        {dataDetalle?.habitaciones.map((habitacion, index) => (
                          <>
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <BedIcon className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{habitacion.tipo}</span>

                               <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                  {habitacion?.moneda_simbolo}{habitacion?.precio_noche} <span className="text-gray-500 font-normal"> / noche</span>
                                </Badge>
                            </div>

                         
                          </>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Servicios ({dataDetalle?.servicios_detalle.length})
                      </Label>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        {dataDetalle?.servicios_detalle.map((servicio, index) => (
                          <>
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <BedIcon className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{servicio.nombre}</span>

                               {/* <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                  {servicio?.moneda_simbolo}{servicio?.precio_noche} <span className="text-gray-500 font-normal"> / noche</span>
                                </Badge> */}
                            </div>

                         
                          </>
                        ))}
                      </div>
                    </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Fecha Creación</Label>
                          <p className="mt-1 text-gray-900">
                            {formatearFecha(dataDetalle?.fecha_creacion ?? '')}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-500">Última Modificación</Label>
                          <p className="mt-1 text-gray-900">
                            {formatearFecha(dataDetalle?.fecha_modificacion ?? '')}
                          </p>
                        </div>
                      </div>
                  </div>


                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleCloseVerDetalles}
                    className="cursor-pointer border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                    {/* <button
                      onClick={() => {}}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar Módulo
                    </button> */}
                </div>
              </div>

        </Modal>}

      {onDesactivarData && 
        <Modal onClose={handleCloseModal} claseCss="modal">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${dataADesactivar!.activo ? 'bg-red-100 dark:bg-red-900/20': 'bg-green-100 dark:bg-green-900/20'} `}>
                    {dataADesactivar!.activo && <IoWarningOutline className="h-8 w-8 text-red-600 dark:text-red-400" />}
                    {!dataADesactivar!.activo && <IoCheckmarkCircleOutline className="h-8 w-8 text-green-600 dark:text-green-400" />}
                    
                </div>
                <h2 className='text-center'>Confirmacion de operación</h2>
              <p className=' text-gray-600 dark:text-gray-400 mt-2 text-justify'>
                ¿Estás seguro de que deseas {dataADesactivar!.activo ? 'desactivar' : 'activar'} el hotel de <b>{capitalizePrimeraLetra(dataADesactivar?.nombre ?? '')}</b>? 
              </p>

              <div className='modal-actions'>
                    <Button className="hover:bg-transparent cursor-pointer bg-transparent text-gray-700" onClick={handleCloseModal}>Cancelar</Button>
                    <Button 
                      disabled={isPendingDesactivar}
                      className={`cursor-pointer ${dataADesactivar!.activo ? 'bg-red-500 hover:bg-red-600': 'bg-green-500 hover:bg-green-600'} flex justify-center 
                                  items-center shadow-none hover:shadow-none`}
                                  onClick={() => handleConfirmActivo(!dataADesactivar!.activo)}>
                                    {!isPendingDesactivar ? 'Aceptar': 'Procesando..'}
                    </Button>
              </div>
        </Modal>}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">Hotel</h1>
            </div>
            <p className="text-gray-600">Gestiona los hoteles del sistema de manera eficiente</p>
          </div>
          <div className="flex gap-3">
              {siTienePermiso("hoteles", "exportar") && 
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
              }

              {siTienePermiso("hoteles", "crear") && (
                <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  onClick={() => setActiveTab('form')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              )}
            </div>
        </div>

        {/* Stats Cards */}
        {/* <ResumenCards {...dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/> */}
        {/* <ResumenCards {...dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/> */}
        <ResumenCardsDinamico resumen={dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-80 bg-gray-100">
            <TabsTrigger  value="list" className="cursor-pointer data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Lista de Hoteles
            </TabsTrigger>
             <TabsTrigger disabled={!siTienePermiso("hoteles", "crear")} 
              value="form" className="cursor-pointer data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Crear Hotel
            </TabsTrigger>
          </TabsList>


          {/* Registration Form Tab */}
          <TabsContent value="form">
            <form onSubmit={handleSubmit(!dataAEditar ? handleGuardarNuevaData: handleGuardarDataEditado)}>
              <Card className="border-emerald-200 pt-0">
                <CardHeader className="bg-emerald-50 border-b border-emerald-200 pt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-emerald-900">Crear Nuevo Hotel</CardTitle>
                      <CardDescription className="text-emerald-700">
                        Complete la información para crear un nuevo hotel
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NOMBRE */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Nombre del Hotel *
                      </Label>
                    <Input
                        id="nombre"
                        autoComplete="nombre"
                        placeholder="Nombre del hotel"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...register('nombre', {
                        required: true, 
                        validate: {blankSpace: (value) => !!value.trim()},
                        minLength: 3})}
                      />
                      <div>
                        {(errors?.nombre?.type === 'required' || errors?.nombre?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                        {errors?.nombre?.type === 'minLength' && <span className='text-red-400 text-sm'>El username debe tener minimo 3 caracteres</span>}
                      </div>
                    </div>


                      {/* ESTRELLAS */}
                      <div className="space-y-2">
                        <Label>Clasificación por Estrellas *</Label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setValue('estrellas', star)}
                              className="p-1"
                            >
                              <Star
                                className={`h-6 w-6 cursor-pointer ${
                                  star <= watch('estrellas') ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Dirección *
                        </Label>

                        <Input
                            id="direccion"
                            autoComplete="direccion"
                            placeholder="Escribe la dirección completa del hotel"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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


                    <div className="space-y-2 mi-select-wrapper">
                      <Label htmlFor="cadena" className="text-gray-700 font-medium">
                        Cadena Hotelera
                      </Label>

                      {isFetchingCadenas &&
                      <Select>
                        <SelectTrigger className="cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 w-46 flex">
                          <div className="w-full flex items-center justify-center">
                            <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                          </div>
                        </SelectTrigger>
                      </Select>
                      }
                      {!isFetchingCadenas && 
                        <>
                          <div className="space-y-2">
                            <GenericSearchSelect
                              dataList={dataCadenaList}
                              value={selectedCadenaID}
                              onValueChange={setSelectedCadenaID}
                              handleDataNoSeleccionada={handleCadenaNoSeleccionada}
                              placeholder="Selecciona la cadena..."
                              labelKey="nombre"
                              // secondaryLabelKey="destino"
                              // thirdLabelKey="pais"
                              valueKey="id"
                            />
                        </div>
                        </>
                      }

                        {/* {cadenaNoSeleccionada === false && (
                          <p className="text-red-400 text-sm">Este campo es requerido</p>
                        )} */}
                    </div>

                     <div className="space-y-2 mi-select-wrapper">
                        <Label htmlFor="nacionalidad" className="text-gray-700 font-medium">
                          Pais *
                        </Label>

                        {isFetchingNacionalidad &&
                        <Select>
                          <SelectTrigger className="cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 w-46 flex">
                            <div className="w-full flex items-center justify-center">
                              <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                            </div>
                          </SelectTrigger>
                        </Select>
                        }
                        {!isFetchingNacionalidad && 
                          <>
                            <div className="space-y-2">
                            <CountrySearchSelect
                              nacionalidades={dataNacionalidadList}
                              value={selectedNacionalidadID}
                              onValueChange={setSelectedNacionalidadid}
                              handleNacionalidadNoSeleccionada={handleNacionalidadNoSeleccionada}
                              placeholder="Selecciona tu país..."
                            />
                          </div>
                          </>
                        }

                          {nacionalidadNoSeleccionada === false && (
                            <p className="text-red-400 text-sm">Este campo es requerido</p>
                          )}

                          {onGuardar && nacionalidadNoSeleccionada === undefined && <p className="text-red-400 text-sm">Este campo es requerido</p>}
                      </div>

                      <div className="space-y-2 mi-select-wrapper">
                        <Label htmlFor="ciudad" className="text-gray-700 font-medium">
                          Ciudad *
                        </Label>

                        <div className="space-y-2">
                          <DinamicSearchSelect
                            // disabled={!dataAEditar}
                            dataList={newDataCiudadList || []}
                            value={selectedCiudadID}
                            onValueChange={setSelectedCiudadID}
                            handleDataNoSeleccionada={handleDataNoCiudadSeleccionada}
                            onSearchChange={setCiudadBusqueda} // 🔹 Aquí se notifica el cambio de búsqueda
                            isFetchingPersonas={isFetchingCiudad}
                            placeholder="Buscar ciudad..."
                            labelKey="nombre"
                            valueKey="id"
                          />
                        </div>
                          

                          {ciudadNoSeleccionada === false && (
                            <p className="text-red-400 text-sm">Este campo es requerido</p>
                          )}

                          {/* {onGuardar && nacionalidadNoSeleccionada === undefined && <p className="text-red-400 text-sm">Este campo es requerido</p>} */}
                      </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description" className="text-gray-700 font-medium">
                        Descripción *
                      </Label>
                      <Textarea
                          id="descripcion"
                          autoComplete="descripcion"
                          placeholder="Describe el hotel y su funcionalidad"
                          className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...register('descripcion', {
                          required: true, 
                          validate: {blankSpace: (value) => !!value.trim()},
                          minLength: 15})}
                          />
                          <div>
                            {(errors?.descripcion?.type === 'required' || errors?.descripcion?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                            {errors?.descripcion?.type === 'minLength' && <span className='text-red-400 text-sm'>El username debe tener minimo 15 caracteres</span>}
                          </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 font-medium">Seleccione los servicios *</Label>

                      
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar servicios..."
                          value={permissionSearchTerm}
                          onChange={(e) => setPermissionSearchTerm(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      
                      {selectedPermissions.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            {selectedPermissions.length} servicios seleccionados
                          </Badge>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPermissions([])}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Limpiar selección
                          </Button>
                        </div>
                      )}

                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 w-full">
                        {isFetchingServicios && <div className="w-full flex items-center justify-center">
                          <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                        </div>}

                        {!isFetchingServicios && dataServiciosList && dataServiciosList
                            .filter((servicio: any) => 
                              
                              servicio.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                            
                            )
                            .map((servicio: any) => (
                              <div
                                key={servicio.id}
                                className={`relative cursor-pointer duration-200 hover:shadow-sm flex 
                                          items-start p-3 rounded-lg hover:bg-gray-50 transition-colors
                                          border border-gray-200
                                          ${selectedPermissions.includes(servicio.id) 
                                            ? 'ring-2 ring-blue-200 bg-blue-50/50 border-blue-200' 
                                            : ''}`}
                              >
                                <div className="flex items-start w-full">
                                  <div className="flex-shrink-0 mr-3 mt-0.5">
                                    <Checkbox
                                      id={`hotel-${servicio.id}`}
                                      checked={selectedPermissions.includes(servicio.id)}
                                      onCheckedChange={() => handlePermissionToggle(servicio.id)}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <Label
                                      htmlFor={`hotel-${servicio.id}`}
                                      className="text-sm font-medium text-gray-900 cursor-pointer block"
                                    >
                                      {servicio.nombre}
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-1">{servicio.descripcion}</p>
                                    {/* <div className="flex items-center gap-2 mt-2">
                                      <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                        {hotel?.moneda?.simbolo}{hotel?.precio_habitacion} <span className="text-gray-500 font-normal">/ noche</span>
                                      </Badge>
                                    </div> */}
                                  </div>
                                </div>
                              </div>
                            ))}
                                                  
                        {dataServiciosList && dataServiciosList.filter(
                          (hotel: any) =>
                            hotel.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                        ).length === 0 && (
                          <div className="col-span-2 text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                              <Search className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">
                              No se encontraron hoteles que coincidan con "{permissionSearchTerm}"
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPermissionSearchTerm("")}
                              className="mt-2"
                            >
                              Limpiar búsqueda
                            </Button>
                          </div>
                        )}

                      </div>


                       <Card className="mt-8">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle>Gestión de Habitaciones</CardTitle>
                                <CardDescription>Administre las habitaciones y sus tarifas</CardDescription>
                              </div>
                              <Dialog 
                              open={isAddRoomOpen}
                                onOpenChange={(open) => {
                                  if (!open) resetRoomForm()
                                  setIsAddRoomOpen(open)
                                }}
                              >
                                <DialogTrigger asChild className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                                  <Button type="button">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Habitación
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Agregar Nueva Habitación</DialogTitle>
                                    <DialogDescription>
                                      Complete los datos de la nueva habitación para agregarla al hotel.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="room-number" className="text-right">
                                        Número *
                                      </Label>
                                      <Input
                                        id="room-number"
                                        value={newRoom.number}
                                        onChange={(e) => setNewRoom((prev) => ({ ...prev, number: e.target.value }))}
                                        placeholder="101"
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="room-type" className="text-right">
                                        Tipo *
                                      </Label>
                                      <Select
                                        value={newRoom.type}
                                        onValueChange={(value) => setNewRoom((prev) => ({ ...prev, type: value }))}
                                      >
                                        <SelectTrigger className="col-span-3">
                                          <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="single">Habitación Simple</SelectItem>
                                          <SelectItem value="doble">Habitación Doble</SelectItem>
                                          <SelectItem value="triple">Habitación Triple</SelectItem>
                                          <SelectItem value="suite">Suite</SelectItem>
                                          <SelectItem value="standar">Premium</SelectItem>
                                          {/* <SelectItem value="Penthouse">Penthouse</SelectItem> */}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="room-capacity" className="text-right">
                                        Capacidad
                                      </Label>
                                      <Select
                                        value={newRoom.capacity.toString()}
                                        onValueChange={(value) =>
                                          setNewRoom((prev) => ({ ...prev, capacity: Number.parseInt(value) }))
                                        }
                                      >
                                        <SelectTrigger className="col-span-3">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">1 persona</SelectItem>
                                          <SelectItem value="2">2 personas</SelectItem>
                                          <SelectItem value="3">3 personas</SelectItem>
                                          <SelectItem value="4">4 personas</SelectItem>
                                          <SelectItem value="5">5 personas</SelectItem>
                                          <SelectItem value="6">6 personas</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="room-price" className="text-right">
                                        Precio * 
                                      </Label>
                                      <div className="col-span-3 flex gap-2">
                                        <Input
                                          id="room-price"
                                          type="number"
                                          value={newRoom.price}
                                          onChange={(e) =>
                                            setNewRoom((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                                          }
                                          placeholder="150"
                                          className="flex-1"
                                        />
                                        

                                         <Controller
                                          name="moneda"
                                          control={control}
                                          rules={{ required: "Este campo es requerido" }}
                                          render={({ field }) => (
                                            <div className=" select-container"> {/* Contenedor para controlar el layout */}
                                              <Select
                                                value={field.value}
                                                onValueChange={(value) => {
                                                  field.onChange(value)
                                                  if (value) {
                                                    clearErrors("moneda")
                                                  }
          
                                                  console.log('value: ', value);
                                                  // const tipoPaquete = dataTipoPaqueteList.filter((doc: TipoPaquete) => doc.id.toString() === value)
                                                  // console.log('moneda: ', tipoPaquete[0])
                                                  // setMone(tipoPaquete[0]);
                                                }}
                                                onOpenChange={(open) => {
                                                  if (!open && !field.value) {
                                                    field.onBlur(); 
                                                  }
                                                }}
                                              >
                                                <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-left">
                                                  <SelectValue placeholder="Moneda" />
                                                </SelectTrigger>
                                                <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-60">
                                                  {dataMonedaList.map((data: Moneda) => 
                                                    <SelectItem 
                                                      key={data.id} 
                                                      value={data.id.toString()}
                                                      className="pl-2 pr-4"
                                                    >
                                                      <div className="flex items-center gap-2 min-w-0">
                                                        <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                                                        <span className="truncate">{data.nombre}</span>
                                                        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                                                          {data.codigo}
                                                        </Badge>
                                                      </div>
                                                    </SelectItem>
                                                  )}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          )}
                                        />
                                      </div>
                                    </div>
                                  
                                  </div>
                                  <DialogFooter>
                                    <Button type="button" variant="outline" className="cursor-pointer" onClick={resetRoomForm}>
                                      Cancelar
                                    </Button>
                                    <Button type="button" className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer" onClick={handleAddRoom}>Agregar Habitación</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Número</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Capacidad</TableHead>
                                    <TableHead>Precio por Noche</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {rooms.map((room: any) => (
                                    <TableRow key={room.id}>
                                      <TableCell className="font-medium">{room.number}</TableCell>
                                      <TableCell>{room.type}</TableCell>
                                      <TableCell>{room.capacity} personas</TableCell>
                                      <TableCell>
                                        {formatearSeparadorMiles.format(room.price)} {dataMonedaList.filter((moneda: Moneda) => moneda.id == room.currency)[0].simbolo } ({dataMonedaList.filter((moneda: Moneda) => moneda.id == room.currency)[0].codigo })
                                      </TableCell>
                                      <TableCell>
                                        {/* {getStatusBadge(room.status)} */}
                                        </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <Button type="button" variant="ghost" size="sm" onClick={() => handleEditRoom(room)}>
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteRoom(room.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>

                      {onGuardar && selectedPermissions.length ===0 && <span className='text-red-400 text-sm'>Debes seleccinar al menos un hotel</span>}
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {

                            const filteredPermissions = dataHotelesList.filter(
                              (hotel: any) =>
                                hotel.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                            )
                            const allFilteredSelected = filteredPermissions.every((p: any) =>
                              selectedPermissions.includes(p.id),
                            )

                            console.log('allFilteredSelected: ', allFilteredSelected )

                            if (allFilteredSelected) {
                              setSelectedPermissions((prev) =>
                                prev.filter((id) => !filteredPermissions.map((p: any) => p.id).includes(id)),
                              )
                            } else {
                              const newSelections = filteredPermissions
                                .map((p:any) => p.id)
                                .filter((id:any) => !selectedPermissions.includes(id))
                              setSelectedPermissions((prev) => [...prev, ...newSelections])
                            }
                          }}
                          className="cursor-pointer text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {dataHotelesList && dataHotelesList
                            .filter(
                              (hotel: any) =>
                                hotel.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                            )
                            .every((p: any) => selectedPermissions.includes(p.id))
                            ? "Deseleccionar"
                            : "Seleccionar"}{" "}
                          
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!dataAEditar &&
                        <Button 
                            disabled={isPendingMutation}
                            type="submit"
                             onClick={() => {
                              console.log('cadenaNoSeleccionada 1: ', cadenaNoSeleccionada);
                              setOnGuardar(true)
                              
                              if(cadenaNoSeleccionada === undefined){
                                  console.log('cadenaNoSeleccionada 2: ', cadenaNoSeleccionada);
                                  setCadenaNoSeleccionada(false);
                                }
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                          {isPendingMutation ? 
                              <>
                                  <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                  Creando...
                              </> : 
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Crear Hotel
                              </>}
                        </Button>
                          }

                        {dataAEditar &&
                            <Button 
                                disabled={isPendingEdit}
                                type="submit"
                                onClick={() => setOnGuardar(true)}
                                className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                              {isPendingMutation ? 
                                  <>
                                      <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                      Guardando...
                                  </> : 
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Guardar Hotel
                                  </>}
                            </Button>
                          }
                    <Button
                      variant="outline"
                      className="cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                      onClick={() => {
                        // setNewRoleName("")
                        // setNewRoleDescription("")
                        setSelectedPermissions([])
                        setPermissionSearchTerm("")
                        handleCancel()
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          {/* Hoteles List Tab */}
          <TabsContent value="list">
            <Card className="border-blue-200 pt-0">
              <CardHeader className="bg-blue-50 border-b border-blue-200 pt-8">
                  <div className="flex flex-col items-start justify-between">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-blue-900">Lista de Hoteles</CardTitle>
                          <CardDescription className="text-blue-700">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} hoteles
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 w-4/6">
                        <div className="flex items-center gap-2 bg-emerald-50 rounded-full px-3 py-2 border border-emerald-200">
                          <Switch
                            checked={showActiveOnly}
                            onCheckedChange={handleActiveOnly}
                            id="active-filter"
                            className="data-[state=checked]:bg-emerald-500"
                          />
                          <Label htmlFor="active-filter" className="text-sm text-emerald-700 font-medium">
                            Solo activos
                          </Label>
                        </div>


                        <div className="relative w-6/8">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar por nombre de hotel o nombre de país..."
                            value={busquedaPorFiltro}
                            onChange={(e) => setBusquedaPorFiltro(e.target.value)}
                            className="pl-10 w-full border-gray-300 focus:border-blue-500"
                          />
                        </div>

                        {/* <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar por razon social..."
                            value={razonSocialABuscar}
                            onChange={(e) => setRazonSocialABuscar(e.target.value)}
                            className="pl-10 w-72 border-gray-300 focus:border-blue-500"
                          />
                        </div> */}

                        {/* <Button
                          onClick={handleBuscarPorNombre}
                          variant="outline"
                          size="icon"
                          className="border-gray-300 hover:bg-gray-50 bg-transparent cursor-pointer"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-blue-200 w-full flex-wrap">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha Ingreso desde:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_desde}
                          onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha Ingreso hasta:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_hasta}
                          onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                     <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-700">Estrellas:</Label>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => {
                                setValue('estrellas_filtros', star);
                                setFiltros({...filtros, estrellas: star.toString()})
                              }}
                              className="p-1 rounded transition-colors hover:bg-gray-200"
                            >
                              <Star
                                className={`h-4 w-4 cursor-pointer ${
                                  star <= watch('estrellas_filtros') ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}

                          <Button onClick={() => {
                              setValue('estrellas_filtros', 0);
                              setFiltros({...filtros, estrellas: ""})
                            }} variant="outline" className="p-3 m-0 h-6 w-6 hover:bg-yellow-200 rounded-full cursor-pointer">
                            <X className="h-1 w-1" />
                          </Button>
                      </div>
                        
                        
                    </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFiltros({
                            activo: true,   // null = todos, true = solo activos
                            fecha_desde: "",
                            fecha_hasta: "",
                            nombre: "",
                            estrellas: ""
                          });
                          setBusquedaPorFiltro(""); 
                          setValue('estrellas_filtros', 0)
                        }}
                      className="cursor-pointer border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar filtros 
                      </Button>
                    </div>
                   </div>
                </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="flex items-center justify-center w-10 font-semibold text-gray-700">#</TableHead>
                      <TableHead className="font-semibold text-gray-700">Información</TableHead>
                      <TableHead className="font-semibold text-gray-700">Ubicación</TableHead>
                      <TableHead className="font-semibold text-gray-700">Cadena</TableHead>
                      <TableHead className="font-semibold text-gray-700">Estrellas</TableHead>
                      <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                      <TableHead className="font-semibold text-gray-700">Servicios</TableHead>
                      <TableHead className="font-semibold text-gray-700">Fecha Creación</TableHead>
                      <TableHead className="w-20 font-semibold text-gray-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="w-full">
                    {isFetching && <TableRow className="w-full">
                                      <TableCell className="w-full absolute top-5/12">
                                        <div className="w-full flex items-center justify-center">
                                          <Loader2Icon className="animate-spin w-10 h-10 text-gray-500"/>
                                        </div>
                                      </TableCell>
                                    </TableRow>}
                    
                      {!isFetching && dataList.length > 0 && siTienePermiso("hoteles", "leer") && dataList.map((data: Hotel) => (
                          <TableRow
                              key={data.id}
                              className={`hover:bg-blue-50 transition-colors cursor-pointer`}
                            >
                              <TableCell>
                                <div>
                                <div className="font-medium text-gray-900 pl-2">{data.numero}</div>
                              </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900">{data?.nombre}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{data.descripcion}</div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900 truncate max-w-xs">{data.ciudad_nombre}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{data.pais_nombre}</div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <Badge
                                  className={data.cadena_nombre ? `text-xs bg-blue-100 text-blue-700 border-blue-200` :
                                        "bg-gray-100 text-gray-700 border-gray-200"
                                  }
                                >
                                  {data.cadena_nombre ?? 'Independiente'}
                                </Badge>

                                {/* ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                      : "bg-gray-100 text-gray-700 border-gray-200" */}
                              </TableCell>

                              <TableCell>
                                {renderStars(data.estrellas)}
                              
                              </TableCell>

                              <TableCell>
                                <Badge
                                  className={
                                    data.activo
                                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                      : "bg-gray-100 text-gray-700 border-gray-200"
                                  }
                                >
                                  {data.activo ? "Activo" : "Inactivo"}
                                </Badge>
                              </TableCell>
                             
                              <TableCell>
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {data.servicios_detalle.length === 0 &&
                                      <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                        Sin servicios agregados
                                      </Badge>
                                    }
                                  {data.servicios_detalle.length > 0 && data.servicios_detalle.slice(0, 2).map((permi: Servicio) => {
                                    const hotel = dataHotelesList?.find((p: any) => p.id === permi.id)
                                    return hotel ? (
                                      <Badge key={permi.id} className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                        {permi.nombre}
                                      </Badge>
                                    ) : null
                                  })}
                                  {data.servicios.length > 2 && (
                                    <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                      +{data.servicios.length - 2} más
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatearFecha(data.fecha_creacion)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="border-gray-200">
                                {siTienePermiso("hoteles", "leer") &&
                                  <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer"
                                    onClick={() => handleVerDetalles(data)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                }
                                {siTienePermiso("hoteles", "modificar") &&
                                  <DropdownMenuItem className="hover:bg-emerald-50 cursor-pointer" onClick={() => handleEditar(data)}>
                                    <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                                    Editar
                                  </DropdownMenuItem>
                                }
                                <DropdownMenuSeparator />
                                {siTienePermiso("hoteles", "eliminar") &&
                                  <DropdownMenuItem className={`${data.activo ? 'text-red-600 hover:bg-red-50': 'text-green-600 hover:bg-green-50'} cursor-pointer`}
                                    onClick={() => toggleActivar(data)}>
                                    
                                    {data.activo ? <Trash2 className="h-4 w-4 mr-2" /> : <CheckIcon className="h-4 w-4 mr-2" />}
                                    {data.activo ? 'Desactivar' : 'Activar'}
                                  </DropdownMenuItem>
                                }
                              </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                      ))}

                      {!isFetching && dataList.length === 0 && (
                            <TableRow className="">
                              <TableCell className="w-full flex items-center justify-center">
                                <div className="text-center py-12  absolute-center">
                                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron modulos</h3>
                                  <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda.</p>
                                  <Button
                                    onClick={handleReset}
                                    className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                  >
                                    Limpiar filtros
                                  </Button>
                                </div>
                              </TableCell>
    
                            </TableRow>
                      )}
                  </TableBody>
                </Table>

                {/* Controles de Paginación */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-600">Mostrar:</Label>
                          <Select value={paginacion?.pageSize?.toString() ?? 5} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-gray-600">por página</span>
                        </div>

                        <div className="text-sm text-gray-600">
                          Página {currentPage} de {paginacion?.totalPages ?? 0}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="h-8 cursor-pointer"
                          title="Primera"
                        >
                          <FaAngleDoubleLeft/>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-8 cursor-pointer"
                          title="Anterior"
                        >
                          <FaAngleLeft/>
                        </Button>

                        {/* Números de página */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, paginacion!.totalPages) }, (_, i) => {
                            let pageNumber
                            if (paginacion!.totalPages <= 5) {
                              pageNumber = i + 1
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1
                            } else if (currentPage >= paginacion!.totalPages - 2) {
                              pageNumber = paginacion!.totalPages - 4 + i
                            } else {
                              pageNumber = currentPage - 2 + i
                            }

                            return (
                              <Button
                                key={pageNumber}
                                variant={currentPage === pageNumber ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNumber)}
                                className={`h-8 w-8 cursor-pointer ${
                                  currentPage === pageNumber ? "bg-blue-500 hover:bg-blue-600" : ""
                                }`}
                              >
                                {pageNumber}
                              </Button>
                            )
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => currentPage < paginacion!.totalPages && handlePageChange(currentPage + 1)}
                          disabled={currentPage === paginacion!.totalPages}
                          className="h-8 cursor-pointer"
                          title="Siguiente"
                        >
                          <FaAngleRight/>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (currentPage > 1 || currentPage < paginacion?.totalPages) && handlePageChange(paginacion.totalPages)}
                          disabled={currentPage === paginacion!.totalPages}
                          className="h-8 cursor-pointer"
                          title="Última"
                        >
                          <FaAngleDoubleRight/>
                        </Button>
                      </div>
                    </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
