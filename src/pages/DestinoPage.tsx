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
  MapPin,
  HotelIcon,
  Star,
  Info,
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
import { activarDesactivarData, fetchData, fetchDataHoteles, fetchResumen, guardarDataEditado, nuevoRolFetch } from "@/components/utils/httpDestino"
import type { Destino, DestinoPaginatedResponse } from "@/types/destino"
import { ToastContext } from "@/context/ToastContext"
import { useForm } from "react-hook-form"
import { capitalizePrimeraLetra, formatearFecha } from "@/helper/formatter"
import { queryClient } from "@/components/utils/http"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { fetchDataCiudadesTodos, fetchDataNacionalidadTodos, fetchDataZonasGeograficasTodos } from "@/components/utils/httpNacionalidades"
import { CountrySearchSelect } from "@/components/CountrySearchSelect"
import { useSessionStore } from "@/store/sessionStore"
import { DinamicSearchSelect } from "@/components/DinamicSearchSelect"
import { GenericSearchSelect } from "@/components/GenericSearchSelect"


const roleStatusColors = {
  true: "bg-emerald-100 text-emerald-700 border-emerald-200",
  false: "bg-gray-100 text-gray-700 border-gray-200",
}

const enUsoColors = {
  false: "bg-red-100 text-red-700 border-red-200",
  true: "bg-green-100 text-green-700 border-green-200",
}


let dataList: Destino[] = [];

export default function DestinoPage() {
  const {siTienePermiso } = useSessionStore();
  const [newDataCiudadList, setNewDataCiudadList] = useState<Destino[]>();
  const [paisDataSelected, setPaisDataSelected] = useState<any>();
  const [ciudadDataSelected, setCiudadDataSelected] = useState<any>();
  const [selectedCiudadID, setSelectedCiudadID] = useState<number | "">("");
  const [ciudadNoSeleccionada, setCiudadNoSeleccionada] = useState<boolean | undefined>();
  const [selectedNacionalidadID, setSelectedNacionalidadid] = useState<number | "">("");
  const [nacionalidadNoSeleccionada, setNacionalidadNoSeleccionada] = useState<boolean | undefined>();
  const [busquedaPorFiltro, setBusquedaPorFiltro] = useState("")
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [dataAEditar, setDataAEditar] = useState<Destino>();
  const [dataADesactivar, setDataADesactivar] = useState<Destino>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerData, setOnVerData] = useState(false);
  const [dataDetalle, setDataDetalle] = useState<Destino>();
  const {handleShowToast} = use(ToastContext);
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [onGuardar, setOnGuardar] = useState(false);
  const [ciudadBusqueda, setCiudadBusqueda] = useState<string>("");
  const [hotelesSeleccionados, setHotelesSeleccionados] = useState<any[]>([]);
  const [razonSocialABuscar, setRazonSocialABuscar] = useState("");
  const [selectedZonaGeograficaID, setSelectedZonaGeograficaID] = useState<number | "">("");
  const [filtros, setFiltros] = useState({
                  activo: true,   // null = todos, true = solo activos
                  fecha_desde: "",
                  fecha_hasta: "",
                  nombre: ""
                });

              
  
  // DATOS DEL FORMULARIO 
  const {register, handleSubmit, formState: {errors, }, setValue, reset} = 
            useForm<any>({
              mode: "onBlur",
              defaultValues: {
                nombre: "",
                descripcion: "",
                zona_geografica: "",
              }
            });
  // DATOS DEL FORMULARIO 



  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('list');
  const [paginacion, setPaginacion] = useState<DestinoPaginatedResponse>({
                                                      next: null,
                                                      totalItems: 5,
                                                      previous: null,
                                                      totalPages: 5,
                                                      results: [],
                                                      pageSize: 10
                                              });


  const {data, isFetching, isError} = useQuery({
      queryKey: ['destinos', currentPage, paginacion.pageSize, filtros], //data cached
      queryFn: () => fetchData(currentPage, paginacion.pageSize, filtros),
      staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
      enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
    });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['destinos-resumen'], //data cached
    queryFn: () => fetchResumen(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  console.log(paisDataSelected);
  console.log(ciudadDataSelected)

  const {data: dataHotelesList, isFetching: isFetchingHoteles,} = useQuery({
      queryKey: ['todos-hoteles', ciudadDataSelected, paisDataSelected?.nombre], //data cached
      queryFn: () => fetchDataHoteles(ciudadDataSelected, paisDataSelected?.nombre),
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


  const {data: dataZonaGeograficaList, isFetching: isFetchingZonaGeografica,} = useQuery({
        queryKey: ['todos-zona-geografica',], //data cached
        queryFn: () => fetchDataZonasGeograficasTodos(),
        staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  
    console.log('dataCiudadList: ', dataCiudadList)


  if(!isFetching && !isError){
    if(data?.results){
      dataList = data.results.map((per: Destino, index: number) => ({...per, numero: index + 1}));
    }
  }


  useEffect(() => {
      if(isFetchingCiudad){
        setNewDataCiudadList([])
      }
    }, [isFetchingCiudad]);

  useEffect(() => {
      if(selectedCiudadID){
        const selectedCiudad = dataCiudadList.filter((ciudad: any) => ciudad.id.toString() === selectedCiudadID.toString());

        if(selectedCiudad.length){
          setValue('nombre', selectedCiudad[0].nombre);
          setCiudadDataSelected(selectedCiudad[0].nombre)
        }
      }
    }, [selectedCiudadID]);

  useEffect(() => {
      if(selectedNacionalidadID){
        const selectedPais = dataNacionalidadList.filter((pais: any) => pais.id.toString() === selectedNacionalidadID.toString());

        if(selectedPais.length){
          const pais = selectedPais[0];
          console.log('pais: ', pais);
          // const selectedCiudad = dataNacionalidadList.filter((ciudad: any) => ciudad.id.toString() === selectedNacionalidadID.toString());

          // if(pais?.zona_geografica__nombre)
          setValue('zona_geografica', pais?.zona_geografica__nombre ?? 'No tiene zona asignada')

          setPaisDataSelected(pais);
          if(!dataAEditar){
            setSelectedCiudadID("");
            setCiudadBusqueda("");
          }
        }
      }
    }, [dataAEditar, dataNacionalidadList, selectedNacionalidadID, setValue]);


    // useEffect(() => {
    //   if(!selectedCiudadID || !selectedNacionalidadID){
    //     dataHotelesListTemp = [];
    //   }
    //   else{
    //     dataHotelesListTemp = [...dataHotelesList]
    //   }
    // }, [selectedCiudadID, selectedNacionalidadID]);


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
        setBusquedaPorFiltro("");
        setRazonSocialABuscar("");
        setSelectedZonaGeograficaID("");
      });
  }


  
  const handleActiveOnly = () => {
    setShowActiveOnly(prev => !prev)
    setFiltros({ ...filtros, activo: !showActiveOnly })
    setCurrentPage(1);
  }

  // filtros

  useEffect(() => {
      const handler = setTimeout(() => {
        console.log('cambiando nombre')
        setFiltros(filtroAnterior => ({...filtroAnterior, nombre: busquedaPorFiltro}))
      }, 750) // ⏱️ medio segundo de espera
  
      return () => {
        clearTimeout(handler) // limpia el timeout si se sigue escribiendo
      }
    }, [busquedaPorFiltro]);


    console.log(filtros)
    console.log(razonSocialABuscar)

    useEffect(() => {
      const handler = setTimeout(() => {
        // console.log('cambiando nombre')
        setFiltros(filtroAnterior => ({...filtroAnterior, zona_geografica: razonSocialABuscar}))
      }, 750) // ⏱️ medio segundo de espera
  
      return () => {
        clearTimeout(handler) // limpia el timeout si se sigue escribiendo
      }
    }, [razonSocialABuscar]);

    
    useEffect(() => {
      const handler = setTimeout(() => {
        // console.log('cambiando nombre')

        const selectedZona = dataZonaGeograficaList.filter((zona: any) => zona.id.toString() === selectedZonaGeograficaID.toString());
        console.log(selectedZona)

        setFiltros(filtroAnterior => ({...filtroAnterior, zona_geografica: selectedZona[0]?.nombre}))
      }, 750) // ⏱️ medio segundo de espera
  
      return () => {
        clearTimeout(handler) // limpia el timeout si se sigue escribiendo
      }
    }, [dataZonaGeograficaList, selectedZonaGeograficaID]);
  

  // ✅ Utilidad para invalidar queries
const invalidateQueries = (keys: string[]) => {
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: [key], exact: false });
  });
};

// ✅ Utilidad para resetear el formulario y limpiar estados
const resetFormulario = () => {
  reset({ nombre: "", descripcion: "" });
  setSelectedPermissions([]);
  setSelectedNacionalidadid("");
  setSelectedCiudadID("");
  setPaisDataSelected(undefined);
  setCiudadDataSelected(undefined);
  setDataAEditar(undefined);
  setOnGuardar(false);
  handleCancel();
  setActiveTab("list");
};

// ✅ Mutación para crear destino
const { mutate, isPending: isPendingMutation } = useMutation({
  mutationFn: nuevoRolFetch,
  onSuccess: () => {
    handleShowToast("Se ha creado un nuevo destino satisfactoriamente", "success");
    resetFormulario();
    invalidateQueries([
      "destinos",
      "destinos-disponibles",
      "destinos-resumen",
      "paquetes",
      "paquetes-resumen",
      "todos-hoteles-paquetes",
    ]);
  },
  onError: (error) => {
    console.error(error);
    handleShowToast("No se pudo crear el destino. Inténtalo nuevamente.", "error");
  },
});

// ✅ Mutación para guardar destino editado
const { mutate: mutateGuardarEditado, isPending: isPendingEdit} = useMutation({
  mutationFn: guardarDataEditado,
  onSuccess: () => {
    handleShowToast("Se ha guardado el destino satisfactoriamente", "success");
    resetFormulario();
    invalidateQueries([
      "destinos",
      "destinos-disponibles",
      "hoteles",
      "usuarios",
      "usuarios-resumen",
      "todos-hoteles-paquetes",
    ]);
  },
  onError: (error) => {
    console.error(error);
    handleShowToast("No se pudo guardar el destino. Inténtalo nuevamente.", "error");
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
          queryKey: ['destinos'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['destinos-disponibles'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['destinos-resumen'],
        });
    },
  });


  const handleCancel = () => {
        setOnGuardar(false);
        setDataAEditar(undefined);
        setNewDataCiudadList([...dataCiudadList]);
        setSelectedCiudadID("");
        setSelectedNacionalidadid("");
        setPaisDataSelected(undefined);
        setCiudadDataSelected(undefined);
        handleDataNoCiudadSeleccionada(undefined);
        setHotelesSeleccionados([])
        reset({
            nombre: "",
            descripcion: "",
          });
        setActiveTab('list');
  }


  const handleGuardarNuevaData = async (dataForm: any) => {
    console.log('dataForm: ', dataForm);
    console.log('selectedPermissions: ', selectedPermissions)
    console.log(hotelesSeleccionados);

    const hotelesIds = hotelesSeleccionados.map(hotel => hotel.id)

    const payload = {...dataForm, 
        activo: true, 
        en_uso: false, 
        ciudad_id: selectedCiudadID,
        hoteles_ids: selectedPermissions}

    console.log(payload)
    
    if(hotelesIds.length){
      mutate({...dataForm, 
        activo: true, 
        en_uso: false, 
        ciudad_id: selectedCiudadID,
        hoteles_ids: selectedPermissions});
    }
  }

  const handleGuardarDataEditado = async (dataForm: any) => {
    const dataEditado = {...dataAEditar, ...dataForm};
    delete dataEditado.numero;
    delete dataEditado.hoteles;
    delete dataEditado.fecha_creacion;
    delete dataEditado.fecha_modificacion;


    console.log('selectedNacionalidadID: ', selectedNacionalidadID)
    // dataEditado.pais = selectedNacionalidadID;

    if(selectedPermissions.length){
      
      const payLoad = {
                ...dataEditado, 
                ciudad_id: selectedCiudadID,
                hoteles_ids: selectedPermissions,
                pais_id: selectedNacionalidadID,
                // ciuidad: selectedCiudadID
      };
      console.log('payload guardado: ', payLoad) 
      mutateGuardarEditado(payLoad);
    }
  }



  useEffect(() => {
      if (dataAEditar) {
        console.log('reset data para editar: ', dataAEditar)
        reset({
          ...dataAEditar,
          nombre: dataAEditar.ciudad.nombre,
          // nacionalidad: dataAEditar.ciudad.pais_nombre,
          // tipo_remuneracion: dataAEditar.tipo_remuneracion.id.toString(),
          ciudad: dataAEditar.ciudad.id.toString(),
          nacionalidad: dataAEditar.ciudad.pais_id.toString(),
        });
  
        // const item = dataPersonaList.find((c: any) => c[valueKey] === value);
        // setNewDataPersonaList([...dataPersonaList, dataAEditar.persona]);
        // handleDataNoSeleccionada(true);
      }
    }, [dataAEditar, reset]);


  const handleEditar = (data: Destino) => {
    setDataAEditar(data);
    const hoteles = data.hoteles;
    console.log(hoteles)
    const hotelesIds = hoteles.map(hotel => hotel.id)
    console.log(hotelesIds)
    console.log(data)
    console.log('dataAEditar.persona.id: ', data.ciudad)
    setSelectedNacionalidadid(Number(data.ciudad.pais_id));
    setSelectedCiudadID(data.ciudad.id); 
    setSelectedPermissions(hotelesIds);
    setHotelesSeleccionados(hoteles)
    setActiveTab('form');
  }

  const toggleActivar = (modulo: Destino) => {
    setOnDesactivarData(true);
    setDataADesactivar(modulo);
  }

  const handleCloseModal = () => {
    setOnDesactivarData(false);
  }

  const handleConfirmActivo = (activo=true) => {
    mutateDesactivar({ dataId: dataADesactivar!.id, activo })
  }

  const handleVerDetalles = (data: Destino) => {
    setDataDetalle(data);
    setOnVerData(true);
  }

  const handleCloseVerDetalles = () => {
    setOnVerData(false);
    setDataDetalle(undefined);
  }

  const handleCadenaNoSeleccionada = (value: boolean | undefined) => {
    console.log(value)
    console.log(selectedZonaGeograficaID)
    // setCadenaNoSeleccionada(value); 
  }


  /**
   * Sincroniza la lista de hotelesSeleccionados con los IDs marcados en selectedPermissions.
   * Solo agrega, nunca quita: la eliminación se hace SOLO en la sección de seleccionados.
   */
  useEffect(() => {
    if (!dataHotelesList) return;
    const nuevos = dataHotelesList.filter(
      (h: any) => selectedPermissions.includes(h.id) &&
             !hotelesSeleccionados.some((sel) => sel.id === h.id)
    );
    if (nuevos.length) {
      setHotelesSeleccionados((prev) => [...prev, ...nuevos]);
    }
  }, [selectedPermissions, dataHotelesList, hotelesSeleccionados]);

  

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
                        {dataDetalle?.ciudad?.nombre}
                      </h2>
                      <p className="text-gray-600">Detalles completos del destino</p>
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
                        <Label className="text-sm font-medium text-gray-500">En uso</Label>
                        <div className="mt-1">
                          <Badge className={enUsoColors[dataDetalle?.en_uso.toString() as keyof typeof enUsoColors]}>
                            {dataDetalle?.en_uso ? "Asigando" : "Sin asignar"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Descripción</Label>
                      <p className="mt-1 text-gray-900">{dataDetalle?.descripcion}</p>
                    </div>


                    <div className="mb-8">
                      <label className="text-sm font-medium text-gray-500">
                        Zona Geográfica
                      </label>
                      <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl px-5 py-4">
                        <MapPin size={24} className="text-blue-600" />
                        <span className="text-lg font-medium text-slate-800">{dataDetalle?.zona_geografica ?? 'Zona no asignada'}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Hoteles asociados ({dataDetalle?.hoteles.length})
                      </Label>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        {dataDetalle?.hoteles.map((hotel, index) => (
                          <>
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <HotelIcon className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{hotel.nombre}</span>

                              <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                <span className="text-gray-500 font-normal">{renderStars(hotel.estrellas)}</span>
                              </Badge>
                            </div>
                          </>
                        ))}
                      </div>
                    </div>

                    {/* <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Usuarios Asignados</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">6 usuarios</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                        <p className="mt-1 text-gray-900">
                          {formatearFecha(dataDetalle?.fecha_creacion ?? '')}
                        </p>
                      </div>
                    </div> */}

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
                ¿Estás seguro de que deseas {dataADesactivar!.activo ? 'desactivar' : 'activar'} el destino de <b>{capitalizePrimeraLetra(dataADesactivar?.ciudad?.nombre ?? '')}</b>? 
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
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">Destino</h1>
            </div>
            <p className="text-gray-600">Gestiona los destinos del sistema de manera eficiente</p>
          </div>
          <div className="flex gap-3">
              {siTienePermiso("destinos", "exportar") && 
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
              }

              {siTienePermiso("destinos", "crear") && (
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
              Lista de Destinos
            </TabsTrigger>
            <TabsTrigger disabled={!siTienePermiso("destinos", "crear")} 
              value="form" className="cursor-pointer data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Crear Destino
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
                      <CardTitle className="text-emerald-900">Crear Nuevo Destino</CardTitle>
                      <CardDescription className="text-emerald-700">
                        Complete la información para crear un nuevo destino
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                     {/* PAIS */}
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

                        {/* CIUIDAD */}
                      <div className="space-y-2 mi-select-wrapper">
                        <Label htmlFor="ciudad" className="text-gray-700 font-medium">
                          Ciudad *
                        </Label>

                        <div className="space-y-2">
                          <DinamicSearchSelect
                            disabled={!selectedNacionalidadID}
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

                        {/* {JSON.stringify(selectedNacionalidadID)}
                        {JSON.stringify(nacionalidadNoSeleccionada)} */}
                          
                          {!selectedNacionalidadID && <p className="mt-1.5 text-sm text-gray-500 flex items-center gap-1">
                            <Info className="w-4 h-4" />
                            Primero selecciona un país
                          </p>}

                          {ciudadNoSeleccionada === false && (
                            <p className="text-red-400 text-sm">Este campo es requerido</p>
                          )}

                          {/* {onGuardar && nacionalidadNoSeleccionada === undefined && <p className="text-red-400 text-sm">Este campo es requerido</p>} */}
                      </div>


                    {/* ZONA GEOGRAFICA*/}
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Zona Geográfica *
                        </Label>

                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Solo lectura
                        </span>
                      </div>
                      <Input
                          id="zona_geografica"
                          disabled
                          autoComplete="zona_geografica"
                          placeholder="Se determinará según el país seleccionado"
                          className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500
                              w-full px-4 py-6 border-2 border-dashed rounded-lg bg-gradient-to-r from-gray-50 to-teal-50 text-gray-900 cursor-not-allowed font-medium
                              !text-lg placeholder:text-lg`}
                          {...register('zona_geografica', {
                          // required: true, 
                          // validate: {blankSpace: (value) => !!value.trim()},
                          // minLength: 3
                          })}
                        />
                      <div>
                        {(errors?.nombre?.type === 'required' || errors?.nombre?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                        {errors?.nombre?.type === 'minLength' && <span className='text-red-400 text-sm'>El username debe tener minimo 3 caracteres</span>}
                      </div>
                    </div>

                    {/* NOMBRE DEL DESTINO*/}
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Nombre del Destino *
                        </Label>

                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Auto-completado
                        </span>
                      </div>
                      <Input
                          id="nombre"
                          disabled
                          autoComplete="nombre"
                          placeholder="Se completará automáticamente"
                          className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500
                              w-full px-4 py-6 border-2 border-dashed rounded-lg bg-gradient-to-r from-gray-50 to-teal-50 text-gray-700 cursor-not-allowed font-medium
                              !text-lg placeholder:text-lg`}
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

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description" className="text-gray-700 font-medium">
                        Descripción *
                      </Label>
                      <Textarea
                          id="descripcion"
                          autoComplete="descripcion"
                          placeholder="Describe el destino y su funcionalidad"
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
                        {/* === Sección 1: búsqueda y selección === */}
                        <div>
                          <Label className="text-gray-700 font-medium">Seleccione los hoteles *</Label>

                          {/* Barra de búsqueda */}
                          <div className="relative mb-4 mt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Buscar hoteles..."
                              value={permissionSearchTerm}
                              onChange={(e) => setPermissionSearchTerm(e.target.value)}
                              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          {selectedPermissions.length > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                {selectedPermissions.length} hoteles seleccionados
                              </Badge>
                            </div>
                          )}

                          {/* === Lista de hoteles === */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4">
                            {isFetchingHoteles && (
                              <div className="w-full flex items-center justify-center">
                                <Loader2Icon className="animate-spin w-10 h-10 text-gray-300" />
                              </div>
                            )}

                            {/* Verificación de ciudad/nacionalidad antes de mostrar */}
                            {!isFetchingHoteles &&
                              selectedCiudadID &&
                              selectedNacionalidadID &&
                              dataHotelesList
                                ?.filter((hotel: any) =>
                                  hotel.nombre
                                    .toLowerCase()
                                    .includes(permissionSearchTerm.toLowerCase())
                                )
                                .map((hotel: any) => (
                                  <div
                                    key={hotel.id}
                                    className={`relative cursor-pointer duration-200 hover:shadow-sm flex 
                                      items-start p-3 rounded-lg hover:bg-gray-50 transition-colors
                                      border border-gray-200
                                      ${selectedPermissions.includes(hotel.id)
                                        ? "ring-2 ring-blue-200 bg-blue-50/50 border-blue-200"
                                        : ""}`}
                                  >
                                    <div className="flex items-start w-full">
                                      <div className="flex-shrink-0 mr-3 mt-0.5">
                                        <Checkbox
                                          id={`hotel-${hotel.id}`}
                                          checked={selectedPermissions.includes(hotel.id)}
                                          onCheckedChange={() => handlePermissionToggle(hotel.id)}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <Label
                                          htmlFor={`hotel-${hotel.id}`}
                                          className="text-sm font-medium text-gray-900 cursor-pointer block"
                                        >
                                          {hotel.nombre}
                                        </Label>
                                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                          {hotel.descripcion}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                            {/* Mensaje cuando no hay resultados */}
                            {selectedCiudadID &&
                              selectedNacionalidadID &&
                              dataHotelesList &&
                              dataHotelesList.filter((hotel: any) =>
                                hotel.nombre
                                  .toLowerCase()
                                  .includes(permissionSearchTerm.toLowerCase())
                              ).length === 0 && (
                                <div className="col-span-2 text-center py-8">
                                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Search className="h-6 w-6 text-gray-400" />
                                  </div>
                                  <p className="text-gray-500 text-sm">
                                    No se encontraron hoteles que coincidan con "
                                    {permissionSearchTerm}"
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

                            {/* Mensaje si ciudad o nacionalidad no están seleccionadas */}
                            {(!selectedCiudadID || !selectedNacionalidadID) && !isFetchingHoteles && (
                              <div className="col-span-2 text-center py-6">
                                <p className="text-gray-500 text-sm">
                                  Selecciona primero el pais y la ciudad para ver los hoteles disponibles.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* === Sección 2: Hoteles seleccionados === */}
                        <div className="bg-emerald-50 p-2 rounded-md px-3 py-2 border border-emerald-200">
                          <Label className="text-sm font-medium text-gray-500 mt-5">
                            Hoteles seleccionados ({hotelesSeleccionados.length})
                          </Label>
                          <div className="mt-2 space-y-2 max-h-50 overflow-y-auto">
                            {hotelesSeleccionados.map((hotel) => (
                              <div
                                key={hotel.id}
                                className="flex items-center justify-between gap-2
                                group relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-20"
                              >
                                <div className="flex-col items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    <HotelIcon className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm">{hotel.nombre}</span>
                                    <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                      {hotel.moneda_codigo}
                                      {hotel.precio_habitacion}
                                      <span className="text-gray-500 font-normal">
                                        {renderStars(hotel.estrellas)}
                                      </span>
                                    </Badge>
                                  </div>

                                  <div className="flex flex-wrap gap-1 max-w-xs mt-2">
                                    {hotel.servicios_detalle.length === 0 && (<p className="text-xs bg-gray-100 text-gray-600 border-gray-200">Sin servicios incluidos</p>)}
                                    {hotel.servicios_detalle.length > 0 && hotel.servicios_detalle.slice(0, 2).map((servicio: any) => {
                                      // const hotel = dataHotelesList?.find((p: any) => p.id === permi.id)
                                      console.log('hotel')
                                      return (
                                        <Badge key={servicio.id} className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                          {servicio.nombre}
                                        </Badge>
                                      )
                                    })}
                                    {hotel.servicios_detalle.length > 2 && (
                                      <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                        +{hotel.servicios_detalle.length - 2} más
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setHotelesSeleccionados((prev) =>
                                      prev.filter((h) => h.id !== hotel.id)
                                    );
                                    setSelectedPermissions((prev) =>
                                      prev.filter((id) => id !== hotel.id)
                                    );
                                  }}
                                  className="p-1 rounded hover:bg-red-100 text-red-500"
                                  aria-label="Quitar hotel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                  </div>

                  <div className="flex gap-3">
                    {!dataAEditar &&
                        <Button 
                            disabled={isPendingMutation}
                            type="submit"
                            onClick={() => setOnGuardar(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                          {isPendingMutation ? 
                              <>
                                  <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                  Creando...
                              </> : 
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Crear Destino
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
                                    Guardar Destino
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

          {/* Destinos List Tab */}
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
                          <CardTitle className="text-blue-900">Lista de Destinos</CardTitle>
                          <CardDescription className="text-blue-700">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} destinos
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
                            placeholder="Buscar por nombre de destino o nombre de país..."
                            value={busquedaPorFiltro}
                            onChange={(e) => setBusquedaPorFiltro(e.target.value)}
                            className="pl-10 w-full border-gray-300 focus:border-blue-500"
                          />
                        </div>
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

                      <div className="space-y-2 mi-select-wrapper w-2/5">
                          {isFetchingZonaGeografica &&
                          <Select>
                            <SelectTrigger className="cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 w-46 flex">
                              <div className="w-full flex items-center justify-center">
                                <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                              </div>
                            </SelectTrigger>
                          </Select>
                          }
                          {!isFetchingZonaGeografica && 
                            <>
                              <div className="space-y-2 w-full">
                                <GenericSearchSelect
                                  dataList={dataZonaGeograficaList}
                                  value={selectedZonaGeograficaID}
                                  onValueChange={setSelectedZonaGeograficaID}
                                  handleDataNoSeleccionada={handleCadenaNoSeleccionada}
                                  placeholder="Selecciona la zona geografica..."
                                  labelKey="nombre"
                                  // secondaryLabelKey="destino"
                                  // thirdLabelKey="pais"
                                  valueKey="id"
                                />
                            </div>
                            </>
                          }
                        </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFiltros({
                            activo: true,   // null = todos, true = solo activos
                            fecha_desde: "",
                            fecha_hasta: "",
                            nombre: ""
                          });
                          setBusquedaPorFiltro(""); 
                          setRazonSocialABuscar("");
                          setSelectedZonaGeograficaID("");
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
                      <TableHead className="font-semibold text-gray-700">País</TableHead>
                      <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                      <TableHead className="font-semibold text-gray-700">Hoteles</TableHead>
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
                    
                      {!isFetching && dataList.length > 0 && siTienePermiso("destinos", "leer") && dataList.map((data: Destino) => (
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
                                  <div className="font-medium text-gray-900">{data?.ciudad.nombre}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{data.descripcion}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className='text-xs bg-blue-100 text-blue-700 border-blue-200"'
                                >
                                  {data?.ciudad?.pais_nombre}
                                </Badge>
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
                                  {data.hoteles.slice(0, 2).map((permi) => {
                                    // const hotel = dataHotelesList?.find((p: any) => p.id === permi.id)
                                    console.log('hotel')
                                    return (
                                      <Badge key={permi.id} className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                        {permi.nombre}
                                      </Badge>
                                    )
                                  })}
                                  {data.hoteles.length > 2 && (
                                    <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                      +{data.hoteles.length - 2} más
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
                                {siTienePermiso("destinos", "leer") &&
                                  <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer"
                                    onClick={() => handleVerDetalles(data)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                }
                                {siTienePermiso("destinos", "modificar") &&
                                  <DropdownMenuItem className="hover:bg-emerald-50 cursor-pointer" onClick={() => handleEditar(data)}>
                                    <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                                    Editar
                                  </DropdownMenuItem>
                                }
                                <DropdownMenuSeparator />
                                {siTienePermiso("destinos", "eliminar") &&
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
