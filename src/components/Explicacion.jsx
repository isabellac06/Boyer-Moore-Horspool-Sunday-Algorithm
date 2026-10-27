import { nombre } from '../utils/caracteres.js'

/** Explica en palabras qué pasó en el intento actual. */
export default function Explicacion({ paso, patron, texto, resultado }) {
  const m = patron.length
  const i = paso.inicio
  const j = paso.coincidencias // posición del fallo (si lo hubo)
  const ultimaAparicion = paso.siguiente !== null ? patron.lastIndexOf(paso.siguiente) : -1
  const terminaAqui = paso.siguiente === null || i + paso.salto > texto.length - m

  return (
    <div className="explicacion" key={paso.numero}>
      <span className="etiqueta">¿Qué pasa en este intento?</span>

      <p>
        <b>Intento {paso.numero}.</b> La ventana empieza en <code>i = {i}</code> y cubre{' '}
        <code>T[{i} … {i + m - 1}]</code>.
      </p>

      {paso.encontrado ? (
        <p className="ok">
          ✔ Las {m} letras coinciden: <b>patrón encontrado en la posición {i}</b>.
        </p>
      ) : (
        <p>
          Se compara de izquierda a derecha: {j} {j === 1 ? 'coincidencia' : 'coincidencias'} y{' '}
          <span className="error">fallo</span> en <code>P[{j}] = {nombre(patron[j])}</code> contra{' '}
          <code>T[{i + j}] = {nombre(texto[i + j])}</code>.
        </p>
      )}

      {paso.siguiente === null ? (
        <p>No hay ningún carácter después de la ventana, así que la búsqueda termina.</p>
      ) : (
        <p>
          Sunday mira el carácter <b>siguiente</b> a la ventana:{' '}
          <code className="clave">T[{i + m}] = {nombre(paso.siguiente)}</code>.{' '}
          {ultimaAparicion >= 0 ? (
            <>
              Su última aparición en el patrón es la posición {ultimaAparicion}, entonces{' '}
              <b>salto = {m} − {ultimaAparicion} = {paso.salto}</b>.
            </>
          ) : (
            <>
              No está en el patrón, así que el patrón pasa por encima de él:{' '}
              <b>salto = m + 1 = {paso.salto}</b>.
            </>
          )}
        </p>
      )}

      {terminaAqui && (
        <p className="resumen">
          Fin de la búsqueda: {resultado.posiciones.length} coincidencia(s) en {resultado.pasos.length} intentos.
          La fuerza bruta habría necesitado {texto.length - m + 1}.
        </p>
      )}
    </div>
  )
}
