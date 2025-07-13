import {
  ShoppingCart,
} from "lucide-react"
import { useState } from "react";

const CartContainer = () => {
    const [onMouseOver, setMouseOver] = useState(false);
    let cssClassName = `w-10 h-10 cursor-pointer hover:text-amber-500`;

    if(onMouseOver){
        cssClassName += ' text-amber-500';
    }
    else{
        cssClassName += ' text-gray-600';
    }
    
  return (
    <div className="relative">
        <ShoppingCart className={cssClassName} />
        <span className='absolute -bottom-1 -right-2 bg-amber-500 text-gray-800 
        text-xs rounded-full w-5 h-5 flex items-center justify-center cursor-pointer'
        onMouseEnter={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}>
        0
        </span>
    </div>
  )
}

export default CartContainer