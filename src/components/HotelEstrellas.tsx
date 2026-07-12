import { Star } from "lucide-react";
import type { FC } from "react";

interface HotelEstrellasProps{
    rating: number
}

export const HotelEstrellas: FC<HotelEstrellasProps> = ({rating}) => {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, index) => (
                <Star
                key={index}
                className={`h-3 w-3 ${
                    index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
                />
            ))}
            <span className="ml-1 text-sm text-gray-600">({rating})</span>
        </div>
    );
  };