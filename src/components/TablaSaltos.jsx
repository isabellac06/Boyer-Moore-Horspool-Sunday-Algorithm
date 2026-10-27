import { visible } from '../utils/caracteres.js'

/** Muestra la tabla de saltos y resalta la casilla que se usó en el intento actual. */
export default function TablaSaltos({ algoritmo, caracterUsado }) {
  const filas = [...algoritmo.tablaSaltos.entries()] // [[caracter, salto], ...]
  const usaOtros = caracterUsado !== null && !algoritmo.tablaSaltos.has(caracterUsado)

  return (
    <div className="tabla-saltos">
      <span className="etiqueta">Tabla de saltos</span>
      <div className="fichas">
        {filas.map(([caracter, salto]) => (
          <Ficha key={caracter} clave={visible(caracter)} valor={salto} activa={caracter === caracterUsado} />
        ))}
        <Ficha clave="otros" valor={algoritmo.m + 1} activa={usaOtros} />
      </div>
      <pre className="formula">
        salto[c]     = m − (última posición de c en P){'\n'}
        salto[otros] = m + 1 = {algoritmo.m + 1}
      </pre>
    </div>
  )
}

function Ficha({ clave, valor, activa }) {
  return (
    <div className={`ficha ${activa ? 'activa' : ''}`}>
      <span className="ficha-clave">{clave}</span>
      <span className="ficha-valor">{valor}</span>
    </div>
  )
}
