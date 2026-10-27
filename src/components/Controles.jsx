/** Botones para avanzar, retroceder y reproducir los intentos. */
export default function Controles({ pasoActual, total, reproduciendo, velocidad, onIrA, onReproducir, onVelocidad }) {
  const alInicio = pasoActual === 0
  const alFinal = pasoActual === total - 1

  return (
    <div className="controles">
      <button className="boton suave" onClick={() => onIrA(0)} disabled={alInicio}>
        ⏮ Reiniciar
      </button>
      <button className="boton suave" onClick={() => onIrA(pasoActual - 1)} disabled={alInicio}>
        ◀ Anterior
      </button>
      <button className="boton principal" onClick={() => onIrA(pasoActual + 1)} disabled={alFinal}>
        Siguiente ▶
      </button>
      <button className="boton" onClick={onReproducir} disabled={total < 2}>
        {reproduciendo ? '❚❚ Pausar' : '▶ Reproducir'}
      </button>

      <label className="velocidad">
        Velocidad
        <input
          type="range"
          min="200"
          max="2000"
          step="100"
          // el control va al revés: a la derecha = menos milisegundos = más rápido
          value={2200 - velocidad}
          onChange={(e) => onVelocidad(2200 - Number(e.target.value))}
        />
      </label>

      <span className="contador">
        Intento <b>{pasoActual + 1}</b> de {total}
      </span>
    </div>
  )
}
