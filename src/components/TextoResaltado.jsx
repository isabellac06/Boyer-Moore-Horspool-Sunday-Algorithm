import { useMemo } from 'react'

const MAX_FICHAS = 300 // para no llenar la pantalla con miles de posiciones

/** Muestra el texto completo con cada aparición del patrón resaltada. */
export default function TextoResaltado({ texto, patron, posiciones, onVerPosicion }) {
  // Partimos el texto en trozos "normales" y "resaltados"
  const trozos = useMemo(() => {
    const marcados = new Array(texto.length).fill(false)
    for (const p of posiciones) {
      for (let k = p; k < p + patron.length; k++) marcados[k] = true
    }
    const lista = []
    let inicio = 0
    for (let k = 1; k <= texto.length; k++) {
      if (k === texto.length || marcados[k] !== marcados[inicio]) {
        lista.push({ texto: texto.slice(inicio, k), resaltado: marcados[inicio] })
        inicio = k
      }
    }
    return lista
  }, [texto, patron, posiciones])

  return (
    <section className="tarjeta">
      <div className="tarjeta-titulo">
        <h2>Resultado: dónde se encontró el patrón</h2>
        <span className="pista">Toca una posición para verla en el simulador</span>
      </div>

      <p className="detalle">
        Cada círculo verde es una posición del texto donde empieza una aparición del patrón (se cuenta desde 0). Abajo
        se ve el texto completo con esas apariciones resaltadas en amarillo.
      </p>

      <div className="posiciones">
        {posiciones.length === 0 && <span className="detalle">El patrón no aparece en el texto.</span>}
        {posiciones.slice(0, MAX_FICHAS).map((p) => (
          <button key={p} className="chip" onClick={() => onVerPosicion(p)}>
            {p}
          </button>
        ))}
        {posiciones.length > MAX_FICHAS && (
          <span className="detalle">y {posiciones.length - MAX_FICHAS} más…</span>
        )}
      </div>

      <pre className="texto-completo">
        {trozos.map((t, k) => (t.resaltado ? <mark key={k}>{t.texto}</mark> : <span key={k}>{t.texto}</span>))}
      </pre>
    </section>
  )
}
