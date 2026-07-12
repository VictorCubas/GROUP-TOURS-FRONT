/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext } from 'react';
import type { BloqueoData, HotelReserva } from '@/types/reservas';

// 🧠 Context para compartir datos del modal
interface BloqueoHabitacionContextType {
  bloqueoData: BloqueoData[];
  montoTotalBloqueos: number;
  hotelesPorSalida: HotelReserva[];
}

export const BloqueoHabitacionContext = createContext<BloqueoHabitacionContextType | undefined>(undefined);

// Hook personalizado
export const useBloqueoHabitacionContext = () => {
  const context = useContext(BloqueoHabitacionContext);
  if (!context) {
    throw new Error('useBloqueoHabitacionContext debe usarse dentro de <BloqueoHabitacionProvider>');
  }
  return context;
};
