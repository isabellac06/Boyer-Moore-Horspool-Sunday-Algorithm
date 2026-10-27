/** Cómo se dibuja un carácter en una casilla (los invisibles se hacen visibles). */
export function visible(c) {
  if (c === ' ') return '·'
  if (c === '\n') return '¶'
  if (c === '\t') return '»'
  return c
}

/** Cómo se nombra un carácter en las explicaciones. */
export function nombre(c) {
  if (c === ' ') return 'un espacio'
  if (c === '\n') return 'un salto de línea'
  if (c === '\t') return 'un tabulador'
  return `"${c}"`
}
