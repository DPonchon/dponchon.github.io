# Auditoría Integral — sasaceramica.shop

**Fecha:** 2026-05-27  
**Alcance:** Repositorio completo — HTML/CSS/JS/Jekyll/assets/datos/configuración  
**Sitio:** [sasaceramica.shop](https://sasaceramica.shop) — GitHub Pages + Cloudflare + GoDaddy  

---

## 1. Resumen ejecutivo

El sitio es sólido para ser un emprendimiento en etapa temprana. La arquitectura Jekyll está bien ejecutada, el sistema de datos (YAML → productos) es mantenible, y las decisiones de performance (WebP + lazy loading + preconnect) muestran criterio técnico real. Los canales de venta (WhatsApp + MercadoLibre) están correctamente integrados para el mercado argentino.

**Tres hallazgos positivos clave:**
1. Sistema de producto-cards generado desde YAML con JSON-LD automático — escalable y bien armado.
2. GA4 con event tracking granular (consultas por producto, CTAs de conversión) — raro en sitios de este tamaño.
3. WhatsApp con mensajes pre-cargados por producto — reduce fricción al mínimo en el canal de conversión principal.

**Tres hallazgos negativos clave:**
1. **Documentos internos publicados:** hay un directorio `docs/superpowers/specs/` con planificación interna accesible en producción (`sasaceramica.shop/docs/superpowers/specs/2026-05-26-sellos-design/`).
2. **Cero mecanismo de retención:** no hay captura de email, newsletter ni forma de contactar a visitantes que no convirtieron hoy.
3. **Inconsistencia de datos visible al usuario:** el sello Botánicos dice "18 unidades" en el badge pero "17 unidades" en el alt text y el nombre del archivo de imagen.

---

## 2. Scorecard

| Perspectiva         | Nota | Justificación                                                                                          |
|---------------------|------|--------------------------------------------------------------------------------------------------------|
| **Técnica / UX**    | 7/10 | Base sólida (WebP, lazy load, a11y, dark mode). Pierde por: CSS sin minificar, H1 ausente en páginas de categoría, docs/ publicado, path con espacios en categoría Moldes. |
| **Marketing / SEO** | 6/10 | WA CTAs excelentes, GA4 completo, OG tags bien armados. Pierde por: sin testimonios, sin schema de reviews, sin contenido para SEO orgánico, sin captura de emails. |
| **Estratégica**     | 5/10 | Canales correctos para Argentina (ML + WA + IG). Pierde por: sin retención post-visita, sin política de envíos formal, sin diferenciación articulada vs. importados, sin plan de escalado de catálogo. |

---

## 3. Lo que está bien hecho

### Arquitectura del proyecto
- **Jekyll + YAML data files** (`_data/rodillos.yml`, etc.) → catálogo mantenible sin tocar HTML. Añadir un producto nuevo es un bloque YAML. Bien diseñado.
- **`_layouts/category.html`** reutilizable: herramientas, rodillos y moldes comparten el mismo layout, sin código duplicado.
- **`product-card.html`** como include parametrizable con manejo de promos, badges, mensajes WA personalizados. Código DRY.

### Performance
- **WebP para todos los rodillos y moldes** (imágenes principales): `rodillo_calaveras.webp` 205KB vs `.jpg` 612KB — reducción del 66%. Correctamente servido con `<picture>` + `<source>`.
- **`loading="eager"` en la imagen de promo** (primer elemento visible en rodillos.html) y `loading="lazy"` en todo lo demás — priorización correcta.
- **`width` y `height` explícitos** en todas las imágenes del product-card — evita CLS.
- **`preconnect` a fonts.googleapis.com y fonts.gstatic.com** — reduce latencia de Google Fonts.
- **Anti-flicker script inline** para dark mode — evita el flash de tema incorrecto en el primer render.

### Accesibilidad
- **Skip link** (`<a href="#main-content" class="skip-link">`) — cumple WCAG 2.1 AA.
- **`aria-expanded`, `aria-controls`, `role="dialog"`** en el menú móvil — navegable por teclado.
- **Cierre del menú con Escape** y retorno del foco al hamburger (`hamburger.focus()`) — correcto.
- **`aria-label` descriptivos** en todos los íconos (Instagram, WhatsApp, dark mode toggle).
- **`aria-hidden="true"` en elementos decorativos** (blobs SVG, separadores).
- **`prefers-reduced-motion`** implementado en CSS (`_styles.css:1917`).

### SEO técnico
- **`robots.txt`** correcto: `Allow: /` + referencia al sitemap.
- **`jekyll-sitemap`** generando `sitemap.xml` automáticamente.
- **Canonical tags** en todas las páginas via `default.html:11`.
- **Open Graph completo** (title, description, image, locale, site_name) + Twitter Card.
- **Schema.org Product JSON-LD** con `AggregateOffer`, precios en ARS, `InStock` — generado dinámicamente desde los datos YAML via `products-jsonld.html`.
- **Schema.org Organization** con `sameAs` a Instagram.
- **`lang="es"`** en el `<html>` root.

### UX / Conversión
- **Mensajes WA pre-cargados por producto** — ej: `"Hola! Me interesa el Rodillo Calaveras de su web. ¿Tienen disponible?"` — el cliente no tiene que escribir nada.
- **Barra de envíos siempre visible** con links directos a WA e Instagram.
- **WA FAB (botón flotante)** en móvil — acceso de 1 tap a contacto.
- **Dark mode** con persistencia en localStorage — feature premium en un sitio artesanal.
- **Soporte bilingüe (ES/EN)** con toggles en navbar y menú móvil — abre el mercado a ceramistas de habla inglesa.
- **GA4 con event tracking** granular: `consulta_whatsapp`, `consulta_instagram`, `cta_principal_whatsapp`, `seccion_vista` — base sólida para decisiones basadas en datos.

---

## 4. Hallazgos por perspectiva

---

### 4.1 Técnica y UX

#### ✅ Lo que está bien
(Ver sección 3 — los puntos de performance, accesibilidad y SEO técnico.)

#### 🔴 Hallazgos — Prioridad Alta

**T-1: Documentos internos publicados en producción**  
`_config.yml` excluye `CLAUDE.md` y `README.md`, pero **no excluye el directorio `docs/`**.  
Resultado: `sasaceramica.shop/docs/superpowers/specs/2026-05-26-sellos-design/` es accesible públicamente.  
Contiene especificaciones internas de diseño.  
**Fix:** agregar `docs` a la lista `exclude` en `_config.yml`.

```yaml
exclude:
  - docs  # ← agregar
  - Gemfile
  ...
```

---

**T-2: H1 ausente en todas las páginas de categoría**  
`category.html` y `sellos-page.html` usan `<h2>` para el título principal de sección. No hay `<h1>` en esas páginas. El `<title>` HTML está correcto, pero el heading outline del DOM no tiene H1.  
Impacto: SEO (Google usa H1 como señal de tema) + accesibilidad (lectores de pantalla).  
**Fix:** cambiar `<h2 class="section__title">` a `<h1>` en `category.html:9` y `sellos-page.html:9`. Ajustar los nombres de clases si es necesario.

---

**T-3: URL con espacios literales en tarjeta de categoría Moldes**  
`index.html:82`:
```html
<img src="{{ '/images/moldes y cortantes/Contramolde asa x12 - costo 27.000.jpeg' | relative_url }}" ...>
```
El filtro `relative_url` de Jekyll no codifica espacios. El HTML renderizado tiene una URL con espacios literales que puede fallar en Safari o Firefox dependiendo del modo estricto.  
**Fix:** URL-encodear el path o referenciar via el dato del YML con URL ya codificada.

---

#### 🟡 Hallazgos — Prioridad Media

**T-4: CSS no minificado en producción**  
`css/styles.css` — 52KB, 2413 líneas. Sin GitHub Actions ni CDN que lo comprima, llega sin minificar.  
Estimado minificado: ~18-22KB. Ahorro potencial: ~30KB por request.  
**Fix (corto):** Agregar compresión Gzip/Brotli en Cloudflare (se activa en 1 click). Fix a largo plazo: asset pipeline (Jekyll Assets o minificación manual pre-commit).

---

**T-5: Google Fonts es render-blocking**  
`default.html:53` carga la hoja de Google Fonts de forma sincrónica en `<head>`. Aunque el URL incluye `display=swap`, el DNS lookup + request inicial bloquea el render.  
**Fix:** Reemplazar con carga diferida:
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?..." as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="..."></noscript>
```

---

**T-6: OG image (`preview.jpg`) sin versión WebP y de peso alto**  
`images/preview.jpg` — 397KB, 2848×1494px. Correcto en dimensiones (recomendado 1200×630) pero pesado.  
No hay impacto SEO directo, pero afecta la experiencia al compartir en redes lentas.  
**Fix:** Convertir a WebP y usar versión optimizada. Actualizar referencia en `default.html:21`.

---

**T-7: `promocion_sasa.png` de 6.5MB como fallback**  
`images/promocion_sasa.png` — 6.5MB. La versión WebP (205KB) sí se sirve en browsers modernos via `<picture>`, pero Internet Explorer y browsers muy antiguos descargarán 6.5MB.  
No es crítico hoy (IE <1% del mercado argentino), pero el archivo ocupa espacio innecesario en el repo.

---

**T-8: Sin WebP source en tarjetas de categoría (homepage)**  
`index.html:69` (Rodillos), `index.html:95` (Herramientas), `index.html:107` (Sellos): los `<picture>` wrapper no incluyen `<source type="image/webp">`. Solo los product-cards generados por el include tienen WebP. Los category cards no.  
**Fix:** Agregar `<source srcset="...webp" type="image/webp">` o crear versiones WebP para `rodillos_card.jpg` y las imágenes de herramientas/sellos usadas en el grid de categorías.

---

**T-9: Jerarquía de headings inconsistente en sellos**  
`sellos-page.html`: H2 → H3 (subsección "Personalizados") → H3 (nombre del producto dentro del card).  
Hay dos H3 al mismo nivel de jerarquía DOM: el título de subsección y el nombre del producto.  
**Fix:** El nombre del producto dentro de una subsección debería ser H4.

---

#### 🟢 Hallazgos — Prioridad Baja

**T-10: Logo visual ausente**  
`images/logo_sasa.jpeg` (187KB) está en el repo pero no se usa en ningún template. El logo en el navbar es texto HTML puro. No es un bug (el texto funciona), pero el archivo no tiene uso.  
**Opciones:** usarlo como imagen en el navbar, o eliminarlo del repo.

**T-11: `rodillos_sin_logo.jpg` sin uso aparente**  
651KB. No está referenciado en ningún data file ni template. Ocupa espacio sin aportar.

**T-12: Nombres de archivo con caracteres especiales en herramientas**  
`images/herramientas/Roller bolitas - costo 25.000.jpeg` — espacios, puntos decimales en el nombre. Funciona en la mayoría de servidores pero es frágil. Mejor: `roller-bolitas.jpeg`.

**T-13: `hreflang="x-default"` ausente**  
`default.html:12` tiene `hreflang="es-AR"` pero no `hreflang="x-default"`. Google recomienda incluir x-default para el fallback de idioma.

**T-14: `main.js` duplica escucha de scroll en la sección de nav activo**  
`main.js:194` añade un segundo listener de scroll para detectar scroll top, además del `sectionObserver`. Ambos se ejecutan siempre. Sin impacto medible a este tráfico, pero es redundancia.

---

### 4.2 Marketing y Conversión

#### ✅ Lo que está bien
(WhatsApp CTAs personalizados, ML integration, GA4 tracking, OG/Twitter cards, badges de "Más Vendido" — ver sección 3.)

#### 🔴 Hallazgos — Prioridad Alta

**M-1: Inconsistencia de datos en el sello Botánicos**  
`_data/sellos_predefinidos.yml:6` — `badge_text: "18 unidades"` pero:
- `image.alt: "Set de sellos botánicos para cerámica — 17 unidades — Sasa Cerámica"` (dice 17)
- `image.src: "botanicos_17_unidades_16_mil_pesos.png"` (nombre del archivo dice 17)

El usuario ve "18 unidades" en la tarjeta pero el alt text (lectores de pantalla) dice 17.  
**Fix:** Corregir alt text y eventualmente renombrar el archivo de imagen a `botanicos_18_unidades.png`.

---

**M-2: Sin captura de email — visitantes perdidos para siempre**  
No hay ningún punto de captura de email en el sitio. Un usuario que navega, no compra hoy y cierra la pestaña, está perdido.  
Impacto potencial: alto. El email tiene ROI promedio de 36:1 en e-commerce.  
**Fix (mínimo viable):** Un popup de exit-intent o un formulario al pie con CTA tipo "Suscribite y enterate de nuevos diseños". Se puede conectar a Mailchimp/Brevo free tier.

---

**M-3: Sin testimonios ni reseñas visibles**  
El sitio no tiene ninguna prueba social de clientes reales. Los badges "Más Vendido" y "Popular" son auto-declarados.  
Impacto: alta fricción para nuevos compradores desconocidos.  
**Fix:** Agregar una sección `#testimonios` con 3-5 capturas de DMs de Instagram o reseñas de ML, con nombre (o @) del cliente.

---

#### 🟡 Hallazgos — Prioridad Media

**M-4: Sin schema de AggregateRating en productos**  
Los JSON-LD de producto (`products-jsonld.html`) no incluyen `AggregateRating`. Sin eso, Google no puede mostrar las estrellas en los resultados de búsqueda.  
**Fix:** Una vez que haya reseñas reales (de ML o IG), agregar el bloque al include.

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.9",
  "reviewCount": "47"
}
```

---

**M-5: Galería muestra los rodillos, no los resultados en arcilla**  
La sección `#galeria` tiene el título "Mirá lo que podés crear" pero muestra fotos de los rodillos mismos, no de texturas impresas en arcilla/piezas terminadas.  
Impacto: baja conversión — el ceramista quiere ver el resultado final, no el producto.  
**Fix:** Reemplazar las 6 imágenes de la galería con fotos de piezas terminadas con las texturas aplicadas. Esto también es mejor contenido para Instagram.

---

**M-6: Sin política de envíos formal**  
La barra superior dice "Envíos a todo Argentina — Coordiná por Instagram o WhatsApp". No hay ninguna página ni sección con:
- Tiempos estimados de entrega
- Costo de envío (o cómo se calcula)  
- Transportista utilizado
- Qué pasa si llega dañado

Un ceramista que quiere saber cuándo llega el rodillo tiene que escribir por WA solo para saberlo.  
**Fix:** Agregar una sección `#envios` en el home o una página `/envios/` con la info básica.

---

**M-7: Precios en ARS sin contexto de paridad**  
Con la inflación argentina, los precios se desactualizan rápido. No hay mecanismo para saber si el precio en pantalla es el actual.  
Supuesto: los precios en los YAML se actualizan manualmente.  
**Fix (mínimo):** Agregar una última actualización de precios visible, ej: "Precios actualizados al 2026-05-27."

---

**M-8: Sin breadcrumb schema en páginas de categoría**  
Las páginas `/rodillos/`, `/sellos/`, etc. no tienen BreadcrumbList schema. Esto limita los rich snippets en Google.  
**Fix:** Agregar a `products-jsonld.html` o a cada page layout:
```json
{"@type": "BreadcrumbList", "itemListElement": [
  {"@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://sasaceramica.shop/"},
  {"@type": "ListItem", "position": 2, "name": "Rodillos", "item": "https://sasaceramica.shop/rodillos/"}
]}
```

---

**M-9: Twitter Card sin cuenta de Twitter**  
`default.html:27-31` incluye Twitter Card pero no hay `<meta name="twitter:site">` con una cuenta de Twitter/X. No es crítico (la card funciona igual), pero el crédito de la cuenta queda vacío.  
**Fix (si hay cuenta):** agregar `<meta name="twitter:site" content="@sasa_ceramica">`.

---

#### 🟢 Hallazgos — Prioridad Baja

**M-10: Detección de idioma del navegador no implementada**  
`i18n.js:12` — si no hay preferencia guardada en localStorage, siempre arranca en español. Un ceramista de México o España con browser en español igual ve español, pero uno angloparlante ve español hasta que hace click.  
**Fix:** Detectar `navigator.language` al primer visit y pre-setear si es `en`.

**M-11: Link ML es una URL larga y frágil**  
`index.html:149` — la URL de MercadoLibre incluye `pdp_filters=item_id%3AMLA3184073682`. Si ML cambia el formato de la publicación, el link puede romperse silenciosamente.  
**Fix:** Usar la URL más corta de la publicación o testear periódicamente.

---

### 4.3 Estratégica

#### ✅ Lo que está bien
- **WhatsApp como canal principal** — decisión correcta para Argentina. El ceramista argentino compra por WA.
- **MercadoLibre como canal secundario** — con Mercado Pago integrado, el pago es un no-problema. La integración actual (enlace a publicación + paso a paso en la home) está bien comunicada.
- **Catálogo diversificado** — 4 categorías (rodillos, sellos, moldes, herramientas) con ~40 SKUs. Buena señal de que el negocio ya tiene producto-mercado fit básico.
- **Bilingüe** — Potencial de ventas a ceramistas de USA/Europa que buscan rodillos únicos. Pocos competidores ofrecen este tipo de herramienta en inglés desde Latam.

#### 🔴 Hallazgos — Prioridad Alta

**E-1: Sin mecanismo de retención — el negocio depende de visitas repetidas orgánicas**  
El embudo actual es: tráfico → producto → WA/Instagram → venta.  
No hay forma de nutrir al visitante que necesita tiempo para decidir, ni de alcanzar al cliente anterior para informarle de nuevos diseños.  
Impacto: churn del 100% de visitantes no-convertidos, sin forma de recapturarlos.  
**Fix prioritario:** Email marketing (Mailchimp free, hasta 500 contactos). Un formulario de suscripción en el footer + popup de exit-intent recuperaría un porcentaje significativo.

---

**E-2: Sin diferenciación articulada vs. alternativas**  
El sitio dice "artesanales" pero no explica qué hace a los rodillos de Sasa mejores/diferentes que los importados de China en ML o los impresos en casa por otros.  
Preguntas sin respuesta en el sitio:
- ¿Cuánto duran estos rodillos?
- ¿Con qué material están hechos?
- ¿Cuánta presión soportan?
- ¿Por qué $10.000 y no $2.000?

**Fix:** Agregar en la sección "Nosotros" o como sección aparte: el material (PLA/PETG/resina), la durabilidad estimada, el proceso de fabricación artesanal. No es texto de relleno — es la justificación del precio.

---

#### 🟡 Hallazgos — Prioridad Media

**E-3: Sin política de privacidad — riesgo legal**  
El sitio usa GA4 (cookies de seguimiento) pero no tiene Privacy Policy ni aviso de cookies.  
En Argentina, la Ley 25.326 de Protección de Datos Personales requiere informar sobre el tratamiento de datos.  
**Fix:** Agregar `/privacidad/` con información básica sobre uso de cookies y datos. Plantillas gratuitas disponibles.

---

**E-4: Escalabilidad de catálogo — los precios en ARS se desactualizan rápido**  
Con inflación >100% anual, actualizar 40+ precios en YAMLs cada mes es una carga operativa.  
**Fix a mediano plazo:** Considerar un panel de administración simple (Decap CMS / Forestry / Netlify CMS) para editar precios desde UI sin tocar código. O bien documentar un proceso claro para actualización masiva.

---

**E-5: Única vía de contacto por WA — punto único de falla**  
Si WhatsApp tiene un outage o el número queda inhabilitado, el sitio pierde su canal de conversión principal.  
**Fix:** Agregar email de contacto como alternativa (puede ser un Gmail dedicado).

---

#### 🟢 Hallazgos — Prioridad Baja

**E-6: Sin contenido para SEO orgánico**  
No hay blog ni artículos. Búsquedas como "cómo usar rodillos de textura en cerámica", "técnicas de texturado en arcilla" o "sellos para arcilla artesanales" no tienen contenido que posicione.  
**Fix a largo plazo:** 1 artículo por mes en `/blog/` con tutoriales. Bajo esfuerzo, alto retorno en 6-12 meses.

**E-7: Sin pixel de retargeting**  
No hay pixel de Facebook/Meta ni de TikTok. Imposible hacer retargeting a visitantes que no convirtieron.  
**Fix (si hay presupuesto de ads):** Agregar Meta Pixel antes de cualquier campaña paga.

**E-8: Programa de clientes recurrentes inexistente**  
Los ceramistas compran múltiples rodillos a lo largo del tiempo. No hay ningún incentivo a volver (descuento por recompra, newsletter con novedades).

---

## 5. Plan de acción priorizado

| #  | Hallazgo                                            | Perspectiva | Prioridad | Esfuerzo | Impacto esperado                                          |
|----|-----------------------------------------------------|-------------|-----------|----------|-----------------------------------------------------------|
| 1  | **T-1** Excluir `docs/` de Jekyll                  | Técnica     | 🔴 Alta   | S (5min) | Elimina exposición de información interna                 |
| 2  | **M-1** Corregir inconsistencia sello Botánicos    | Marketing   | 🔴 Alta   | S (15min)| Elimina confusión y error en alt text                     |
| 3  | **T-2** Agregar H1 en páginas de categoría         | Técnica     | 🔴 Alta   | S (30min)| Mejora SEO on-page y accesibilidad                        |
| 4  | **T-3** Corregir URL con espacios en categoría Moldes | Técnica  | 🔴 Alta   | S (15min)| Evita 404 en browsers estrictos                           |
| 5  | **M-3** Agregar sección de testimonios             | Marketing   | 🔴 Alta   | M (3-4h) | Aumenta confianza y conversión de nuevos visitantes       |
| 6  | **E-1** Captura de emails (formulario + popup)     | Estrategia  | 🔴 Alta   | M (4-6h) | Activa retención — los visitantes no son descartables     |
| 7  | **M-5** Reemplazar galería con fotos de resultados | Marketing   | 🟡 Media  | M (2-3h) | El ceramista quiere ver el producto terminado, no el rodillo |
| 8  | **M-6** Agregar sección/página de envíos           | Marketing   | 🟡 Media  | S (2h)   | Reduce preguntas por WA y aumenta confianza               |
| 9  | **E-2** Agregar diferenciadores de producto        | Estrategia  | 🟡 Media  | M (3h)   | Justifica el precio y educa al comprador                  |
| 10 | **T-4** Minificar CSS / activar compresión         | Técnica     | 🟡 Media  | S-M      | Mejora performance (~30KB menos por page load)            |
| 11 | **T-5** Carga diferida de Google Fonts             | Técnica     | 🟡 Media  | S (1h)   | Reduce render-blocking, mejora LCP                        |
| 12 | **T-8** WebP para tarjetas de categoría            | Técnica     | 🟡 Media  | S (1h)   | Reduce peso en homepage en browsers modernos              |
| 13 | **M-4** Agregar AggregateRating al schema          | Marketing   | 🟡 Media  | S (1h)   | Habilita estrellas en resultados de Google                |
| 14 | **M-8** Breadcrumb schema en categorías            | Marketing   | 🟡 Media  | S (1h)   | Rich snippets en búsquedas                                |
| 15 | **E-3** Política de privacidad                     | Estrategia  | 🟡 Media  | M (2h)   | Cumplimiento Ley 25.326, requerido para GA4               |
| 16 | **E-4** Admin panel de precios                     | Estrategia  | 🟢 Baja   | L        | Reduce carga operativa con inflación alta                 |
| 17 | **E-6** Blog con contenido SEO                     | Estrategia  | 🟢 Baja   | L        | SEO orgánico a 6-12 meses vista                           |

---

## 6. Quick wins — menos de 1 hora, alto impacto

### QW-1: Excluir `docs/` del build de Jekyll (5 min)
Archivo: `_config.yml`
```yaml
exclude:
  - docs        # ← agregar esta línea
  - Gemfile
  - Gemfile.lock
  - vendor
  - CLAUDE.md
  - .gitignore
  - README.md
  - node_modules
```
Push → deploy automático. Información interna fuera de producción.

---

### QW-2: Corregir inconsistencia Botánicos (15 min)
Archivo: `_data/sellos_predefinidos.yml`
- Cambiar `alt:` a `"Set de sellos botánicos para cerámica — 18 unidades — Sasa Cerámica"`
- Cambiar `badge_text:` a `"18 unidades"` (ya está correcto) — solo el alt necesita fix.

---

### QW-3: Agregar H1 en layouts de categoría (30 min)
Archivo: `_layouts/category.html:9` y `_layouts/sellos-page.html:9`  
Cambiar `<h2 class="section__title"` por `<h1 class="section__title"` en ambos archivos.  
Ajustar el CSS si hay estilos que diferencien H1/H2 (verificar en `styles.css`).

---

### QW-4: Activar compresión en Cloudflare (5 min)
En el panel de Cloudflare: Speed → Optimization → activar **Brotli** y **Minify** (HTML + CSS + JS).  
Sin tocar el repo. Resultado inmediato en usuarios de todo el mundo.

---

### QW-5: Corregir URL con espacios en index.html (15 min)
Archivo: `index.html:82`  
Cambiar:
```html
src="{{ '/images/moldes y cortantes/Contramolde asa x12 - costo 27.000.jpeg' | relative_url }}"
```
Por:
```html
src="{{ '/images/moldes%20y%20cortantes/Contramolde%20asa%20x12%20-%20costo%2027.000.jpeg' | relative_url }}"
```

---

### QW-6: Agregar `hreflang="x-default"` (10 min)
Archivo: `_layouts/default.html:12`  
Agregar después de la línea del `hreflang="es-AR"`:
```html
<link rel="alternate" hreflang="x-default" href="{{ '/' | absolute_url }}">
```

---

*Fin del informe — generado a partir de análisis directo del código fuente.*
