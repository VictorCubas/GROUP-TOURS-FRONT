import { Menu, ShoppingBag } from "lucide-react"
import { AiOutlineThunderbolt } from "react-icons/ai";


const MenuCustom = () => {
  return (
    <section className="w-full bg-amber-400 text-gray-800 h-12 flex items-center
            justify-between font-medium px-18">
        <div className="flex items-center justify-between w-2/6">
          <div className="flex items-center">
            <Menu className="h-6 w-6 font-extrabold cursor-pointer"/>
            <span className="pl-2 cursor-pointer"> Categorías</span>
          </div>
          <div className="flex items-center">
            <AiOutlineThunderbolt className="h-5 w-5"/>
            <span className="pl-2"> Ofertas del día</span>
          </div>
        </div>
        <div className="flex items-center">
          <ShoppingBag className="h-5 w-5"/>
          <span className="pl-2">Promociones</span>
        </div>
    </section>
  )
}

export default MenuCustom