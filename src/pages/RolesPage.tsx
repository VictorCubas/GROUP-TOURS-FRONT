/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Check,
  X,
  Shield,
  Users,
  Package,
  User,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  AlertCircle,
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

const permissions = [
  {
    id: 1,
    name: "Gestión de Usuarios",
    type: "Modificación",
    active: true,
    inUse: true,
    description: "Permite crear, editar y eliminar usuarios del sistema",
    form: "Usuarios",
    createdAt: "2024-01-15",
    lastUsed: "2024-01-22",
  },
  {
    id: 2,
    name: "Visualizar Paquetes",
    type: "Lectura",
    active: true,
    inUse: true,
    description: "Permite visualizar la información de paquetes de viaje",
    form: "Paquetes",
    createdAt: "2024-01-10",
    lastUsed: "2024-01-22",
  },
  {
    id: 3,
    name: "Eliminar Reservas",
    type: "Eliminación",
    active: false,
    inUse: false,
    description: "Permite eliminar reservas del sistema",
    form: "Reservas",
    createdAt: "2024-01-05",
    lastUsed: "2024-01-18",
  },
  {
    id: 4,
    name: "Crear Reportes",
    type: "Escritura",
    active: true,
    inUse: true,
    description: "Permite generar y exportar reportes del sistema",
    form: "Reportes",
    createdAt: "2024-01-12",
    lastUsed: "2024-01-21",
  },
]

type Priority = 'high' | 'medium' | 'low';
type TypePermission = keyof typeof typeColors;


const typeColors = {
  Lectura: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Escritura: "bg-blue-100 text-blue-700 border-blue-200",
  Modificación: "bg-amber-100 text-amber-700 border-amber-200",
  Eliminación: "bg-red-100 text-red-700 border-red-200",
}

const priorityColors: Record<Priority, string> = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
  low: "bg-green-50 text-green-600 border-green-200",
}


type ModuleKey = keyof typeof moduleColors; // "Usuarios" | "Paquetes" | "Empleados" | "Roles" | "Reservas" | "Reportes"


const moduleColors = {
  Usuarios: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Paquetes: "bg-purple-50 text-purple-600 border-purple-200",
  Empleados: "bg-orange-50 text-orange-600 border-orange-200",
  Roles: "bg-yellow-50 text-yellow-600 border-yellow-200",
  Reservas: "bg-pink-50 text-pink-600 border-pink-200",
  Reportes: "bg-indigo-50 text-indigo-600 border-indigo-200",
}


function StatsCards() {
  const stats = [
    { title: "Total", value: "24", icon: Shield, color: "border-blue-200 bg-blue-50", iconColor: "text-blue-500" },
    {
      title: "Activos",
      value: "18",
      icon: Check,
      color: "border-emerald-200 bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    { title: "En Uso", value: "12", icon: Eye, color: "border-purple-200 bg-purple-50", iconColor: "text-purple-500" },
    { title: "Críticos", value: "3", icon: AlertCircle, color: "border-red-200 bg-red-50", iconColor: "text-red-500" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className={`border ${stat.color} hover:shadow-md transition-shadow`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PermissionsModule() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [selectedType, setSelectedType] = useState("all")
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesActive = !showActiveOnly || permission.active
    const matchesType = selectedType === "all" || permission.type === selectedType
    return matchesSearch && matchesActive && matchesType
  })

  const handleSelectAll = () => {
    if (selectedPermissions.length === filteredPermissions.length) {
      setSelectedPermissions([])
    } else {
      setSelectedPermissions(filteredPermissions.map((p) => p.id))
    }
  }

  const handleSelectPermission = (id: number) => {
    setSelectedPermissions((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  

  return (
    <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-semibold text-gray-900">Roles</h1>
                </div>
                <p className="text-gray-600">Gestiona los roles del sistema de manera eficiente</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Permiso
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <StatsCards />

            {/* Main Content */}
            <Tabs defaultValue="list" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-80 bg-gray-100">
                <TabsTrigger value="list" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Lista de Permisos
                </TabsTrigger>
                <TabsTrigger value="form" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  Crear Permiso
                </TabsTrigger>
              </TabsList>

              {/* Bulk Actions */}
              {selectedPermissions.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-800">
                        {selectedPermissions.length} permisos seleccionados
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                          <Check className="h-3 w-3 mr-1" />
                          Activar
                        </Button>
                        <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                          <X className="h-3 w-3 mr-1" />
                          Desactivar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Registration Form Tab */}
              <TabsContent value="form">
                <Card className="border-emerald-200 pt-0">
                  <CardHeader className="bg-emerald-50 border-b border-emerald-200 pt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-900">Crear Nuevo Permiso</CardTitle>
                        <CardDescription className="text-emerald-700">
                          Complete la información para crear un nuevo permiso
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Nombre del Permiso *
                        </Label>
                        <Input
                          id="name"
                          placeholder="Nombre del permiso"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-gray-700 font-medium">
                          Tipo *
                        </Label>
                        <Select>
                          <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lectura">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                Lectura
                              </div>
                            </SelectItem>
                            <SelectItem value="escritura">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                Escritura
                              </div>
                            </SelectItem>
                            <SelectItem value="modificacion">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                                Modificación
                              </div>
                            </SelectItem>
                            <SelectItem value="eliminacion">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                Eliminación
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="form" className="text-gray-700 font-medium">
                          Módulo *
                        </Label>
                        <Select>
                          <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                            <SelectValue placeholder="Selecciona el módulo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usuarios">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-emerald-500" />
                                Usuarios
                              </div>
                            </SelectItem>
                            <SelectItem value="paquetes">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-purple-500" />
                                Paquetes
                              </div>
                            </SelectItem>
                            <SelectItem value="empleados">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-orange-500" />
                                Empleados
                              </div>
                            </SelectItem>
                            <SelectItem value="roles">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-yellow-500" />
                                Roles
                              </div>
                            </SelectItem>
                            <SelectItem value="reservas">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-pink-500" />
                                Reservas
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description" className="text-gray-700 font-medium">
                          Descripción *
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe el permiso"
                          className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="bg-emerald-500 hover:bg-emerald-600">
                        <Check className="h-4 w-4 mr-2" />
                        Crear Permiso
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Permissions List Tab */}
              <TabsContent value="list">
                <Card className="border-blue-200 pt-0">
                  <CardHeader className="bg-blue-50 border-b border-blue-200 pt-8">
                    <div className="flex items-center justify-between ">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-blue-900">Lista de Permisos</CardTitle>
                          <CardDescription className="text-blue-700">
                            {filteredPermissions.length} permisos encontrados
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-emerald-50 rounded-full px-3 py-2 border border-emerald-200">
                          <Switch
                            checked={showActiveOnly}
                            onCheckedChange={setShowActiveOnly}
                            id="active-filter"
                            className="data-[state=checked]:bg-emerald-500"
                          />
                          <Label htmlFor="active-filter" className="text-sm text-emerald-700 font-medium">
                            Solo activos
                          </Label>
                        </div>

                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger className="w-40 border-purple-200 focus:border-purple-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="Lectura">Lectura</SelectItem>
                            <SelectItem value="Escritura">Escritura</SelectItem>
                            <SelectItem value="Modificación">Modificación</SelectItem>
                            <SelectItem value="Eliminación">Eliminación</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64 border-gray-300 focus:border-blue-500"
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-300 hover:bg-gray-50 bg-transparent"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                selectedPermissions.length === filteredPermissions.length &&
                                filteredPermissions.length > 0
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">Información</TableHead>
                          <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                          <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                          <TableHead className="font-semibold text-gray-700">Uso</TableHead>
                          <TableHead className="font-semibold text-gray-700">Módulo</TableHead>
                          <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                          <TableHead className="w-20 font-semibold text-gray-700">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPermissions.map((permission) => (
                          <TableRow
                            key={permission.id}
                            className={`hover:bg-gray-50 transition-colors ${
                              selectedPermissions.includes(permission.id) ? "bg-blue-50" : ""
                            }`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => handleSelectPermission(permission.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{permission.name}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{permission.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${typeColors[permission.type as TypePermission]} border`}>{permission.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  permission.active
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }
                              >
                                {permission.active ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center">
                                {permission.inUse ? (
                                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Check className="h-4 w-4 text-emerald-600" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <X className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${moduleColors[permission.form as ModuleKey]} border`}>{permission.form}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {permission.createdAt}
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
                                  <DropdownMenuItem className="hover:bg-blue-50">
                                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                    Ver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="hover:bg-emerald-50">
                                    <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {filteredPermissions.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron permisos</h3>
                        <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda.</p>
                        <Button
                          onClick={() => {
                            setSearchTerm("")
                            setSelectedType("all")
                            setShowActiveOnly(false)
                          }}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
  )
}
