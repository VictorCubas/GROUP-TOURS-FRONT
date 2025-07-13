import classes from './PromocionesBar.module.css';

const PromocionesBar = () => {
  return (
    <div className={`${classes.text} text-white font-bold text-center p-2 text-2xl`}>
        <p>
            Hasta el 30 de Junio, hasta 40% de reintegro con ueno
        </p>
    </div>
  )
}

export default PromocionesBar