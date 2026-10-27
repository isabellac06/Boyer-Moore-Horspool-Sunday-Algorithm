import { useEffect, useMemo, useState } from 'react'
import { BoyerMooreHorspoolSunday } from './algoritmo/BoyerMooreHorspoolSunday.js'
import { leerArchivo, contarNoAscii } from './utils/archivoTexto.js'
import { generarPDF } from './utils/generadorPDF.js'
import PanelDatos from './components/PanelDatos.jsx'
import Estadisticas from './components/Estadisticas.jsx'
import Controles from './components/Controles.jsx'
import Tablero from './components/Tablero.jsx'
import Explicacion from './components/Explicacion.jsx'
import TablaSaltos from './components/TablaSaltos.jsx'
import TextoResaltado from './components/TextoResaltado.jsx'

const TEXTO_EJEMPLO = 'ONCE CODE RUNS'
const PATRON_EJEMPLO = 'CODE'

export default function App() {
  // ---------- Estado ----------
  const [texto, setTexto] = useState(TEXTO_EJEMPLO)
  const [nombreArchivo, setNombreArchivo] = useState('ejemplo.txt')
  const [patron, setPatron] = useState(PATRON_EJEMPLO)
  const [pasoActual, setPasoActual] = useState(0)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [velocidad, setVelocidad] = useState(1000) // milisegundos entre pasos
  const [mensaje, setMensaje] = useState(null) // { tipo: 'error' | 'aviso', texto }

  // ---------- Ejecutar el algoritmo cada vez que cambian el texto o el patrón ----------
  const { algoritmo, resultado, problema } = useMemo(() => {
    if (patron.length === 0) return { problema: 'Escribe un patrón para empezar.' }
    if (patron.length > texto.length) {
      return { problema: `El patrón (${patron.length} caracteres) es más largo que el texto (${texto.length}).` }
    }
    const algoritmo = new BoyerMooreHorspoolSunday(patron)
    return { algoritmo, resultado: algoritmo.buscar(texto) }
  }, [texto, patron])

  const totalPasos = resultado ? resultado.pasos.length : 0
  const paso = resultado ? resultado.pasos[pasoActual] : null

  // Al cambiar la búsqueda, volvemos al primer intento
  useEffect(() => {
    setPasoActual(0)
    setReproduciendo(false)
  }, [texto, patron])

  // ---------- Reproducción automática ----------
  useEffect(() => {
    if (!reproduciendo) return
    const temporizador = setInterval(() => {
      setPasoActual((p) => Math.min(p + 1, totalPasos - 1))
    }, velocidad)
    return () => clearInterval(temporizador)
  }, [reproduciendo, velocidad, totalPasos])

  // Cuando llega al último intento, se detiene
  useEffect(() => {
    if (pasoActual >= totalPasos - 1) setReproduciendo(false)
  }, [pasoActual, totalPasos])

  // ---------- Atajos de teclado: flechas izquierda y derecha ----------
  useEffect(() => {
    const alPresionar = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') irA(pasoActual + 1)
      if (e.key === 'ArrowLeft') irA(pasoActual - 1)
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  })

  function irA(indice) {
    setReproduciendo(false)
    setPasoActual(Math.max(0, Math.min(indice, totalPasos - 1)))
  }

  // ---------- Acciones ----------
  async function abrirArchivo(archivo) {
    try {
      const contenido = await leerArchivo(archivo)
      const noAscii = contarNoAscii(contenido)
      setTexto(contenido)
      setNombreArchivo(archivo.name)
      setMensaje(
        noAscii > 0
          ? { tipo: 'aviso', texto: `El archivo tiene ${noAscii} caracteres que no son ASCII (tildes, ñ...). Se buscan igual.` }
          : null
      )
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    }
  }

  function usarEjemplo() {
    setTexto(TEXTO_EJEMPLO)
    setNombreArchivo('ejemplo.txt')
    setPatron(PATRON_EJEMPLO)
    setMensaje(null)
  }

  function descargarPDF() {
    generarPDF({ texto, patron, posiciones: resultado.posiciones, nombreArchivo })
  }

  // ---------- Vista ----------
  return (
    <div className="pagina">
      <header className="encabezado">
        <span className="etiqueta">Algoritmo de búsqueda de patrones · Quick Search, 1990</span>
        <h1>
          Boyer-Moore-Horspool-<em>Sunday</em>
        </h1>
        <p>
          Busca un patrón dentro de un texto saltando según el carácter que está justo después de la ventana,{' '}
          <code>T[i + m]</code>. Abre un archivo, escribe un patrón y sigue el algoritmo paso a paso.
        </p>
      </header>

      <PanelDatos
        nombreArchivo={nombreArchivo}
        largoTexto={texto.length}
        patron={patron}
        onPatron={setPatron}
        onArchivo={abrirArchivo}
        onEjemplo={usarEjemplo}
        onPDF={descargarPDF}
        puedePDF={Boolean(resultado)}
      />

      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
      {problema && <div className="mensaje error">{problema}</div>}

      {resultado && (
        <>
          <Estadisticas resultado={resultado} n={texto.length} m={patron.length} />

          <section className="tarjeta">
            <div className="tarjeta-titulo">
              <h2>Simulador paso a paso</h2>
              <span className="pista">Usa las flechas ← → del teclado</span>
            </div>
            <Controles
              pasoActual={pasoActual}
              total={totalPasos}
              reproduciendo={reproduciendo}
              velocidad={velocidad}
              onIrA={irA}
              onReproducir={() => {
                if (pasoActual >= totalPasos - 1) setPasoActual(0)
                setReproduciendo(!reproduciendo)
              }}
              onVelocidad={setVelocidad}
            />
            <Tablero texto={texto} patron={patron} paso={paso} />
            <div className="dos-columnas">
              <Explicacion paso={paso} patron={patron} texto={texto} resultado={resultado} />
              <TablaSaltos algoritmo={algoritmo} caracterUsado={paso.siguiente} />
            </div>
          </section>

          <TextoResaltado
            texto={texto}
            patron={patron}
            posiciones={resultado.posiciones}
            onVerPosicion={(pos) => irA(resultado.pasos.findIndex((p) => p.inicio === pos))}
          />
        </>
      )}

      <footer className="pie">
        Proyecto de Estructuras de Datos · Isabella Cobos Lizarazo y Jason Andrés Vázquez
      </footer>
    </div>
  )
}
