/**
 * Utilidades para leer archivos de texto plano (.txt).
 */

/** Verifica que el archivo tenga extensión .txt */
export function validarArchivo(archivo) {
  if (!archivo) {
    throw new Error('No se escogió ningún archivo.')
  }
  if (!archivo.name.toLowerCase().endsWith('.txt')) {
    throw new Error('Solo se permiten archivos con extensión .txt')
  }
}

/** Lee el archivo y devuelve su texto. Los saltos de línea de Windows (\r\n) se convierten en \n. */
export async function leerArchivo(archivo) {
  validarArchivo(archivo)
  const texto = await archivo.text()
  if (texto.length === 0) {
    throw new Error('El archivo está vacío.')
  }
  return texto.replace(/\r\n?/g, '\n')
}

/** Cuenta los caracteres que no son ASCII (código mayor que 127). */
export function contarNoAscii(texto) {
  let cuenta = 0
  for (const c of texto) {
    if (c.charCodeAt(0) > 127) cuenta++
  }
  return cuenta
}
