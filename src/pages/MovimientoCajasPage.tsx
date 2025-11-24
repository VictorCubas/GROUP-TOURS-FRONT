/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { startTransition, useEffect, useState } from "react"
import {
  Search,
  Eye,
  Loader2Icon,
  Info,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  X,
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
import { useQuery } from '@tanstack/react-query';
import { queryClient } from "@/components/utils/http"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { MovimientoCaja, RespuestaPaginada } from "@/types/cajas"
import { formatearFecha, formatearSeparadorMiles } from "@/helper/formatter"
import { fetchMovimientos, fetchResumenMovimientos } from "@/components/utils/httpMovimientos"
import { fetchAperturaActiva } from "@/components/utils/httpAperturasCajas"
import Modal from "@/components/Modal"
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { useSessionStore } from "@/store/sessionStore"


const usuariosStatusColors = {
  true: "bg-emerald-100 text-emerald-700 border-emerald-200",
  false: "bg-gray-100 text-gray-700 border-gray-200",
}


let dataList: any[] = [];

export default function MovimientoCajasPage() {
  const {siTienePermiso, hasRole, session } = useSessionStore();
  const [busqueda, setBusqueda] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [onVerDetalles, setOnVerDetalles] = useState(false);
  const [dataDetalle, setDataDetalle] = useState<MovimientoCaja>();
  const [aperturaActivaId, setAperturaActivaId] = useState<number | undefined>(undefined);
  const [cargandoApertura, setCargandoApertura] = useState(false);

  // Si el usuario tiene rol de Cajero, solo puede ver sus propios movimientos
  const esCajero = hasRole('Cajero');
  const usuarioId = session?.usuarioId;

  const [filtros, setFiltros] = useState({
    activo: true,
    tipo_movimiento: "all",
    metodo_pago: "all",
    concepto: "all",
    busqueda: "",
    tiene_comprobante: undefined as boolean | undefined,
    usuario_registro: esCajero ? usuarioId : undefined,
    apertura: undefined as number | undefined
  });


  const [currentPage, setCurrentPage] = useState(1);
  const [paginacion, setPaginacion] = useState<RespuestaPaginada>({
    next: null,
    totalItems: 0,
    previous: null,
    totalPages: 1,
    pageSize: 10
  });


  console.log(filtros)
  const {data, isFetching, isError} = useQuery({
    queryKey: ['movimientos', currentPage, paginacion.pageSize, filtros],
    queryFn: () => fetchMovimientos(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000,
    enabled: !cargandoApertura, // No ejecutar query hasta que se cargue la apertura activa
  });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['movimientos-resumen'],
    queryFn: () => fetchResumenMovimientos(),
    staleTime: 5 * 60 * 1000
  });

  if(!isFetching && !isError){
    if(data?.results){
      dataList = data.results.map((mov: MovimientoCaja, index: number) => ({...mov, numero: index + 1}));
    }
  }

  const totalItems = dataList?.length
  const startIndex = (currentPage - 1) * paginacion.pageSize
  const endIndex = startIndex + paginacion.pageSize

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }

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

  const handleVerDetalles = (data: MovimientoCaja) => {
    setDataDetalle(data);
    setOnVerDetalles(true);
  }

  const handleCloseVerDetalles = () => {
    setOnVerDetalles(false);
    setDataDetalle(undefined);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setFiltros(filtroAnterior => ({...filtroAnterior, busqueda: busqueda}))
    }, 750)

    return () => {
      clearTimeout(handler)
    }
  }, [busqueda]);

  // Obtener la apertura activa cuando el usuario es cajero
  useEffect(() => {
    const obtenerAperturaActiva = async () => {
      if (esCajero) {
        setCargandoApertura(true);
        const aperturaActiva = await fetchAperturaActiva();
        if (aperturaActiva?.apertura_id) {
          setAperturaActivaId(aperturaActiva.apertura_id);
          setFiltros(filtrosPrevios => ({
            ...filtrosPrevios,
            apertura: aperturaActiva.apertura_id
          }));
        }
        setCargandoApertura(false);
      }
    };

    obtenerAperturaActiva();
  }, [esCajero]);

  // Refrescar movimientos cuando se obtiene la apertura activa
  useEffect(() => {
    if (aperturaActivaId) {
      queryClient.invalidateQueries({
        queryKey: ['movimientos'],
        exact: false
      });
    }
  }, [aperturaActivaId]);

  return (
    <>
      {onVerDetalles &&
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="modal-detalles-reserva bg-white/95 rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
            <Modal onClose={handleCloseVerDetalles} claseCss={'modal-detalles'}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      dataDetalle?.tipo_movimiento === 'ingreso'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}>
                      <Receipt className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {dataDetalle?.numero_movimiento}
                      </h2>
                      <p className="text-gray-600">Detalles del movimiento</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tipo de Movimiento</Label>
                      <div className="mt-1">
                        <Badge className={dataDetalle?.tipo_movimiento === 'ingreso'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-red-100 text-red-700 border-red-200'}>
                          {dataDetalle?.tipo_movimiento === 'ingreso' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {dataDetalle?.tipo_movimiento_display}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Estado</Label>
                      <div className="mt-1">
                        <Badge className={usuariosStatusColors[dataDetalle?.activo.toString() as keyof typeof usuariosStatusColors]}>
                          {dataDetalle?.activo ? "Activo" : "Anulado"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Información de caja y apertura */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Caja</Label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {dataDetalle?.caja_nombre}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Apertura</Label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {dataDetalle?.apertura_codigo}
                      </p>
                    </div>
                  </div>

                  {/* Concepto y método de pago */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Concepto</Label>
                      <p className="mt-1 text-gray-900">
                        {dataDetalle?.concepto_display}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Método de Pago</Label>
                      <p className="mt-1 text-gray-900">
                        <CreditCard className="h-4 w-4 inline mr-1" />
                        {dataDetalle?.metodo_pago_display}
                      </p>
                    </div>
                  </div>

                  {/* Monto - Dual Currency */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Monto</Label>
                    
                    {/* Moneda original destacada */}
                    {dataDetalle?.moneda_original === 'USD' ? (
                      <>
                        <p className="text-2xl font-bold text-blue-900">
                          USD {Number(dataDetalle?.monto_usd ?? dataDetalle?.monto ?? 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Gs. {formatearSeparadorMiles.format(Number(dataDetalle?.monto_gs ?? 0))}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-gray-900">
                          Gs. {formatearSeparadorMiles.format(Number(dataDetalle?.monto_gs ?? dataDetalle?.monto ?? 0))}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          USD {Number(dataDetalle?.monto_usd ?? 0).toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Comprobante */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tiene Comprobante</Label>
                      <div className="mt-1">
                        <Badge className={dataDetalle?.tiene_comprobante
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'}>
                          {dataDetalle?.tiene_comprobante ? 'Sí' : 'No'}
                        </Badge>
                      </div>
                    </div>
                    {dataDetalle?.comprobante_numero && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Número de Comprobante</Label>
                        <p className="mt-1 text-gray-900 font-medium">
                          {dataDetalle?.comprobante_numero}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  {dataDetalle?.descripcion && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Descripción</Label>
                      <p className="mt-1 text-gray-900">
                        {dataDetalle?.descripcion}
                      </p>
                    </div>
                  )}

                  {/* Referencia */}
                  {dataDetalle?.referencia && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Referencia</Label>
                      <p className="mt-1 text-gray-900">
                        {dataDetalle?.referencia}
                      </p>
                    </div>
                  )}

                  {/* Información de registro */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Fecha y Hora</Label>
                      <p className="mt-1 text-gray-900">
                        {formatearFecha(dataDetalle?.fecha_hora_movimiento ?? '')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Usuario Registro</Label>
                      <p className="mt-1 text-gray-900">
                        {dataDetalle?.usuario_nombre}
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
                </div>
              </div>
            </Modal>
          </div>
        </div>
      }

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">Movimientos de Caja</h1>
            </div>
            <p className="text-gray-600">Visualiza todos los movimientos registrados en las cajas del sistema.</p>
          </div>
          {/* <div className="flex gap-3">
            {siTienePermiso("movimientos", "exportar") &&
              <Button
                variant="outline"
                className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            }
          </div> */}
        </div>

        {/* Stats Cards */}
        <ResumenCardsDinamico resumen={dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/>

        {/* Main Content */}
        <Card className="border-blue-200 pt-0">
          <CardHeader className="bg-blue-50 border-b border-blue-200 pt-8">
            <div className="flex flex-col items-start justify-between">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-blue-900">Lista de Movimientos</CardTitle>
                    <CardDescription className="text-blue-700">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {paginacion.totalItems} movimientos
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

                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por número, descripción..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10 w-full border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-blue-200 w-full flex-wrap">
                <Select
                  value={filtros.tipo_movimiento}
                  onValueChange={(val) => setFiltros({ ...filtros, tipo_movimiento: val })}
                >
                  <SelectTrigger className="cursor-pointer w-40 border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ingreso">Ingresos</SelectItem>
                    <SelectItem value="egreso">Egresos</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filtros.metodo_pago}
                  onValueChange={(val) => setFiltros({ ...filtros, metodo_pago: val })}
                >
                  <SelectTrigger className="cursor-pointer w-52 border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los métodos</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta_debito">Tarjeta de Débito</SelectItem>
                    <SelectItem value="tarjeta_credito">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFiltros({
                      activo: true,
                      tipo_movimiento: "all",
                      metodo_pago: "all",
                      concepto: "all",
                      busqueda: "",
                      tiene_comprobante: undefined,
                      usuario_registro: esCajero ? usuarioId : undefined,
                      apertura: esCajero ? aperturaActivaId : undefined
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
                  <TableHead className="font-semibold text-gray-700">Número</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                  <TableHead className="font-semibold text-gray-700">Concepto</TableHead>
                  <TableHead className="font-semibold text-gray-700">Monto</TableHead>
                  <TableHead className="font-semibold text-gray-700">Método Pago</TableHead>
                  <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                  <TableHead className="font-semibold text-gray-700">Caja</TableHead>
                  <TableHead className="w-20 font-semibold text-gray-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="w-full">
                {isFetching &&
                  <TableRow className="w-full">
                    <TableCell className="w-full absolute top-5/12">
                      <div className="w-full flex items-center justify-center">
                        <Loader2Icon className="animate-spin w-10 h-10 text-gray-500"/>
                      </div>
                    </TableCell>
                  </TableRow>
                }

                {!isFetching && dataList.length > 0 && siTienePermiso("movimientos", "leer") && dataList.map((mov: MovimientoCaja) => (
                  <TableRow
                    key={mov.id}
                    className={`hover:bg-blue-50 transition-colors cursor-pointer ${!mov.activo ? 'opacity-50' : ''}`}
                  >
                    <TableCell>
                      <div className="font-medium text-gray-900 pl-2">
                        {mov?.numero}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-gray-900 truncate max-w-xs">
                        {mov?.numero_movimiento}
                      </div>
                      {mov?.comprobante_numero && (
                        <div className="text-xs text-gray-500">
                          {mov.comprobante_numero}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge className={mov.tipo_movimiento === 'ingreso'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-red-100 text-red-700 border-red-200'}>
                        {mov.tipo_movimiento === 'ingreso' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {mov?.tipo_movimiento_display}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {mov?.concepto_display}
                      </div>
                    </TableCell>

                    <TableCell>
                      {/* Monto en moneda original (destacado) */}
                      {mov.moneda_original === 'USD' ? (
                        <>
                          <div className="font-bold text-blue-900">
                            USD {Number(mov.monto_usd ?? mov.monto ?? 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Gs. {formatearSeparadorMiles.format(Number(mov.monto_gs ?? 0))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-gray-900">
                            Gs. {formatearSeparadorMiles.format(Number(mov.monto_gs ?? mov.monto ?? 0))}
                          </div>
                          <div className="text-xs text-gray-500">
                            USD {Number(mov.monto_usd ?? 0).toFixed(2)}
                          </div>
                        </>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {mov?.metodo_pago_display}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {formatearFecha(mov?.fecha_hora_movimiento)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {mov?.usuario_nombre}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {mov?.caja_nombre}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                            <Info className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-gray-200">
                          {siTienePermiso("movimientos", "leer") &&
                            <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer"
                              onClick={() => handleVerDetalles(mov)}>
                              <Eye className="h-4 w-4 mr-2 text-blue-500" />
                              Ver detalles
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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron movimientos</h3>
                        <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda.</p>
                        <Button
                          onClick={() => {
                            handleReset();
                            setFiltros({
                              activo: true,
                              tipo_movimiento: "all",
                              metodo_pago: "all",
                              concepto: "all",
                              busqueda: "",
                              tiene_comprobante: undefined,
                              usuario_registro: esCajero ? usuarioId : undefined,
                              apertura: esCajero ? aperturaActivaId : undefined
                            });
                            setBusqueda("");
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
                  <Select value={paginacion?.pageSize?.toString() ?? "10"} onValueChange={handleItemsPerPageChange}>
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
      </div>
    </>
  )
}
