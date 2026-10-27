/** Tarjetas con los números principales de la búsqueda. */
export default function Estadisticas({ resultado, n, m }) {
  const fuerzaBruta = n - m + 1

  const datos = [
    { valor: resultado.posiciones.length, texto: 'veces aparece el patrón', clase: 'verde' },
    { valor: resultado.pasos.length, texto: 'intentos de Sunday', clase: 'azul' },
    { valor: fuerzaBruta, texto: 'intentos con fuerza bruta', clase: 'gris' },
    { valor: resultado.comparaciones, texto: 'comparaciones de caracteres', clase: 'azul' },
  ]

  return (
    <section className="estadisticas">
      {datos.map((d) => (
        // la key cambia con el valor, así la animación se repite cuando el número cambia
        <div className="estadistica" key={d.texto}>
          <strong key={d.valor} className={`numero ${d.clase}`}>
            {d.valor.toLocaleString()}
          </strong>
          <span>{d.texto}</span>
        </div>
      ))}
    </section>
  )
}
