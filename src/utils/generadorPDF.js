import { jsPDF } from 'jspdf'

/**
 * Crea un PDF con el texto del archivo y resalta (fondo amarillo + subrayado rojo)
 * cada aparición del patrón.
 */

const MARGEN = 50
const TAM_LETRA = 10
const INTERLINEA = 13
const ANCHO_LETRA = TAM_LETRA * 0.6 // en la fuente Courier todas las letras miden lo mismo

export function generarPDF({ texto, patron, posiciones, nombreArchivo }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const anchoPagina = doc.internal.pageSize.getWidth()
  const altoPagina = doc.internal.pageSize.getHeight()
  const columnas = Math.floor((anchoPagina - 2 * MARGEN) / ANCHO_LETRA)

  // 1. Marcamos qué caracteres del texto pertenecen a una coincidencia
  const marcados = new Array(texto.length).fill(false)
  for (const p of posiciones) {
    for (let k = p; k < p + patron.length; k++) marcados[k] = true
  }

  // 2. Encabezado
  let y = MARGEN
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(36, 83, 201)
  doc.text('Búsqueda con Boyer-Moore-Horspool-Sunday', MARGEN, y)
  y += 20
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(91, 107, 130)
  doc.text(`Archivo: ${limpiar(nombreArchivo)}`, MARGEN, y)
  y += 14
  doc.text(`Patrón: "${limpiar(patron)}"     Ocurrencias: ${posiciones.length}`, MARGEN, y)
  y += 16
  dibujarResaltado(doc, MARGEN, y, 22)
  doc.text('= aparición del patrón', MARGEN + 28, y)
  y += 12
  doc.setDrawColor(219, 227, 238)
  doc.line(MARGEN, y, anchoPagina - MARGEN, y)
  y += 22

  // 3. Texto, línea por línea
  doc.setFont('courier', 'normal')
  doc.setFontSize(TAM_LETRA)
  for (const linea of dividirEnLineas(texto, columnas)) {
    if (y > altoPagina - MARGEN) {
      doc.addPage()
      y = MARGEN
    }
    // Primero el fondo de cada tramo marcado...
    let k = 0
    while (k < linea.indices.length) {
      if (!marcados[linea.indices[k]]) {
        k++
        continue
      }
      const inicio = k
      while (k < linea.indices.length && marcados[linea.indices[k]]) k++
      dibujarResaltado(doc, MARGEN + inicio * ANCHO_LETRA, y, (k - inicio) * ANCHO_LETRA)
    }
    // ...y después el texto encima
    doc.setTextColor(27, 42, 65)
    doc.text(linea.caracteres, MARGEN, y)
    y += INTERLINEA
  }

  // 4. Número de página
  const total = doc.getNumberOfPages()
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(91, 107, 130)
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.text(`Página ${p} de ${total}`, anchoPagina - MARGEN, altoPagina - 25, { align: 'right' })
  }

  const base = nombreArchivo.replace(/\.txt$/i, '')
  doc.save(`${base}_resultado.pdf`)
}

/** Fondo amarillo y línea roja debajo. */
function dibujarResaltado(doc, x, y, ancho) {
  doc.setFillColor(255, 226, 122)
  doc.rect(x, y - TAM_LETRA + 1, ancho, TAM_LETRA + 2, 'F')
  doc.setDrawColor(198, 47, 47)
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
