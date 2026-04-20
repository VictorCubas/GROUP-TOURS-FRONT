/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";

export const fetchData = async (page: number, page_size: number = 10, filtros: any) => {
  let url = `/paquete/salidas/?page=${page}&page_size=${page_size}`;

  if (filtros.busqueda) {
    url += `&busqueda=${filtros.busqueda}`;
  }

  if (filtros.fecha_desde) {
    url += `&fecha_salida_desde=${filtros.fecha_desde}`;
  }

  if (filtros.fecha_hasta) {
    url += `&fecha_salida_hasta=${filtros.fecha_hasta}`;
  }

  if (filtros.paquete_id) {
    url += `&paquete_id=${filtros.paquete_id}`;
  }

  url += `&activo=${filtros.activo}`;

  try {
    const resp = await axiosInstance.get(url);
    if (resp?.data?.results) {
      return resp?.data ?? null;
    }
  } catch (error) {
    console.log(error);
  }
};

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/paquete/salidas/resumen/`);
  return resp?.data;
}

export async function nuevoDataFetch(data: any) {
  const resp = await axiosInstance.post(`/paquete/salidas/`, data);
  return resp.data;
}

export async function guardarDataEditado({ data, id }: { data: any; id: number | string }) {
  const resp = await axiosInstance.patch(`/paquete/salidas/${id}/`, data);
  return resp.data;
}

export async function desactivarSalida(id: number | string) {
  const resp = await axiosInstance.delete(`/paquete/salidas/${id}/`);
  return resp.data;
}

interface FetchEventParams {
  id: string | number;
  signal?: AbortSignal;
}

export async function fetchSalidaDetalle({ id, signal }: FetchEventParams) {
  const resp = await axiosInstance.get(`/paquete/salidas/${id}/`, { signal });
  return resp?.data;
}

export async function fetchPasajerosSalida({ id, signal }: FetchEventParams) {
  const resp = await axiosInstance.get(`/paquete/salidas/${id}/pasajeros/`, { signal });

  return resp?.data;
}

export async function exportarPasajerosExcel(id: number | string) {
  const response = await axiosInstance.get(`/paquete/salidas/${id}/pasajeros/exportar-excel/`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const contentDisposition = response.headers['content-disposition'];
  let fileName = `pasajeros_${id}_${new Date().toISOString().split('T')[0]}.xlsx`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match?.[1]) fileName = match[1].replace(/['"]/g, '');
  }

  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
