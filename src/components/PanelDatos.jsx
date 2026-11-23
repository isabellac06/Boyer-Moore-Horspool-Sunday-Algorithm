import { useRef } from 'react'

/** Panel lateral: patrón, texto (escrito o desde un .txt) y descarga del PDF. */
export default function PanelDatos({ texto, nombreArchivo, patron, onTexto, onPatron, onArchivo, onEjemplo, onPDF, puedePDF }) {
  const selectorArchivo = useRef(null)

  return (
    <section className="tarjeta panel-datos">
      <div className="campo">
        <label className="etiqueta" htmlFor="patron">
          Patrón a buscar
        </label>
        <input
          id="patron"
          className="entrada-patron"
          value={patron}
          onChange={(e) => onPatron(e.target.value)}
          placeholder="Escribe el patrón"
          spellCheck={false}
        />
        <span className="detalle">La búsqueda se actualiza mientras escribes</span>
      </div>
      <div className="campo">
        <label className="etiqueta" htmlFor="texto">
          Texto donde buscar
        </label>
        <textarea
          id="texto"
          className="entrada-texto"
          value={texto}
          onChange={(e) => onTexto(e.target.value)}
          placeholder="Escribe o pega aquí tu texto…"
          rows={6}
          spellCheck={false}
        />
        <div className="fila fila-texto">
          <button className="boton" onClick={() => selectorArchivo.current.click()}>
            Abrir archivo .txt
          </button>
          <input
            ref={selectorArchivo}
            type="file"
            accept=".txt,text/plain"
            hidden
            onChange={(e) => {
              if (e.target.files[0]) onArchivo(e.target.files[0])
              e.target.value = '' // permite volver a escoger el mismo archivo
            }}
          />
          <button className="boton suave" onClick={onEjemplo}>
            Usar ejemplo
          </button>
          <span className="detalle">
            {nombreArchivo ? `Archivo: ${nombreArchivo}` : 'Texto escrito'} · {texto.length.toLocaleString()} caracteres
          </span>
        </div>
      </div>

      <div className="campo">
        <span className="etiqueta">Resultado en PDF</span>
        <button className="boton principal" onClick={onPDF} disabled={!puedePDF}>
          Descargar PDF resaltado
        </button>
        <span className="detalle">El texto con cada aparición del patrón resaltada</span>
      </div>
    </section>
  )
}
