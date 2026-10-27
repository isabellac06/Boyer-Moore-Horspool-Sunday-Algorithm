import { useEffect, useState } from 'react'

const TERMINOS = [
  ['T', 'El texto donde se busca. T[5] es el carácter en la posición 5 (se empieza a contar desde 0).'],
  ['P', 'El patrón: la palabra o frase que queremos encontrar dentro de T.'],
  ['n', 'Largo del texto (cuántos caracteres tiene T).'],
  ['m', 'Largo del patrón (cuántos caracteres tiene P).'],
  ['i', 'Posición del texto donde empieza la ventana, es decir, donde se coloca el patrón en el intento actual.'],
  ['j', 'Posición dentro del patrón donde se encontró el primer fallo. También es la cantidad de letras que sí coincidieron.'],
  ['T[i + m]', 'El carácter que está justo después de la ventana. Es la clave de Sunday: con él se decide cuánto saltar.'],
  ['Ventana', 'El tramo del texto, de tamaño m, que se compara con el patrón en cada intento.'],
  ['Salto', 'Cuántas posiciones se desplaza la ventana al terminar un intento. Se lee en la tabla de saltos.'],
  ['Tabla de saltos', 'Para cada carácter del patrón: salto = m − (su última posición en P). Un carácter que no está en el patrón da m + 1.'],
]

/** Botón flotante "?" que abre un panel con el significado de las siglas. */
export default function Glosario() {
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (!abierto) return
    const alPresionar = (e) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto])

  return (
    <>
      <button className="glosario-boton" onClick={() => setAbierto(true)} aria-label="Abrir glosario de siglas">
        <span aria-hidden="true">?</span> Siglas
      </button>

      {abierto && (
        <div className="glosario-fondo" onClick={() => setAbierto(false)}>
          <div
            className="glosario-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="glosario-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glosario-cabecera">
              <h2 id="glosario-titulo">¿Qué significan las siglas?</h2>
              <button className="glosario-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar">
                ×
              </button>
            </div>
            <dl>
              {TERMINOS.map(([sigla, texto]) => (
                <div key={sigla} className="glosario-item">
                  <dt>{sigla}</dt>
                  <dd>{texto}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </>
  )
}
