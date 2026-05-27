# Auditoría Integral — sasaceramica.shop

**Fecha:** 2026-05-27 (revisión post-commit `67f3a27`)
**Alcance:** Repositorio completo — HTML/CSS/JS/Jekyll/assets/datos/configuración  
**Sitio:** [sasaceramica.shop](https://sasaceramica.shop) — GitHub Pages + Cloudflare + GoDaddy  

---

## 1. Resumen ejecutivo

El sitio es sólido para ser un emprendimiento en etapa temprana. La arquitectura Jekyll está bien ejecutada, el sistema de datos (YAML → productos) es mantenible, y las decisiones de performance (WebP + lazy loading + preconnect) muestran criterio técnico real. Los canales de venta (WhatsApp + MercadoLibre) están correctamente integrados para el mercado argentino.

Desde la primera auditoría se corrigieron tres issues: los documentos internos ya no se publican, el alt text del sello Botánicos es correcto, y las páginas de categoría tienen H1 semántico.

**Tres hallazgos positivos clave:**
1. Sistema de producto-cards generado desde YAML con JSON-LD automático — escalable y bien armado.
2. GA4 con event tracking granular (consultas por producto, CTAs de conversión) — raro en sitios de este tamaño.
3. WhatsApp con mensajes pre-cargados por producto — reduce fricción al mínimo en el canal de conversión principal.

**Tres gaps abiertos más importantes:**
1. **Cero mecanismo de retención:** no hay captura de email, newsletter ni forma de contactar a visitantes que no convirtieron hoy.
2. **Sin testimonios ni prueba social real** de clientes — los badges "Más Vendido" son auto-declarados.
3. **CSS no minificado y Google Fonts render-blocking** — performance mejorable sin cambiar el codebase.

---

## 2. Scorecard

| Perspectiva         | Nota | Justificación                                                                                          |
|---------------------|------|--------------------------------------------------------------------------------------------------------|
| **Técnica / UX**    | 7.5/10 | H1 corregido, docs/ excluido. Pierde por: CSS sin minificar, Fonts render-blocking, path con espacios en Moldes, sin WebP en category cards. |
| **Marketing / SEO** | 6.5/10 | Alt text corregido. WA CTAs excelentes, GA4 completo. Pierde por: sin testimonios, sin schema de reviews, sin captura de emails, galería muestra rodillos en vez de resultados. |
| **Estratégica**     | 5/10 | Canales correctos para Argentina. Pierde por: sin retención post-visita, sin política de envíos formal, sin diferenciación articulada, sin email de contacto. |

---

## 3. Lo que está bien hecho

### Arquitectura del proyecto
- **Jekyll + YAML data files** (`_data/rodillos.yml`, etc.) → catálogo mantenible sin tocar HTML. Añadir un producto nuevo es un bloque YAML. Bien diseñado.
- **`_layouts/category.html`** reutilizable: herramientas, rodillos y moldes comparten el mismo layout, sin código duplicado.
- **`product-card.html`** como include parametrizable con manejo de promos, badges, mensajes WA personalizados. Código DRY.

### Performance
- **WebP para todos los rodillos y moldes**: `rodillo_calaveras.webp` 205KB vs `.jpg` 612KB — reducción del 66%. Correctamente servido con `<picture>` + `<source>`.
- **`loading="eager"` en la imagen de promo** (primer elemento visible en rodillos.html) y `loading="lazy"` en todo lo demás — priorización correcta.
- **`width` y `height` explícitos** en todas las imágenes del product-card — evita CLS.
- **`preconnect` a fonts.googleapis.com y fonts.gstatic.com** — reduce latencia de Google Fonts.
- **Anti-flicker script inline** para dark mode — evita el flash de tema incorrecto en el primer render.

### Accesibilidad
- **Skip link** (`<a href="#main-content" class="skip-link">`) — cumple WCAG 2.1 AA.
- **`aria-expanded`, `aria-controls`, `role="dialog"`** en el menú móvil — navegable por teclado.
- **Cierre del menú con Escape** y retorno del foco al hamburger — correcto.
- **`aria-label` descriptivos** en todos los íconos (Instagram, WhatsApp, dark mode toggle).
- **`aria-hidden="true"` en elementos decorativos** (blobs SVG, separadores).
- **`prefers-reduced-motion`** implementado en CSS (`styles.css:1917`).
- **H1 presente en todas las páginas** (home, categorías, 404) — corregido en este sprint.

### SEO técnico
- **`robots.txt`** correcto: `Allow: /` + referencia al sitemap.
- **`jekyll-sitemap`** generando `sitemap.xml` automáticamente.
- **Canonical tags** en todas las páginas via `default.html:11`.
- **Open Graph completo** (title, description, image, locale, site_name) + Twitter Card.
- **Schema.org Product JSON-LD** con `AggregateOffer`, precios en ARS, `InStock` — generado dinámicamente desde los datos YAML via `products-jsonld.html`.
- **Schema.org Organization** con `sameAs` a Instagram.
- **`lang="es"`** en el `<html>` root.
- **`docs/` excluido del build** — planificación interna ya no se publica. Corregido en este sprint.

### UX / Conversión
- **Mensajes WA pre-cargados por producto** — el cliente no tiene que escribir nada.
- **Barra de envíos siempre visible** con links directos a WA e Instagram.
- **WA FAB (botón flotante)** en móvil — acceso de 1 tap a contacto.
- **Dark mode** con persistencia en localStorage.
- **Soporte bilingüe (ES/EN)** con toggles en navbar y menú móvil.
- **GA4 con event tracking** granular: `consulta_whatsapp`, `consulta_instagram`, `cta_principal_whatsapp`, `seccion_vista`.

---

## 4. Hallazgos por perspectiva

---

### 4.1 Técnica y UX

#### Issues resueltos ✅
- ~~T-1: `docs/` publicado en producción~~ — excluido en `_config.yml`.
- ~~T-2: H1 ausente en páginas de categoría~~ — `<h1>` en `category.html` y `sellos-page.html`.

#### 🟡 Hallazgos abiertos — Prioridad Media

**T-3: URL con espacios literales en tarjeta de categoría Moldes**  
`index.html:82`:
```html
<img src="{{ '/images/moldes y cortantes/Contramolde asa x12 - costo 27.000.jpeg' | relative_url }}" ...>
```
El filtro `relative_url` de Jekyll no codifica espacios. El HTML renderizado tiene espacios literales en la URL, lo que puede causar 404 en browsers estrictos.  
**Fix:** URL-encodear el path:
```html
src="{{ '/images/moldes%20y%20cortantes/Contramolde%20asa%20x12%20-%20costo%2027.000.jpeg' | relative_url }}"
```

---

**T-4: CSS no minificado en producción**  
`css/styles.css` — 52KB, 2413 líneas. Sin compresión en Cloudflare, llega sin minificar.  
Estimado minificado: ~18-22KB. Ahorro ~30KB por request.  
**Fix rápido:** Activar Brotli + Minify en Cloudflare Speed → Optimization (sin tocar código).

---

**T-5: Google Fonts es render-blocking**  
`default.html:53` carga la hoja de Google Fonts sincrónicamente en `<head>`. Aunque el URL incluye `display=swap`, el request bloquea el primer render.  
**Fix:**
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond..." as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="..."></noscript>
```

---

**T-6: Sin WebP source en tarjetas de categoría (homepage)**  
`index.html:69` (Rodillos), `index.html:95` (Herramientas), `index.html:107` (Sellos): los `<picture>` wrappers no incluyen `<source type="image/webp">`. Los product-cards generados por el include sí tienen WebP; los category cards no.  
**Fix:** Agregar `<source srcset="...webp" type="image/webp">` o crear versiones WebP para `rodillos_card.jpg` y las imágenes de categoría usadas en el grid de homepage.

---

**T-7: OG image (`preview.jpg`) de peso alto**  
`images/preview.jpg` — 397KB, 2848×1494px. Dimensiones correctas para OG pero peso alto para compartir en redes móviles.  
**Fix:** Convertir a WebP optimizado (~80-100KB) y actualizar referencia en `default.html:21`.

---

#### 🟢 Hallazgos abiertos — Prioridad Baja

**T-8: `jerarquía de headings en sellos-page`**  
`sellos-page.html`: H1 (título de sección) → H3 (subsección "Personalizados") → H3 (nombre del producto). El nombre del producto debería ser H4 dentro de la subsección H3.

**T-9: `hreflang="x-default"` ausente**  
`default.html:12` tiene `hreflang="es-AR"` pero falta `hreflang="x-default"`.  
**Fix:** `<link rel="alternate" hreflang="x-default" href="{{ '/' | absolute_url }}">`

**T-10: Logo visual no usado**  
`images/logo_sasa.jpeg` (187KB) está en el repo pero no se usa en ningún template.

**T-11: `rodillos_sin_logo.jpg` sin uso aparente**  
651KB en el repo sin referencia en templates ni data files.

**T-12: Nombres de archivo con caracteres especiales en herramientas**  
`images/herramientas/Roller bolitas - costo 25.000.jpeg` — espacios y puntos decimales en el nombre. Funciona pero es frágil.

---

### 4.2 Marketing y Conversión

#### Issues resueltos ✅
- ~~M-1: Inconsistencia "17/18 unidades" en sello Botánicos~~ — alt text corregido a "18 unidades".

#### 🔴 Hallazgos abiertos — Prioridad Alta

**M-2: Sin captura de email — visitantes perdidos para siempre**  
No hay ningún punto de captura de email. Un usuario que navega, no compra hoy y cierra la pestaña, está perdido.  
**Fix (mínimo viable):** Formulario al pie con CTA tipo "Suscribite y enterate de nuevos diseños". Conectar a Mailchimp/Brevo free tier.

---

**M-3: Sin testimonios ni reseñas visibles**  
No hay prueba social de clientes reales. Los badges "Más Vendido" y "Popular" son auto-declarados.  
**Fix:** Agregar una sección `#testimonios` con 3-5 capturas de DMs de Instagram o reseñas de ML.

---

#### 🟡 Hallazgos abiertos — Prioridad Media

**M-4: Sin schema de AggregateRating en productos**  
Los JSON-LD de producto no incluyen `AggregateRating`. Sin eso, Google no puede mostrar estrellas en resultados de búsqueda.  
**Fix:** Una vez con reseñas reales, agregar el bloque al include `products-jsonld.html`.

---

**M-5: Galería muestra rodillos, no resultados en arcilla**  
La sección `#galeria` dice "Mirá lo que podés crear" pero muestra fotos de los rodillos, no de piezas terminadas con texturas aplicadas. El ceramista quiere ver el resultado final.  
**Fix:** Reemplazar las 6 imágenes con fotos de piezas de arcilla/cerámica texturadas.

---

**M-6: Sin política de envíos formal**  
No hay ninguna sección con tiempos estimados, costo, transportista, ni política de daños. El comprador tiene que consultar por WA solo para saber cuándo llega.  
**Fix:** Agregar sección `#envios` en el home o página `/envios/`.

---

**M-7: Sin breadcrumb schema en páginas de categoría**  
Las páginas `/rodillos/`, `/sellos/`, etc. no tienen `BreadcrumbList` schema. Limita rich snippets en Google.

---

#### 🟢 Hallazgos abiertos — Prioridad Baja

**M-8: Detección de idioma del browser no implementada**  
Si no hay preferencia en localStorage, siempre arranca en español. Un angloparlante ve español hasta que hace click.

**M-9: Link ML con URL larga y frágil**  
La URL de MercadoLibre en `index.html:149` incluye filtros de item que pueden cambiar.

---

### 4.3 Estratégica

#### 🔴 Hallazgos abiertos — Prioridad Alta

**E-1: Sin mecanismo de retención**  
El embudo actual: tráfico → producto → WA/Instagram → venta. Sin email marketing, el 100% de los visitantes no-convertidos se pierden sin posibilidad de recuperarlos.  
**Fix prioritario:** Captura de emails + secuencia básica de bienvenida.

---

**E-2: Sin diferenciación articulada vs. competidores**  
El sitio dice "artesanales" pero no responde: ¿con qué material están hechos? ¿cuánto duran? ¿por qué valen más que los importados?  
**Fix:** Agregar en "Nosotros" o sección aparte: material, durabilidad estimada, proceso de fabricación.

---

#### 🟡 Hallazgos abiertos — Prioridad Media

**E-3: Sin política de privacidad — riesgo legal**  
GA4 trackea datos de usuarios pero no hay Privacy Policy. La Ley 25.326 argentina requiere informar sobre el tratamiento de datos.  
**Fix:** Agregar `/privacidad/` con info básica sobre cookies y GA4.

---

**E-4: Única vía de contacto por WA — punto único de falla**  
Si WhatsApp tiene un outage o el número queda inhabilitado, el sitio pierde su canal de conversión principal.  
**Fix:** Agregar email de contacto como alternativa.

---

#### 🟢 Hallazgos abiertos — Prioridad Baja

**E-5: Sin contenido para SEO orgánico**  
No hay blog ni artículos. Búsquedas como "cómo usar rodillos de textura en cerámica" no tienen contenido que posicione.

**E-6: Sin pixel de retargeting**  
No hay pixel de Facebook/Meta. Imposible hacer retargeting a visitantes que no convirtieron.

---

## 5. Plan de acción priorizado

| #  | Hallazgo                                          | Perspectiva | Prioridad | Esfuerzo | Impacto esperado                                          |
|----|---------------------------------------------------|-------------|-----------|----------|-----------------------------------------------------------|
| 1  | **T-3** Corregir URL con espacios en Moldes       | Técnica     | 🟡 Media  | S (15min)| Evita 404 en browsers estrictos                           |
| 2  | **M-3** Agregar sección de testimonios            | Marketing   | 🔴 Alta   | M (3-4h) | Aumenta confianza y conversión de nuevos visitantes       |
| 3  | **E-1** Captura de emails (formulario + popup)    | Estrategia  | 🔴 Alta   | M (4-6h) | Activa retención — los visitantes no son descartables     |
| 4  | **T-4** Activar compresión en Cloudflare          | Técnica     | 🟡 Media  | S (5min) | ~30KB menos por page load, sin tocar código               |
| 5  | **T-5** Carga diferida de Google Fonts            | Técnica     | 🟡 Media  | S (1h)   | Reduce render-blocking, mejora LCP                        |
| 6  | **M-5** Reemplazar galería con fotos de resultados| Marketing   | 🟡 Media  | M (2-3h) | Muestra el producto terminado, no el rodillo              |
| 7  | **M-6** Agregar sección/página de envíos          | Marketing   | 🟡 Media  | S (2h)   | Reduce preguntas por WA y aumenta confianza               |
| 8  | **E-2** Agregar diferenciadores de producto       | Estrategia  | 🟡 Media  | M (3h)   | Justifica el precio frente a importados                   |
| 9  | **T-6** WebP para tarjetas de categoría           | Técnica     | 🟡 Media  | S (1h)   | Reduce peso en homepage en browsers modernos              |
| 10 | **M-4** AggregateRating al schema (post-reseñas) | Marketing   | 🟡 Media  | S (1h)   | Habilita estrellas en resultados de Google                |
| 11 | **M-7** Breadcrumb schema en categorías           | Marketing   | 🟡 Media  | S (1h)   | Rich snippets en búsquedas                                |
| 12 | **E-3** Política de privacidad                    | Estrategia  | 🟡 Media  | M (2h)   | Cumplimiento Ley 25.326                                   |
| 13 | **T-9** Agregar `hreflang="x-default"`            | Técnica     | 🟢 Baja   | S (10min)| Señal de idioma más limpia para Google                    |
| 14 | **E-5** Blog con contenido SEO                    | Estrategia  | 🟢 Baja   | L        | SEO orgánico a 6-12 meses vista                           |

---

## 6. Quick wins pendientes — menos de 1 hora, alto impacto

### QW-1: Corregir URL con espacios en `index.html` (15 min)
`index.html:82`
```html
<!-- Antes -->
src="{{ '/images/moldes y cortantes/Contramolde asa x12 - costo 27.000.jpeg' | relative_url }}"

<!-- Después -->
src="{{ '/images/moldes%20y%20cortantes/Contramolde%20asa%20x12%20-%20costo%2027.000.jpeg' | relative_url }}"
```

### QW-2: Activar Brotli + Minify en Cloudflare (5 min)
Panel Cloudflare → Speed → Optimization → activar **Brotli** y **Minify** (HTML + CSS + JS). Sin tocar el repo.

### QW-3: Agregar `hreflang="x-default"` (10 min)
`_layouts/default.html:12` — agregar:
```html
<link rel="alternate" hreflang="x-default" href="{{ '/' | absolute_url }}">
```

---

## 7. Issues resueltos en este sprint

| Issue | Descripción | Commit |
|-------|-------------|--------|
| ~~T-1~~ | `docs/` excluido del build Jekyll | `67f3a27` |
| ~~M-1~~ | Alt text Botánicos corregido a "18 unidades" | `67f3a27` |
| ~~T-2~~ | H1 en layouts `category.html` y `sellos-page.html` | `67f3a27` |

---

*Revisión generada a partir de análisis directo del código fuente post-commit `67f3a27`.*
