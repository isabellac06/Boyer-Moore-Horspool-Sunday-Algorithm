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
import Glosario from './components/Glosario.jsx'
import logoUfps from './utils/img/ufpsLogo.png'

// Ejemplo corto (cabe en pantalla): en 4 intentos se ven saltos de 2, 1 y 6, y una coincidencia.
const TEXTO_EJEMPLO = 'Un perro y un gato'
const PATRON_EJEMPLO = 'perro'

export default function App() {
  // ---------- Estado ----------
  const [texto, setTexto] = useState(TEXTO_EJEMPLO)
  const [nombreArchivo, setNombreArchivo] = useState(null) // null = texto escrito a mano
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
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
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

  // El usuario escribe o pega el texto directamente: ya no viene de un archivo
  function escribirTexto(nuevoTexto) {
    setTexto(nuevoTexto)
    setNombreArchivo(null)
    setMensaje(null)
  }

  function usarEjemplo() {
    setTexto(TEXTO_EJEMPLO)
    setNombreArchivo(null)
    setPatron(PATRON_EJEMPLO)
    setMensaje(null)
  }

  function descargarPDF() {
    generarPDF({ texto, patron, posiciones: resultado.posiciones, nombreArchivo: nombreArchivo ?? 'texto-escrito.txt' })
  }

  // ---------- Vista ----------
  return (
    <div className="pagina">
      <header className="encabezado">
        <img className="logo-ufps" src={logoUfps} alt="Universidad Francisco de Paula Santander" />
        <span className="etiqueta">Algoritmo de búsqueda de patrones · Quick Search, 1990</span>
        <h1>
          Boyer-Moore-Horspool-<em>Sunday</em>
        </h1>
        <p>
          Busca un patrón dentro de un texto saltando según el carácter que está justo después de la ventana,{' '}
          <code>T[i + m]</code>. Escribe un texto (o abre un archivo), escribe un patrón y sigue el algoritmo paso a paso.
        </p>
      </header>

      <PanelDatos
        texto={texto}
        nombreArchivo={nombreArchivo}
        patron={patron}
        onTexto={escribirTexto}
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
        Análisis de algoritmos · Isabella Cobos Lizarazo y Jason Andrés Vásquez Ramirez
      </footer>

      <Glosario />
    </div>
  )
}
