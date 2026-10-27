# Boyer-Moore-Horspool-Sunday · Simulador

Aplicación web hecha con **React + JavaScript (Vite)** que implementa el algoritmo de búsqueda de patrones **Boyer-Moore-Horspool-Sunday** (Quick Search, D. M. Sunday, 1990).

**Integrantes:** Isabella Cobos Lizarazo · Jason Andrés Vásquez Ramirez

## Qué hace

1. Escoger un archivo de texto plano (`.txt`) del computador.
2. Escribir el patrón (la búsqueda se actualiza mientras escribes).
3. Mostrar cuántas veces aparece el patrón.
4. Descargar un **PDF** del texto con cada aparición resaltada y subrayada.
5. **Simulador paso a paso**: el patrón se desliza sobre el texto, se colorean las comparaciones, se marca el carácter `T[i + m]` que decide el salto y se explica cada intento con palabras.

## Estructura

```
src/
├── algoritmo/
│   └── BoyerMooreHorspoolSunday.js   Clase del algoritmo: tabla de saltos y búsqueda
├── utils/
│   ├── archivoTexto.js               Leer y validar el .txt
│   ├── generadorPDF.js               Crear el PDF resaltado (librería jsPDF)
│   └── caracteres.js                 Mostrar espacios y saltos de línea
├── components/
│   ├── PanelDatos.jsx                Archivo, patrón y botón del PDF
│   ├── Estadisticas.jsx              Números de la búsqueda
│   ├── Controles.jsx                 Anterior, siguiente, reproducir, velocidad
│   ├── Tablero.jsx                   Dibujo animado de texto, ventana y patrón
│   ├── Explicacion.jsx               Explicación en palabras de cada intento
│   ├── TablaSaltos.jsx               Tabla de saltos con la casilla usada resaltada
│   └── TextoResaltado.jsx            Texto completo con las coincidencias
├── App.jsx                           Estado de la aplicación y unión de los componentes
├── App.css                           Estilos y animaciones
└── main.jsx                          Punto de entrada
public/ejemplo.txt                    Archivo para probar
```

La lógica está separada de la vista: `BoyerMooreHorspoolSunday.js` no sabe nada de React, y los componentes solo muestran lo que el algoritmo devuelve.

## Cómo ejecutarlo en Visual Studio Code

Requisito: tener **Node.js** instalado (versión 18 o más nueva, desde https://nodejs.org).

1. Descomprimir la carpeta y abrirla en VS Code (**File → Open Folder**).
2. Abrir la terminal (**Terminal → New Terminal**) y ejecutar:
   ```bash
   npm install
   npm run dev
   ```
3. Abrir en el navegador la dirección que aparece (normalmente `http://localhost:5173`).

Los cambios que hagas en el código se ven al instante en el navegador.

## Publicar en GitHub Pages

1. Crear un repositorio en GitHub (por ejemplo `sunday-simulador`) y subir esta carpeta:
   ```bash
   git init
   git add .
   git commit -m "Simulador Boyer-Moore-Horspool-Sunday"
   git branch -M main
   git remote add origin https://github.com/USUARIO/sunday-simulador.git
   git push -u origin main
   ```
2. Publicar:
   ```bash
   npm run deploy
   ```
   Esto compila el proyecto y lo sube a la rama `gh-pages`.
3. En GitHub: **Settings → Pages → Source: Deploy from a branch**, rama **`gh-pages`**, carpeta **`/ (root)`** → Save.
4. En unos minutos queda en `https://USUARIO.github.io/sunday-simulador/`.

Cada vez que cambien algo, vuelvan a ejecutar `npm run deploy`.

## El algoritmo

```
Preprocesamiento:  salto[c] = m - (última posición de c en P);  salto[otros] = m + 1
Búsqueda:          i = 0
                   mientras i <= n - m:
                       si T[i .. i+m-1] = P: reportar i
                       si i + m >= n: terminar
                       i = i + salto[T[i + m]]
```

- Preprocesamiento: O(m + σ), con σ = tamaño del alfabeto.
- Búsqueda: mejor caso O(n / (m + 1)), peor caso O(n · m).

Referencia: C. Charras y T. Lecroq, *Exact String Matching Algorithms*, "Quick Search algorithm".
