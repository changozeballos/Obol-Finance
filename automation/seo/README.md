# SEO y previews — qué se aplicó y qué queda pendiente

Todo el paquete (meta tags, Open Graph, Twitter Card, JSON-LD, sitemap, feed y robots) ya está aplicado directamente en `docs/`. Esto documenta qué se corrigió del paquete original y qué pasos manuales quedan.

## Qué se corrigió del paquete que llegó en el zip

- **`dolar.html` en el sitemap sin existir todavía**: el sitemap original incluía esa URL (para una página de "dólar e inflación en vivo" que todavía no está construida). Enviar ese sitemap a Search Console habría generado un error 404 apenas Google lo rastree. Se sacó del sitemap; la imagen `og-dolar.png` se dejó en `docs/assets/og/` para cuando esa página exista.
- **Faltaba la 8va nota del blog**: `tarjeta-de-credito-mal-usada.html` existe en el sitio y está linkeada desde `blog/index.html`, pero no tenía bloque de meta tags, JSON-LD, imagen OG ni entrada en el sitemap/feed. Se generó todo: imagen `og-tarjeta-de-credito-mal-usada.png` (mismo template que las otras 10), meta tags, JSON-LD y sus entradas en `sitemap.xml` y `feed.xml`.
- **Fechas placeholder**: el paquete traía `2026-01-15` como fecha inventada en todos los `article:published_time` y `pubDate`, porque quien lo armó no tenía forma de saber la fecha real. Acá sí había forma: `git log` muestra que las 8 notas se subieron el 2026-07-22, con la última modificación de contenido el 2026-07-30 (2026-08-01 para la de tarjeta de crédito). Se usaron esas fechas reales en vez del placeholder.

## Qué se aplicó

- Meta tags (canonical, robots, Open Graph, Twitter Card) en las 13 páginas: home, `aprende.html`, índice del blog, las 8 notas, y `privacy.html`/`terms.html` con `noindex`.
- JSON-LD (`Organization` + `WebSite` + `MobileApplication` en la home, `CollectionPage` en `aprende.html`, `Blog` en el índice, `BlogPosting` + `BreadcrumbList` en cada nota).
- `docs/sitemap.xml`, `docs/feed.xml` y `docs/robots.txt`.
- Las 12 imágenes OG (1200×630) en `docs/assets/og/`, incluida la nueva de tarjeta de crédito.

## Lo que queda manual (no lo puedo hacer yo)

1. ~~Cargar el sitemap en Google Search Console~~ — hecho (2026-08-05): propiedad `obolfinance.github.io` verificada por meta tag, sitemap enviado.
2. ~~El `robots.txt` no lo iba a leer ningún crawler donde estaba~~ — resuelto solo: el sitio se mudó de `changozeballos.github.io/Obol-Finance/` a `obolfinance.github.io/` (repo transferido a una organización y renombrado al patrón especial `<nombre>.github.io`), así que ahora el sitio vive en la raíz del dominio y `robots.txt` está exactamente donde los crawlers lo buscan.
3. **Probar los previews reales**: Facebook/WhatsApp con `developers.facebook.com/tools/debug` (con "Scrape Again" para forzar el refresco de caché), Twitter/X con `cards-dev.twitter.com/validator`, y `validator.schema.org` para el JSON-LD.
4. **Revisar las descripciones de las notas contra el texto real**: se escribieron a partir del resumen del índice del blog, no de una lectura completa de cada artículo.
