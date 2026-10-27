import { jsPDF } from 'jspdf'
import logoUfps from './img/ufpsLogo.png'

/**
 * Crea un PDF con el texto del archivo y resalta (fondo amarillo + subrayado rojo)
 * cada aparición del patrón. Página 1: portada con datos y posiciones; luego el texto.
 */

const MARGEN = 50
const RELLENO = 10 // espacio entre el borde del recuadro de texto y las letras
const TAM_LETRA = 10
const INTERLINEA = 13
const ANCHO_LETRA = TAM_LETRA * 0.6 // en la fuente Courier todas las letras miden lo mismo
const MAX_POSICIONES = 120 // para que la lista no ocupe páginas enteras

// Paleta (la misma de la aplicación)
const ROJO = [226, 0, 26]
const ROJO_OSCURO = [168, 0, 20]
const MORADO = [123, 47, 224]
const TINTA = [31, 21, 53]
const GRIS = [82, 74, 102]
const LAVANDA = [246, 242, 251]
const LINEA = [217, 205, 238]

export async function generarPDF({ texto, patron, posiciones, nombreArchivo }) {
  const logo = await cargarLogo()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const ancho = doc.internal.pageSize.getWidth()
  const alto = doc.internal.pageSize.getHeight()
  const anchoUtil = ancho - 2 * MARGEN
  const limiteInferior = alto - 60
  const columnas = Math.floor((anchoUtil - 2 * RELLENO) / ANCHO_LETRA)

  // 1. Marcamos qué caracteres del texto pertenecen a una coincidencia
  const marcados = new Array(texto.length).fill(false)
  for (const p of posiciones) {
    for (let k = p; k < p + patron.length; k++) marcados[k] = true
  }

  // 2. Banda superior con logo y título
  doc.setFillColor(...ROJO)
  doc.rect(0, 0, ancho, 104, 'F')
  doc.setFillColor(...MORADO)
  doc.rect(0, 104, ancho, 5, 'F')
  if (logo) {
    doc.addImage(logo, 'PNG', MARGEN, 20, 64, 64)
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(2)
    doc.roundedRect(MARGEN, 20, 64, 64, 4, 4, 'S')
  }
  const xTitulo = logo ? MARGEN + 80 : MARGEN
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('UNIVERSIDAD FRANCISCO DE PAULA SANTANDER  ·  ANÁLISIS DE ALGORITMOS', xTitulo, 34)
  doc.setFontSize(19)
  doc.text('Búsqueda con Boyer-Moore-Horspool-Sunday', xTitulo, 58)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Reporte de coincidencias del patrón en el archivo de texto', xTitulo, 76)

  // 3. Tarjetas con los datos de la búsqueda
  let y = 132
  const datos = [
    ['ARCHIVO', recortar(doc, limpiar(nombreArchivo), 118, 'helvetica', 'bold', 11)],
    ['PATRÓN', recortar(doc, `"${limpiar(patron)}"`, 118, 'helvetica', 'bold', 11)],
    ['LARGO DEL TEXTO', `${texto.length} caracteres`],
    ['COINCIDENCIAS', String(posiciones.length)],
  ]
  const separacion = 10
  const anchoTarjeta = (anchoUtil - separacion * (datos.length - 1)) / datos.length
  datos.forEach(([titulo, valor], k) => {
    const x = MARGEN + k * (anchoTarjeta + separacion)
    doc.setFillColor(...LAVANDA)
    doc.setDrawColor(...LINEA)
    doc.setLineWidth(0.8)
    doc.roundedRect(x, y, anchoTarjeta, 48, 6, 6, 'FD')
    doc.setFillColor(...(k === datos.length - 1 ? ROJO : MORADO))
    doc.rect(x, y + 6, 3, 36, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...GRIS)
    doc.text(titulo, x + 12, y + 18)
    doc.setFontSize(11)
    doc.setTextColor(...TINTA)
    doc.text(valor, x + 12, y + 35)
  })
  y += 48 + 26

  // 4. Posiciones encontradas
  y = titulo(doc, 'Posiciones encontradas', y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRIS)
  doc.text('Índice del texto donde empieza cada aparición (la primera letra es la posición 0).', MARGEN, y)
  y += 16
  doc.setFont('courier', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...TINTA)
  if (posiciones.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.text('El patrón no aparece en el texto.', MARGEN, y)
    y += 14
  } else {
    const mostradas = posiciones.slice(0, MAX_POSICIONES).join(',  ')
    const resto = posiciones.length - MAX_POSICIONES
    const lineas = doc.splitTextToSize(resto > 0 ? `${mostradas}  … y ${resto} más` : mostradas, anchoUtil)
    for (const linea of lineas) {
      if (y > limiteInferior) {
        doc.addPage()
        y = MARGEN + 10
      }
      doc.text(linea, MARGEN, y)
      y += 14
    }
  }
  y += 14

  // 5. Texto con las coincidencias resaltadas
  if (y > limiteInferior - 60) {
    doc.addPage()
    y = MARGEN + 10
  }
  y = titulo(doc, 'Texto con las coincidencias', y)
  dibujarResaltado(doc, MARGEN, y, 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRIS)
  doc.text('= aparición del patrón', MARGEN + 28, y)
  y += 20

  doc.setFont('courier', 'normal')
  doc.setFontSize(TAM_LETRA)
  for (const linea of dividirEnLineas(texto, columnas)) {
    if (y > limiteInferior) {
      doc.addPage()
      y = MARGEN + 10
    }
    // Fondo del recuadro de texto (una franja por línea, quedan continuas)
    doc.setFillColor(...LAVANDA)
    doc.rect(MARGEN, y - TAM_LETRA - 1.5, anchoUtil, INTERLINEA, 'F')
    // Primero el fondo de cada tramo marcado...
    let k = 0
    while (k < linea.indices.length) {
      if (!marcados[linea.indices[k]]) {
        k++
        continue
      }
      const inicio = k
      while (k < linea.indices.length && marcados[linea.indices[k]]) k++
      dibujarResaltado(doc, MARGEN + RELLENO + inicio * ANCHO_LETRA, y, (k - inicio) * ANCHO_LETRA)
    }
    // ...y después el texto encima
    doc.setTextColor(...TINTA)
    doc.text(linea.caracteres, MARGEN + RELLENO, y)
    y += INTERLINEA
  }

  // 6. Pie de página y franja roja en cada hoja
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    if (p > 1) {
      doc.setFillColor(...ROJO)
      doc.rect(0, 0, ancho, 8, 'F')
    }
    doc.setDrawColor(...ROJO)
    doc.setLineWidth(1.5)
    doc.line(MARGEN, alto - 40, ancho - MARGEN, alto - 40)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRIS)
    doc.text('UFPS · Análisis de algoritmos · Isabella Cobos Lizarazo y Jason Andrés Vásquez Ramirez', MARGEN, alto - 26)
    doc.text(`Página ${p} de ${total}`, ancho - MARGEN, alto - 26, { align: 'right' })
  }

  const base = nombreArchivo.replace(/\.txt$/i, '')
  doc.save(`${base}_resultado.pdf`)
}

/** Título de sección con una barrita roja a la izquierda. Devuelve la nueva posición vertical. */
function titulo(doc, texto, y) {
  doc.setFillColor(...ROJO)
  doc.rect(MARGEN, y - 12, 4, 16, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...MORADO)
  doc.text(texto, MARGEN + 12, y)
  return y + 20
}

/** Corta un texto con "…" si no cabe en el ancho dado. */
function recortar(doc, texto, anchoMax, fuente, estilo, tam) {
  doc.setFont(fuente, estilo)
  doc.setFontSize(tam)
  let t = texto
  while (t.length > 1 && doc.getTextWidth(t) > anchoMax) t = t.slice(0, -1)
  return t === texto ? t : `${t.slice(0, -1)}...`
}

function cargarLogo() {
  return new Promise((resolver) => {
    const img = new Image()
    img.onload = () => resolver(img)
    img.onerror = () => resolver(null) // si falla, el PDF sale igual sin logo
    img.src = logoUfps
  })
}

/** Fondo amarillo y línea roja debajo. */
function dibujarResaltado(doc, x, y, ancho) {
  doc.setFillColor(255, 217, 61)
  doc.rect(x, y - TAM_LETRA + 1, ancho, TAM_LETRA + 2, 'F')
  doc.setDrawColor(...ROJO_OSCURO)
  doc.setLineWidth(1.2)
  doc.line(x, y + 2.5, x + ancho, y + 2.5)
}

/**
 * Parte el texto en líneas que caben en la página.
 * Cada línea guarda, para cada carácter, su posición en el texto original
 * (así sabemos cuáles resaltar aunque la línea se haya cortado).
 */
function dividirEnLineas(texto, columnas) {
  const lineas = []
  let actual = { caracteres: '', indices: [] }

  const cerrarLinea = () => {
    lineas.push(actual)
    actual = { caracteres: '', indices: [] }
  }

  for (let k = 0; k < texto.length; k++) {
    const c = texto[k]
    if (c === '\n') {
      cerrarLinea()
      continue
    }
    const piezas = c === '\t' ? '    ' : limpiar(c) // el tabulador se vuelve 4 espacios
    for (const pieza of piezas) {
      if (actual.caracteres.length === columnas) cerrarLinea()
      actual.caracteres += pieza
      actual.indices.push(k)
    }
  }
  lineas.push(actual)
  return lineas
}

/** Las fuentes básicas del PDF solo tienen caracteres latinos; el resto se cambia por '?'. */
function limpiar(texto) {
  return texto.replace(/[^\x20-\x7E\xA0-\xFF]/g, (c) => (c.charCodeAt(0) < 32 ? ' ' : '?'))
}
