/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";

export async function fetchTiposCostoTodos(): Promise<any[]> {
  const resp = await axiosInstance.get(`/paquete/tipos-costo/todos/`);
  return resp?.data ?? [];
}
