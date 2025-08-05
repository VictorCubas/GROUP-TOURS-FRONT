export interface Permiso {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'C' | 'R' | 'U' | 'D' | 'E';
  modulo: string;
  fechaCreacion: string;
  activo: boolean;
  en_uso: boolean;
}


export interface RespuestaPaginada {
  totalItems: number;
  next: string | null;
  previous: string | null;
  totalPages: number;
  pageSize: number;
}