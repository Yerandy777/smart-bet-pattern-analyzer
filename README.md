# SMART BET PATTERN ANALYZER — GitHub Pages

## Qué incluye
- Interfaz premium oscura azul/neón, adaptable a móvil y escritorio.
- Panel principal, analizador, historial, detector de patrones y configuración.
- Importación de listas en formato `Equipo A vs 0.5 Equipo B (2.5)`.
- Búsqueda de partidos y resultados reales mediante API-Football a través de Cloudflare Worker.
- Liquidación del hándicap positivo aplicado al segundo equipo.
- Para la línea de goles, el sistema compara automáticamente OVER y UNDER y registra únicamente el lado que ganó (o nula/media liquidación).
- Historial local, exportación CSV y copia/restauración JSON.

## Publicar la web en GitHub Pages
1. Crea un repositorio nuevo en GitHub, por ejemplo `smart-bet-pattern-analyzer`.
2. Descomprime este ZIP.
3. Sube el contenido de la carpeta `docs` a la raíz del repositorio (debe quedar `index.html` en la raíz). Alternativamente, configura Pages para publicar desde `/docs` si subes la carpeta completa.
4. En GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)**.
5. Guarda y espera a que GitHub Pages publique el sitio.

## Activar la búsqueda real (Cloudflare Worker)
GitHub Pages no ejecuta backend ni puede guardar claves secretas. El Worker ya está preparado en `cloudflare-worker/worker.js`.

1. Abre Cloudflare Dashboard → Workers & Pages → tu Worker existente `flat-term-e886`.
2. En Edit code, sustituye el código del Worker por `cloudflare-worker/worker.js` y pulsa Deploy.
3. En Settings → Variables and Secrets, conserva o crea el secreto `API_FOOTBALL_KEY` con tu clave de API-Football. No lo pongas en GitHub ni en `app.js`.
4. Abre `https://flat-term-e886.soleryerandy7.workers.dev/api/health`. Debe mostrar `ok:true` y `configured:true`.
5. En la web, entra en **Conexión y ajustes**. La dirección predeterminada ya apunta a ese Worker; pulsa **Probar conexión**.

Si deseas usar otro Worker, pega su URL en Conexión y ajustes.

## Datos y privacidad
La V1 guarda los registros en `localStorage`: se conservan en el navegador/dispositivo donde se introdujeron. No se sincronizan entre dispositivos ni se guardan en GitHub. Usa **Descargar copia JSON** para respaldar el historial. No borres los datos del navegador sin tener copia.

## Formato y liquidación
`Equipo A vs 0.5 Equipo B (2.5)`
- `0.5` se aplica como hándicap positivo al segundo equipo.
- `2.5` es el total de goles.
- El motor compara Over y Under y muestra el lado que obtuvo mejor liquidación según el resultado final.
- Líneas asiáticas de cuarto se dividen en dos líneas adyacentes para liquidar medias ganancias/pérdidas. Un empate de ambas partes se registra como nula.
- Para identificar el partido, selecciona un intervalo de fechas. Si aparecen varios encuentros entre los mismos equipos, el sistema marca el caso como ambiguo y pide reducir el intervalo; no elige uno a ciegas.

## Importante
- La cobertura y los límites dependen de tu plan API-Football; cada búsqueda consume solicitudes.
- El primer lanzamiento calcula patrones descriptivos, no predicciones. Un mínimo de 3 casos por grupo solo permite mostrar una coincidencia inicial; para conclusiones robustas se necesitan muestras mayores.
- La V1 no calcula rentabilidad/ROI porque no se introducen cuotas.
