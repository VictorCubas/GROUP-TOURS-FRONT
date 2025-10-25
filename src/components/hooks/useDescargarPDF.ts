import { useMutation } from '@tanstack/react-query';
import { descargarComprobanteDesdeUrl, descargarComprobantePDF, generarComprobante } from '../utils/httpReservas';

export function useDescargarPDF() {
    return useMutation({
        mutationFn: (id: number | string) => descargarComprobantePDF(id),
    });
}



export function useGenerarYDescargarComprobante() {
  return useMutation({
    mutationFn: async (reservaId: number | string) => {
      const data = await generarComprobante(reservaId);

      if (data.pdf_url) {
        await descargarComprobanteDesdeUrl(data.pdf_url, `comprobante-${data.comprobante_id}.pdf`);
      }

      return data;
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