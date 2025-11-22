// Tipos para el Reporte de Movimientos de Caja

export interface MovimientoCajaListado {
  id: number;
  numero_movimiento: string;
  fecha_hora: string;
  caja_nombre: string;
  caja_numero: number;
  tipo_movimiento: 'ingreso' | 'egreso';
  tipo_movimiento_display: string;
  concepto: string;
  concepto_display: string;
  descripcion: string;
  monto: number;                  // Valor RAW en moneda original
  moneda_original: string;        // ✅ NUEVO: "PYG", "USD", etc.
  monto_gs: number;               // SIEMPRE en Guaraníes (convertido)
  monto_usd: number | null;       // SIEMPRE en USD (convertido)
  metodo_pago: string;
  metodo_pago_display: string;
  referencia: string;
  usuario_registro: string;
  comprobante_numero: string;
}

export interface ResumenMovimientos {
  total_registros: number;
  total_ingresos_gs: number;
  total_egresos_gs: number;
  balance_gs: number;
  total_ingresos_usd: number;
  total_egresos_usd: number;
  balance_usd: number;
  ingresos_count: number;
  egresos_count: number;
}

export interface FiltrosMovimientos {
  fecha_desde: string;
  fecha_hasta: string;
  caja_id: number | null;
  tipo_movimiento: 'ingreso' | 'egreso' | 'todas';
  metodo_pago?: string;
  concepto?: string;
  busqueda?: string;
}

export interface RespuestaReporteMovimientos {
  success: boolean;
  filtros_aplicados: FiltrosMovimientos;
  resumen: ResumenMovimientos;
  data: {
    totalItems: number;
    pageSize: number;
    totalPages: number;
    currentPage: number;
    results: MovimientoCajaListado[];
  };
}

export interface RespuestaPaginada {
  next: string | null;
  previous: string | null;
  totalItems: number;
  totalPages: number;
  pageSize: number;
}

