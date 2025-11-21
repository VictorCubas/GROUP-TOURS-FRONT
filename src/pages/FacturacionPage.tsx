/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { startTransition, use, useEffect, useState } from "react"
import {
  Search,
  MoreHorizontal,
  Download,
  Eye,
  Loader2Icon,
  FileText,
  X,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { FaAngleDoubleRight } from "react-icons/fa";
import { useMutation, useQuery } from '@tanstack/react-query';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import type { FacturaListado, RespuestaPaginada } from "@/types/facturacion"
import { formatearFecha, formatearSeparadorMiles } from "@/helper/formatter"
import { fetchFacturas, fetchResumenFacturas, anularFactura, descargarFacturaPDF } from "@/components/utils/httpFacturacion"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoWarningOutline } from "react-icons/io5";
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { useSessionStore } from "@/store/sessionStore"


const usuariosStatusColors = {
  true: "bg-emerald-100 text-emerald-700 border-emerald-200",
  false: "bg-gray-100 text-gray-700 border-gray-200",
}

const MOTIVOS_ANULACION = [
  { value: '1', label: 'Error en datos de emisor' },
  { value: '2', label: 'Error en datos del receptor' },
  { value: '3', label: 'Error en datos de la operación' },
  { value: '4', label: 'Operación no realizada' },
  { value: '5', label: 'Por acuerdo entre las partes' }
];

let dataList: any[] = [];

export default function FacturacionPage() {
  const {siTienePermiso } = useSessionStore();
  const [busqueda, setBusqueda] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [facturaAAnular, setFacturaAAnular] = useState<FacturaListado>();
  const [onAnularFactura, setOnAnularFactura] = useState(false);
  const [onVerDetalles, setOnVerDetalles] = useState(false);
  const [dataDetalle, setDataDetalle] = useState<FacturaListado>();
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const {handleShowToast} = use(ToastContext);

  const obtenerDescripcionMotivo = (codigo: string) => {
    const motivo = MOTIVOS_ANULACION.find(m => m.value === codigo);
    return motivo ? motivo.label : codigo;
  };

  const [filtros, setFiltros] = useState({
                  activo: true,   // null = todos, true = solo activos
                  busqueda: "",
                  fecha_emision_desde: "",
                  fecha_emision_hasta: ""
                });

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab] = useState('list');
  const [paginacion, setPaginacion] = useState<RespuestaPaginada>({
                                                      next: null,
                                                      totalItems: 0,
                                                      previous: null,
                                                      totalPages: 1,
                                                      pageSize: 10
                                              });

  const {data, isFetching, isError} = useQuery({
    queryKey: ['facturas', currentPage, paginacion.pageSize, filtros],
    queryFn: () => fetchFacturas(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000,
  });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['facturas-resumen'],
    queryFn: () => fetchResumenFacturas(),
    staleTime: 5 * 60 * 1000
  });

  if(!isFetching && !isError){
    if(data?.results){
      dataList = data.results.map((factura: FacturaListado, index: number) => ({...factura, numero: (currentPage - 1) * paginacion.pageSize + index + 1}));
    }
  }

  
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
    setPaginacion(prevPagination => ({...prevPagination, pageSize: Number(value)}))
    setCurrentPage(1)
  }

  useEffect(() => {
    if (!data) return;
    setPaginacion({
            next: data?.next ?? null,
            totalItems: data?.count ?? null,
            previous: data?.previous ??  null,
            totalPages: data?.totalPages,
            pageSize: data?.pageSize ?? null
          });
  }, [data])

  const handleReset = () => {
    startTransition(() => {
        setShowActiveOnly(true);
        setBusqueda("")
      });
  }

  const handleActiveOnly = () => {
    setShowActiveOnly(prev => !prev)
    setFiltros({ ...filtros, activo: !showActiveOnly })
    setCurrentPage(1);
  }

  const {mutate: mutateAnularFactura, isPending: isPendingAnular} = useMutation({
    mutationFn: anularFactura,
    onSuccess: () => {
        handleShowToast('La factura ha sido anulada satisfactoriamente', 'success');
        handleCancel()

        // Invalidar queries de facturas
        queryClient.invalidateQueries({
          queryKey: ['facturas'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['facturas-resumen'],
        });
        
        // Invalidar queries de reservas después de anular factura
        queryClient.invalidateQueries({
          queryKey: ['reservas'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['reserva-detalles'],
          exact: false
        });
    },
  });


  const handleCancel = () => {
        setFacturaAAnular(undefined);
        setOnAnularFactura(false);
        setMotivoAnulacion("");
  }

  const handleAnularFactura = (factura: FacturaListado) => {
    setFacturaAAnular(factura);
    setOnAnularFactura(true);
  }

  const handleCloseModal = () => {
    setOnAnularFactura(false);
    setMotivoAnulacion("");
  }

  const handleConfirmAnular = () => {
    if (!motivoAnulacion) {
      handleShowToast('Debe seleccionar un motivo para anular la factura', 'error');
      return;
    }
    mutateAnularFactura({
      facturaId: facturaAAnular!.id,
      motivo: motivoAnulacion
    })
  }

  const handleVerDetalles = (data: FacturaListado) => {
    setDataDetalle(data);
    setOnVerDetalles(true);
  }

  const handleCloseVerDetalles = () => {
    setOnVerDetalles(false);
    setDataDetalle(undefined);
  }

  const handleDescargarPDF = async (factura: FacturaListado) => {
    try {
      await descargarFacturaPDF(factura.id);
      handleShowToast('Factura descargada exitosamente', 'success');
      
      // Invalidar queries de facturas después de descargar
      queryClient.invalidateQueries({
        queryKey: ['facturas'],
        exact: false
      });
      queryClient.invalidateQueries({
        queryKey: ['facturas-resumen'],
      });
    } catch (error) {
      console.log(error);
      handleShowToast('Error al descargar la factura', 'error');
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setFiltros(filtroAnterior => ({...filtroAnterior, busqueda: busqueda}))
    }, 750)

    return () => {
      clearTimeout(handler)
    }
  }, [busqueda]);


  return (
    <>
        {onVerDetalles &&
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="modal-detalles-reserva bg-white/95 rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
              <Modal onClose={handleCloseVerDetalles} claseCss={'modal-detalles'}>
                  <div className="bg-white rounded-lg shadow-lg p-6">
                      {/* Header */}
                      <div className="mb-6 border-b pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              {dataDetalle?.numero_factura}
                            </h2>
                            <p className="text-gray-600">Detalles completos de la factura</p>
                          </div>
                        </div>
                      </div>

                        <div className="space-y-6">
                          {/* Información básica */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Número de Factura</Label>
                              <p className="mt-1 text-gray-900 font-semibold">
                                {dataDetalle?.numero_factura}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Estado</Label>
                              <div className="mt-1">
                                <Badge
                                  className={usuariosStatusColors[dataDetalle?.activo.toString() as keyof typeof usuariosStatusColors]}
                                >
                                  {dataDetalle?.activo ? "Activa" : "Anulada"}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Cliente y fechas */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Cliente</Label>
                              <p className="mt-1 text-gray-900 font-medium">
                                {dataDetalle?.cliente_nombre}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Fecha de Emisión</Label>
                              <p className="mt-1 text-gray-900">
                                {formatearFecha(dataDetalle?.fecha_emision ?? '')}
                              </p>
                            </div>
                          </div>

                          {/* Tipo y condición */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Tipo de Facturación</Label>
                              <p className="mt-1 text-gray-900">
                                {dataDetalle?.tipo_facturacion === 'total' ? 'Total' : 'Por Pasajero'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Condición de Venta</Label>
                              <p className="mt-1 text-gray-900">
                                {dataDetalle?.condicion_venta === 'contado' ? 'Contado' : 'Crédito'}
                              </p>
                            </div>
                          </div>

                          {/* Monto */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Monto Total</Label>
                            <p className="text-2xl font-bold text-gray-900">
                              Gs. {formatearSeparadorMiles.format(Number(dataDetalle?.total_general ?? 0))}
                            </p>
                          </div>

                          {/* Información de anulación si aplica */}
                          {!dataDetalle?.activo && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                              <Label className="text-sm font-medium text-red-700 mb-3 block">Información de Anulación</Label>
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">Fecha de Anulación</Label>
                                  <p className="mt-1 text-gray-900">
                                    {formatearFecha(dataDetalle?.fecha_anulacion ?? '')}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">Motivo</Label>
                                  <p className="mt-1 text-gray-900">
                                    {obtenerDescripcionMotivo(dataDetalle?.motivo_anulacion ?? '')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                      {/* Footer */}
                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          onClick={handleCloseVerDetalles}
                          className="cursor-pointer border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>

              </Modal>
            </div>
      </div>}

      {onAnularFactura &&
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="modal-detalles-reserva bg-white/95 rounded-xl shadow-xl max-w-2xl w-full backdrop-blur-sm">
              <Modal onClose={handleCloseModal} claseCss="modal" preventClickOutsideClose={true}>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                          <IoWarningOutline className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h2 className='text-center text-xl font-semibold'>Anular Factura</h2>
                    <p className='text-gray-600 dark:text-gray-400 mt-2 text-justify'>
                      ¿Estás seguro de que deseas anular la factura
                      <b> {facturaAAnular?.numero_factura}</b>?
                      Esta acción no se puede deshacer.
                    </p>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor="motivo" className="text-gray-700 font-medium">
                        Motivo de anulación *
                      </Label>
                      <Select
                        value={motivoAnulacion}
                        onValueChange={(value) => setMotivoAnulacion(value)}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                          <SelectValue placeholder="Seleccione un motivo..." />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {MOTIVOS_ANULACION.map((motivo) => (
                            <SelectItem key={motivo.value} value={motivo.value}>
                              {motivo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='modal-actions mt-6'>
                          <Button className="hover:bg-transparent cursor-pointer bg-transparent text-gray-700" onClick={handleCloseModal}>Cancelar</Button>
                          <Button
                            disabled={isPendingAnular || !motivoAnulacion}
                            className="cursor-pointer bg-red-500 hover:bg-red-600 flex justify-center items-center shadow-none hover:shadow-none"
                            onClick={handleConfirmAnular}>
                                          {!isPendingAnular ? 'Anular Factura': 'Procesando..'}
                          </Button>
                    </div>
              </Modal>
            </div>
      </div>}

      <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">Facturas</h1>
              </div>
              <p className="text-gray-600">Listado completo de facturas emitidas del sistema.</p>
            </div>
            <div className="flex gap-3">
              {siTienePermiso("facturacion", "exportar") &&
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
              }
            </div>
          </div>

          {/* Stats Cards */}
          <ResumenCardsDinamico resumen={dataResumen || []} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/>

          {/* Main Content */}
          <Tabs value={activeTab} className="space-y-6">
            {/* List Tab */}
            <TabsContent value="list">
              <Card className="border-blue-200 pt-0">
                <CardHeader className="bg-blue-50 border-b border-blue-200 pt-8">
                  <div className="flex flex-col items-start justify-between">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-blue-900">Lista de Facturas</CardTitle>
                          <CardDescription className="text-blue-700">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} facturas
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
                            placeholder="Buscar por número de factura o cliente..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="pl-10 w-full border-gray-300 focus:border-blue-500"
                          />
                        </div> 
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-blue-200 w-full flex-wrap">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha emisión desde:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_emision_desde}
                          onChange={(e) => setFiltros({...filtros, fecha_emision_desde: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha emisión hasta:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_emision_hasta}
                          onChange={(e) => setFiltros({...filtros, fecha_emision_hasta: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFiltros({
                            activo: true,
                            busqueda: "",
                            fecha_emision_desde: "",
                            fecha_emision_hasta: ""
                          });
                          setBusqueda("");
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
                        <TableHead className="font-semibold text-gray-700">Nro. Factura</TableHead>
                        <TableHead className="font-semibold text-gray-700">Cliente</TableHead>
                        <TableHead className="font-semibold text-gray-700">Fecha Emisión</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                        <TableHead className="font-semibold text-gray-700">Condición</TableHead>
                        <TableHead className="font-semibold text-gray-700">Total</TableHead>
                        <TableHead className="font-semibold text-gray-700">Estado</TableHead>
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
                      {!isFetching && dataList.length > 0 &&  siTienePermiso("facturacion", "leer") && dataList.map((data: FacturaListado) => (
                        <TableRow
                          key={data.id}
                          className={`hover:bg-blue-50 transition-colors cursor-pointer`}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 pl-2">
                                {data?.numero}
                              </div>
                            </div>
                          </TableCell>
       
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {data?.numero_factura}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-900 truncate max-w-xs">
                                {data?.cliente_nombre}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {formatearFecha(data?.fecha_emision)}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-900 truncate max-w-xs">
                                {data?.tipo_facturacion === 'total' ? 'Total' : 'Por Pasajero'}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-900 truncate max-w-xs">
                                {data?.condicion_venta === 'contado' ? 'Contado' : 'Crédito'}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="font-medium text-gray-900 truncate max-w-xs">
                              Gs. {formatearSeparadorMiles.format(Number(data?.total_general ?? 0))}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className={usuariosStatusColors[data?.activo.toString() as keyof typeof usuariosStatusColors]}>
                              {data?.activo ? 'Activa' : 'Anulada'}
                            </Badge>
                          </TableCell>
    

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-gray-200">
                                {siTienePermiso("facturacion", "leer") &&
                                  <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer"
                                    onClick={() => handleVerDetalles(data)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                }
                                {siTienePermiso("facturacion", "leer") &&
                                  <DropdownMenuItem className="hover:bg-green-50 cursor-pointer"
                                    onClick={() => handleDescargarPDF(data)}>
                                    <Download className="h-4 w-4 mr-2 text-green-500" />
                                    Descargar
                                  </DropdownMenuItem>
                                }
                                {siTienePermiso("facturacion", "eliminar") && data.activo &&
                                  <DropdownMenuItem
                                    className="text-red-600 hover:bg-red-50 cursor-pointer"
                                    onClick={() => handleAnularFactura(data)}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Anular factura
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
                            <div className="text-center py-12 absolute-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron facturas</h3>
                              <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda.</p>
                              <Button
                                onClick={() => {
                                  handleReset();
                                  setFiltros({
                                      activo: true,
                                      busqueda: "",
                                      fecha_emision_desde: "",
                                      fecha_emision_hasta: ""
                                    });
                                }}
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

  )
}
