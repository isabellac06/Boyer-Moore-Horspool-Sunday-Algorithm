import { useEffect, useRef } from 'react'
import { visible } from '../utils/caracteres.js'

const CELDA = 40 // ancho de una casilla en píxeles
const PASO = 46 // casilla + espacio entre casillas
const TRAMO = 3000 // en textos largos solo se dibujan 3000 caracteres alrededor de la ventana

/**
 * Dibuja un intento: el texto, la ventana, el patrón (que se desliza),
 * el carácter T[i+m] que decide el salto y dónde queda el patrón después.
 */
export default function Tablero({ texto, patron, paso }) {
  const m = patron.length
  const i = paso.inicio
  const contenedor = useRef(null)

  // Tramo del texto que se dibuja
  const desde = texto.length <= TRAMO ? 0 : Math.max(0, Math.floor((i - 500) / 1000) * 1000)
  const tramo = texto.slice(desde, desde + TRAMO)
  const x = (posicion) => (posicion - desde) * PASO // posición del texto → píxeles

  const haySiguiente = paso.siguiente !== null
  const nuevoInicio = haySiguiente ? i + paso.salto : null
  const cabeDespues = haySiguiente && nuevoInicio + m <= texto.length

  // Mueve el scroll para que la ventana siempre se vea
  useEffect(() => {
    contenedor.current?.scrollTo({ left: x(i) - 3 * PASO, behavior: 'smooth' })
  }, [i, desde]) // eslint-disable-line react-hooks/exhaustive-deps

  // Estado de cada letra del patrón según la comparación
  function estadoLetra(j) {
    if (paso.encontrado || j < paso.coincidencias) return 'coincide'
    if (j === paso.coincidencias) return 'falla'
    return 'sin-comparar'
  }

  return (
    <div className="tablero">
      <div className="rotulos">
        <span className="r-indices" />
        <span className="r-texto">Texto</span>
        <span className="r-patron">Patrón</span>
        <span className="r-marca" />
        <span className="r-salto" />
        <span className="r-siguiente">{cabeDespues ? 'Después' : ''}</span>
      </div>

      <div className="tablero-scroll" ref={contenedor}>
        <div className="lienzo" style={{ width: tramo.length * PASO }}>
          {/* Índices */}
          <div className="renglon r-indices">
            {[...tramo].map((_, k) => (
              <span key={k} className="indice">{desde + k}</span>
            ))}
          </div>

          {/* Texto */}
          <div className="renglon r-texto">
            {[...tramo].map((c, k) => {
              const pos = desde + k
              let clase = 'celda'
              if (pos >= i && pos < i + m) clase += ' en-ventana'
              if (haySiguiente && pos === i + m) clase += ' clave'
              return <span key={k} className={clase}>{visible(c)}</span>
            })}
          </div>

          {/* Patrón: la tira completa se desliza con una transición CSS */}
          <div className="renglon r-patron">
            <div className="tira" style={{ transform: `translateX(${x(i)}px)` }}>
              {[...patron].map((c, j) => (
                <span
                  key={`${paso.numero}-${j}`} // nueva key en cada intento → la animación se repite
                  className={`celda ${estadoLetra(j)}`}
                  style={{ animationDelay: `${350 + j * 90}ms` }}
                >
                  {visible(c)}
                </span>
              ))}
            </div>
          </div>

          {/* Marca debajo de T[i+m] */}
          <div className="renglon r-marca">
            {haySiguiente && (
              <div className="marca" style={{ transform: `translateX(${x(i + m)}px)` }}>
                ▲ T[i+m]
              </div>
            )}
          </div>

          {/* Flecha del salto */}
          <div className="renglon r-salto">
            {haySiguiente && (
              <div className="flecha" style={{ transform: `translateX(${x(i) + CELDA / 2}px)`, width: paso.salto * PASO }}>
                <span>salto = {paso.salto}</span>
              </div>
            )}
          </div>

          {/* Dónde queda el patrón después del salto */}
          <div className="renglon r-siguiente">
            {cabeDespues && (
              <div className="tira fantasma" style={{ transform: `translateX(${x(nuevoInicio)}px)` }}>
                {[...patron].map((c, j) => (
                  <span key={j} className="celda">{visible(c)}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="leyenda">
        <span><i className="muestra en-ventana" /> Ventana</span>
        <span><i className="muestra coincide" /> Coincide</span>
        <span><i className="muestra falla" /> Falla</span>
        <span><i className="muestra clave" /> T[i+m] decide el salto</span>
        <span>· espacio &nbsp; ¶ salto de línea</span>
      </div>
    </div>
  )
}
