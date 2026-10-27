/**
 * Algoritmo Boyer-Moore-Horspool-Sunday (Quick Search, Daniel M. Sunday, 1990).
 *
 * Idea: después de cada intento el patrón se mueve al menos una posición,
 * así que el carácter que está justo DESPUÉS de la ventana, T[i + m],
 * siempre estará en la siguiente ventana. Ese carácter decide el salto:
 *
 *   salto[c]     = m - (última posición de c en el patrón)
 *   salto[otros] = m + 1
 */
export class BoyerMooreHorspoolSunday {
  constructor(patron) {
    if (!patron) {
      throw new Error('El patrón no puede estar vacío.')
    }
    this.patron = patron
    this.m = patron.length
    this.tablaSaltos = this.construirTablaSaltos()
  }

  /**
   * Fase 1: preprocesamiento.
   * Recorremos el patrón de izquierda a derecha; si una letra se repite,
   * la última aparición sobrescribe a las anteriores (da el salto más pequeño y seguro).
   */
  construirTablaSaltos() {
    const tabla = new Map()
    for (let k = 0; k < this.m; k++) {
      tabla.set(this.patron[k], this.m - k)
    }
    return tabla
  }

  /** Salto para un carácter: el de la tabla, o m + 1 si no está en el patrón. */
  obtenerSalto(caracter) {
    return this.tablaSaltos.get(caracter) ?? this.m + 1
  }

  /**
   * Fase 2: búsqueda.
   * Devuelve las posiciones encontradas y cada intento (paso) para el simulador.
   */
  buscar(texto) {
    const n = texto.length
    const m = this.m
    const posiciones = []
    const pasos = []
    let comparaciones = 0

    let i = 0 // posición donde empieza la ventana
    while (i <= n - m) {
      // Comparamos la ventana T[i .. i+m-1] con el patrón, de izquierda a derecha
      let coincidencias = 0
      while (coincidencias < m && this.patron[coincidencias] === texto[i + coincidencias]) {
        coincidencias++
      }
      const encontrado = coincidencias === m
      comparaciones += encontrado ? m : coincidencias + 1

      if (encontrado) {
        posiciones.push(i)
      }

      // El carácter siguiente a la ventana decide el salto
      const haySiguiente = i + m < n
      const siguiente = haySiguiente ? texto[i + m] : null
      const salto = haySiguiente ? this.obtenerSalto(siguiente) : null

      pasos.push({
        numero: pasos.length + 1,
        inicio: i,
        coincidencias,
        encontrado,
        siguiente,
        salto,
      })

      if (!haySiguiente) break // fin del texto: no hay T[i + m]
      i += salto
    }

    return { posiciones, pasos, comparaciones }
  }
}
