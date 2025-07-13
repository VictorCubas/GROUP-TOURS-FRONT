import nisseiLogo from '@/assets/nissei-logo-oficial.jpg';
import CartContainer from './CartContainer';
import FavoritosContainer from './FavoritosContainer';
import AuthContainer from './AuthContainer';
import BuscadorContainer from './BuscadorContainer';
import MenuCustom from './MenuCustom';


const CustomHeader = () => {
  

  return (
    <>
      <header className='bg-white flex w-full mt-6 h-22 px-16'>
        <div className='w-3/12 flex items-center'>
          <img className='w-full object-cover' src={nisseiLogo} alt="Nissei Logo" />
        </div>

        <BuscadorContainer />
        <div className='flex items-center gap-x-6 ml-3 w-3/12'>
          <FavoritosContainer />        
          <CartContainer />
          <AuthContainer />
        </div>

      </header>
      <MenuCustom />
    </>
  )
}

export default CustomHeader