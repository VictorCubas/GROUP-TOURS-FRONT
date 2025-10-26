/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query';
import { descargarComprobanteById, descargarComprobantePDF, pagarSenia } from '../utils/httpReservas';

export function useDescargarPDF() {
    return useMutation({
        mutationFn: (id: number | string) => descargarComprobantePDF(id),
    });
}



export function useDescargarComprobante() {
  return useMutation({
    mutationFn: async (comprobanteId: number | string) => {
      await descargarComprobanteById(comprobanteId);
    },
    onSuccess: (data) => {
      console.log('✅ Comprobante generado y PDF descargado:', data);
      // Ejemplo: toast.success('Comprobante generado correctamente');
    },
    onError: (error) => {
      console.error('❌ Error al generar o descargar el comprobante:', error);
      // toast.error('No se pudo generar el comprobante');
    },
  });
}


export function usePagarSenia() {
  return useMutation({
    mutationFn: async ({ reservaId, payload }: { reservaId: number | string; payload: any }) => {
      const data = await pagarSenia(reservaId, payload);
      return data;
    },
  });
}