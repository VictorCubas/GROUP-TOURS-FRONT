/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AlertCircle, Check, Eye, Shield } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";

const ResumenCardsDinamico: React.FC<ResumenCardsProps> = 
              ({resumen, isFetchingResumen, isErrorResumen}) => {
  const [isVisible, setIsVisible] = useState(false)
  const delay = 200;

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  let stats: StatItem[] = [];

  console.log('resumen: ', resumen)

  if(!isFetchingResumen && resumen && resumen.length > 0){
    stats = [
      { title: resumen[0].texto, value: parseInt(resumen[0].valor), icon: Shield, color: "border-blue-200 bg-blue-50", iconColor: "text-blue-500" },
      {
        title: resumen[1].texto,
        value: parseInt(resumen[1].valor),
        icon: Check,
        color: "border-emerald-200 bg-emerald-50",
        iconColor: "text-emerald-500",
      },
      { title: resumen[2].texto, value: parseInt(resumen[2].valor), icon: Eye, color: "border-purple-200 bg-purple-50", iconColor: "text-purple-500" },
      { title: resumen[3].texto, value: parseInt(resumen[3].valor), icon: AlertCircle, color: "border-red-200 bg-red-50", iconColor: "text-red-500" },
    ]
  }

  return (
    <>
      {isFetchingResumen &&
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"> 
            {[1,2,3,4].map((_,i)=>(
              <Card 
                key={i} 
                className={`p-6 transition-all duration-300 min-h-[150px] flex flex-col justify-between 
                ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    {/* Placeholder para el título */}
                    <Skeleton className="h-4 w-24" /> 
                    {/* Placeholder para el número */}
                    <Skeleton className="h-8 w-16" />  
                  </div>
                  {/* Placeholder para el ícono */}
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </Card>
            ))}
          </div>

      }
      {!isFetchingResumen && isErrorResumen &&
        <div className="h-32 flex items-center justify-center w-full">
          <p>No se pudieron recuperar los datos</p>
        </div>
      }
      {!isFetchingResumen && !isErrorResumen &&
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-500 cursor-pointer
                 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}
          style={{ animationDelay: `${delay}ms` }}>

          {stats.map((stat, index) => (
            <AnimatedStatCard key={index} stat={stat} />
          ))}
        </div>
      }
    </>
  )
}
export default ResumenCardsDinamico;

// Subcomponente para manejar la animación del número
const AnimatedStatCard: React.FC<{stat: StatItem}> = ({ stat }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let current = 0;
    const target = stat.value;
    const increment = Math.ceil(target / 80); // velocidad (40 steps aprox)

    const counter = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(target);
        clearInterval(counter);
      } else {
        setDisplayValue(current);
      }
    }, 100); // intervalo de actualización

    return () => clearInterval(counter);
  }, [stat.value]);

  return (
    <Card className={`border ${stat.color} hover:shadow-md transition-shadow hover:-translate-y-1`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-semibold text-gray-900 transition-all duration-300">
              {displayValue.toLocaleString()} {/* con separador de miles */}
            </p>
          </div>
          <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
        </div>
      </CardContent>
    </Card>
  )
}


// Tipados
interface ResumenCardsProps{
  resumen: ResumenItem[];
  isFetchingResumen: boolean
  isErrorResumen: boolean
}

export interface ResumenItem {
    texto: string;
    valor: string;
}

interface StatItem {
  title: string;
  value: number;
  icon: any;
  color: string;
  iconColor: string;
}
