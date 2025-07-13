
const BuscadorContainer = () => {
  return (
    <>
        <div className='flex items-center gap-x-1 w-full px-28 mx-8'>
        <input className='w-full h-10 px-3 border  border-gray-300 rounded-lg p-3 focus:outline focus:outline-gray-500' type="search" name='searcch' id="search" placeholder='Buscar en todo la tienda' />
        <button className='w-26 h-10 flex items-center justify-center font-medium px-8 bg-amber-400 text-xl cursor-pointer'
            title='Buscar artículo'>Buscar</button>
        </div>
    </>
  )
}

export default BuscadorContainer