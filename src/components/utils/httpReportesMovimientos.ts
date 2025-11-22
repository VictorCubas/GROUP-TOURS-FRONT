/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
import type { RespuestaReporteMovimientos } from "@/types/reporteMovimientos";

interface FiltrosReporteMovimientos {
  activo?: boolean | null;
  fecha_desde?: string;
  fecha_hasta?: string;
  caja_id?: number | null;
  tipo_movimiento?: string;
  metodo_pago?: string;
  concepto?: string;
  busqueda?: string;
}

/**
 * Obtiene el reporte de movimientos de caja
 * NOTA: fecha_desde y fecha_hasta son OBLIGATORIOS en el backend
 */
export const fetchReporteMovimientos = async (
  page: number = 1,
  pageSize: number = 20,
  filtros: FiltrosReporteMovimientos = {}
): Promise<RespuestaReporteMovimientos> => {
  try {
    // Validar que las fechas estén presentes
    if (!filtros.fecha_desde || !filtros.fecha_hasta) {
      throw new Error('Las fechas desde y hasta son obligatorias');
    }

    const params: Record<string, any> = {
      page,
      page_size: pageSize,
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
    };

    // Agregar filtros opcionales solo si tienen valor
    if (filtros.caja_id) params.caja_id = filtros.caja_id;
    if (filtros.tipo_movimiento && filtros.tipo_movimiento !== 'todas') {
      params.tipo_movimiento = filtros.tipo_movimiento;
    }
    if (filtros.metodo_pago) params.metodo_pago = filtros.metodo_pago;
    if (filtros.concepto) params.concepto = filtros.concepto;
    if (filtros.busqueda) params.busqueda = filtros.busqueda;

    const response = await axiosInstance.get('/dashboard/reportes/movimientos-cajas/', {
      params
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching reporte movimientos:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de cajas disponibles para el filtro
 */
export const fetchCajasParaFiltro = async () => {
  try {
    const response = await axiosInstance.get('/arqueo-caja/cajas/', {
      params: {
        activo: true,
        page_size: 100 // Traer todas las cajas activas
      }
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching cajas:', error);
    return [];
  }
};

/**
 * Exportar reporte a PDF (cuando esté implementado)
 */
export const exportarReporteMovimientosPDF = async (filtros: FiltrosReporteMovimientos) => {
  try {
    const response = await axiosInstance.get('/dashboard/reportes/movimientos-cajas/', {
      params: {
        ...filtros,
        export: 'pdf'
      },
      responseType: 'blob'
    });

    // Crear URL para descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_movimientos_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error exportando PDF:', error);
    throw error;
  }
};

/**
 * Exportar reporte a Excel (cuando esté implementado)
 */
export const exportarReporteMovimientosExcel = async (filtros: FiltrosReporteMovimientos) => {
  try {
    const response = await axiosInstance.get('/dashboard/reportes/movimientos-cajas/', {
      params: {
        ...filtros,
        export: 'excel'
      },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_movimientos_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error exportando Excel:', error);
    throw error;
  }
};

