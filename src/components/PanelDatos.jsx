import { useRef } from 'react'

/** Escoger el archivo .txt, escribir el patrón y descargar el PDF. */
export default function PanelDatos({ nombreArchivo, largoTexto, patron, onPatron, onArchivo, onEjemplo, onPDF, puedePDF }) {
  const selectorArchivo = useRef(null)

  return (
    <section className="tarjeta panel-datos">
      <div className="campo">
        <span className="etiqueta">1 · Archivo de texto</span>
        <div className="fila">
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
        </div>
        <span className="detalle">
          {nombreArchivo} · {largoTexto.toLocaleString()} caracteres
        </span>
      </div>

      <div className="campo">
        <label className="etiqueta" htmlFor="patron">
          2 · Patrón a buscar
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
        <span className="etiqueta">3 · Resultado en PDF</span>
        <button className="boton principal" onClick={onPDF} disabled={!puedePDF}>
          Descargar PDF resaltado
        </button>
        <span className="detalle">El texto con cada aparición del patrón resaltada</span>
      </div>
    </section>
  )
}
