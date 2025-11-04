/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query';
import { asignarPasajero, descargarComprobanteById, descargarComprobantePDF, descargarFacturaGlobalById, descargarFacturaIndividualById, descargaVoucherById, pagarSenia, pagoTotal, registrarPago } from '../utils/httpReservas';

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

export function useDescargarFacturaGlobal() {
  return useMutation({
    // mutationFn: async (id: number | string) => {
    mutationFn: async ({id, params}: {id: number | string, params: string | null}) => {
      await descargarFacturaGlobalById(id, params);
    },
    onSuccess: (data) => {
      console.log('✅ Factura generado y PDF descargado:', data);
      // Ejemplo: toast.success('Comprobante generado correctamente');
    },
    onError: (error) => {
      console.error('❌ Error al generar o descargar la factura:', error);
      // toast.error('No se pudo generar el comprobante');
    },
  });
}

export function useDescargarFacturaIndividual() {
  return useMutation({
    mutationFn: async ({ reservaId, params }: { reservaId: number | string; params: string }) => {
      await descargarFacturaIndividualById(reservaId, params);
    },
    onSuccess: (data) => {
      console.log('✅ Factura generada y PDF descargada:', data);
      // Ejemplo: toast.success('Comprobante generado correctamente');
    },
    onError: (error) => {
      console.error('❌ Error al generar o descargar la factura:', error);
      // toast.error('No se pudo generar el comprobante');
    },
  });
}

export function useDescargarVoucher() {
  return useMutation({
    mutationFn: async (comprobanteId: number | string) => {
      await descargaVoucherById(comprobanteId);
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

export function usePagoTotal() {
  return useMutation({
    mutationFn: async ({ reservaId, payload }: { reservaId: number | string; payload: any }) => {
      const data = await pagoTotal(reservaId, payload);
      return data;
    },
  });
}

export function useRegistrarPagoParcial() {
  return useMutation({
    mutationFn: async ({ reservaId, payload }: { reservaId: number | string; payload: any }) => {
      const data = await registrarPago(reservaId, payload);
      return data;
    },
  });
}

export function useAsignarPasajero() {
  return useMutation({
    mutationFn: async ({ pasajeroId, payload }: { pasajeroId: number | string; payload: any }) => {
      const data = await asignarPasajero(pasajeroId, payload);
      return data;
    },
  });
}