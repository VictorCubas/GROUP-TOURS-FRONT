export interface PaqueteListado {
  id: number;
  codigo: string;
  nombre: string;
  tipo_paquete: string;
  destino_ciudad: string;
  destino_pais: string;
  destino_completo: string;
  distribuidora: string | null;
  precio: number;
  precio_unitario: number;
  sena: number;
  moneda: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  duracion_dias: number;
  cantidad_pasajeros: number;
  cupos_disponibles: number;
  cupos_ocupados: number;
  personalizado: boolean;
  propio: boolean;
  activo: boolean;
  servicios: string;
  reservas_count: number;
  fecha_creacion: string;
}

export interface ResumenPaquetes {
  total_registros: number;
  paquetes_activos: number;
  paquetes_inactivos: number;
  paquetes_personalizados: number;
  precio_promedio: number;
  precio_minimo: number;
  precio_maximo: number;
}

export interface FiltrosPaquetes {
  fecha_desde?: string;
  fecha_hasta?: string;
  fecha_salida_desde?: string;
  fecha_salida_hasta?: string;
  destino_id?: number | null;
  pais_id?: number | null;
  tipo_paquete_id?: number | null;
  estado?: 'activo' | 'inactivo' | 'todos';
  personalizado?: boolean | null;
  propio?: boolean | null;
  distribuidora_id?: number | null;
  busqueda?: string;
  ordenar_por?: string;
  zona_geografica_id?: number | null;
  fecha_salida_proxima?: number | null;
  tiene_cupos_disponibles?: boolean | null;
}

export interface RespuestaReportePaquetes {
  success: boolean;
  filtros_aplicados: FiltrosPaquetes;
  resumen: ResumenPaquetes;
  data: {
    totalItems: number;
    pageSize: number;
    totalPages: number;
    currentPage: number;
    results: PaqueteListado[];
  };
}

export interface RespuestaPaginada {
  next: string | null;
  previous: string | null;
  totalItems: number;
  totalPages: number;
  pageSize: number;
}

