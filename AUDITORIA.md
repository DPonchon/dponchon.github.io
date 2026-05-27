# Auditoría Integral — sasaceramica.shop

**Fecha:** 2026-05-27 (revisión ampliada con 4 perspectivas, post-commit `7fb1f60`)
**Alcance:** Repositorio completo + headers HTTP en vivo + validación JSON-LD + revisión de seguridad
**Stack:** Jekyll → GitHub Pages → Cloudflare (proxy) → GoDaddy (DNS)
**Sitio:** [sasaceramica.shop](https://sasaceramica.shop)

> **Herramientas utilizadas:** `curl -I` (headers reales), `python3 + PIL` (validación de assets), parser manual de JSON-LD, inspección directa del código. Lighthouse y html-validate no estaban disponibles en el entorno; análisis manual sobre código fuente y respuesta HTTP en vivo.

---

## 1. Resumen ejecutivo

El sitio tiene fundamentos técnicos correctos: Jekyll bien estructurado, WebP para los productos del catálogo, JSON-LD válido (verificado), Brotli activo en Cloudflare (45KB de HTML viajan como 9.4KB). En cinco sprints de ediciones se cerraron 5 de 6 issues iniciales (alt text, H1, paths con espacios, `docs/` excluido, Google Fonts diferidos).

Aún así, la auditoría ampliada identifica **tres problemas que afectan ranking, seguridad y conversión en simultáneo y que no aparecieron en la primera vuelta**:

1. **🔴 `AUDITORIA.md` está publicado e indexado.** Confirmado: `https://sasaceramica.shop/AUDITORIA/` devuelve `200 OK` y está en el sitemap. Las decisiones internas, hallazgos y debilidades del sitio son públicas y crawleables por Google.

2. **🔴 HTTP NO redirige a HTTPS.** `curl -I http://sasaceramica.shop` devuelve `200 OK` con HTML, no `301`. El sitio es accesible por HTTP plano: vulnerable a MITM en redes públicas y penaliza SEO (Google trata HTTP y HTTPS como sitios distintos, fragmentando autoridad).

3. **🔴 Las dos imágenes de portada que acabás de subir pesan 4.4 MB combinadas.** `seccion_rodillos.png` 2.4 MB y `portada.png` (Moldes) 2 MB — para mostrarse a 400×300px. Los rodillos del catálogo bajan a 200 KB en WebP; estas dos no fueron optimizadas y degradan el LCP del home.

**Tres aciertos clave:**
- Brotli activo en Cloudflare: -79% de peso transferido en el HTML del home (45KB → 9.4KB).
- JSON-LD Product/Organization/WebSite válido, parseado y bien armado (19 productos en `/rodillos/`).
- WhatsApp con mensajes pre-cargados por producto + GA4 con eventos de conversión granulares.

---

## 2. Scorecard

| Perspectiva                       | Nota   | Justificación                                                                                                       |
|-----------------------------------|--------|---------------------------------------------------------------------------------------------------------------------|
| **Técnica / UX**                  | 7/10   | Brotli + WebP + lazy load + a11y bien. Pierde por imágenes nuevas sin optimizar (4.4 MB), AUDITORIA.md publicado, CSS sin minificar en origen. |
| **Marketing / SEO**               | 6/10   | Schema válido, sitemap OK, OG/Twitter completos. Pierde por: sin LocalBusiness ni BreadcrumbList ni FAQ, sin testimonios, sin captura de email, copy generalista. |
| **Estratégica**                   | 5/10   | Canales correctos para AR. Pierde por: sin retención post-visita, sin diferenciación articulada, sin política de envíos, single point of failure en WA. |
| **Seguridad / Infra**             | 4/10   | HTTPS funciona pero no se fuerza. Cero headers de seguridad. Sin SRI en scripts externos. `.claude/` en repo. |

---

## 3. Lo que está bien hecho

### Arquitectura del proyecto
- **Jekyll + YAML data files** (`_data/rodillos.yml`, etc.) — catálogo mantenible sin tocar HTML. Agregar un producto es un bloque YAML.
- **Layouts reutilizables** (`category.html` para rodillos/moldes/herramientas; `sellos-page.html` para sellos). Código DRY.
- **`product-card.html`** como include parametrizable: maneja promos, badges, `single_size`, mensajes WA personalizados, badges visuales. Bien diseñado.
- **JSON-LD generado dinámicamente** desde los YAMLs via `products-jsonld.html` — sincronización automática entre datos y schema.

### Performance
- **Brotli activo en Cloudflare** — confirmado: `content-encoding: br` en headers. HTML 45KB → 9.4KB en transit (-79%).
- **WebP para todos los productos** — `rodillo_calaveras.webp` 205KB vs `.jpg` 612KB (-66%). Servido con `<picture>` + `<source>`.
- **`loading="eager"` en la imagen de promo** (LCP candidate en /rodillos/) y `loading="lazy"` en el resto.
- **`width` y `height` explícitos** en todas las imágenes de product-cards — previene CLS.
- **`preconnect`** a `fonts.googleapis.com` y `fonts.gstatic.com`.
- **Google Fonts diferidos** — patrón `rel="preload" ... onload="...rel='stylesheet'"` correctamente implementado en `default.html:53`, ya no bloquean render.
- **Anti-flicker script inline** para dark mode/idioma — sin FOUC en el primer paint.

### Accesibilidad
- **Skip link** (`<a href="#main-content" class="skip-link">`).
- **Mobile menu accesible**: `aria-expanded`, `aria-controls`, `role="dialog"`, cierre con `Escape`, retorno de foco al hamburger.
- **`aria-label` descriptivos** en íconos (Instagram, WhatsApp, dark mode toggle).
- **`aria-hidden="true"`** en decorativos (blobs SVG, separadores).
- **`prefers-reduced-motion`** implementado (`styles.css:1917`).
- **H1 semántico** en todas las páginas (home, categorías, 404) — corregido en este ciclo de fixes.
- **`<title>` único por página** con front matter Jekyll.

### SEO técnico
- **`robots.txt`** correcto: `Allow: /` + referencia al sitemap. Cloudflare además inyecta directivas que bloquean GPTBot/ClaudeBot/CCBot/Bytespider — protección defensiva contra scraping para training de IA.
- **`sitemap.xml`** generado por `jekyll-sitemap`, accesible y bien formado.
- **Canonical tags** en todas las páginas (`default.html:11`).
- **Open Graph completo** (`og:title`, `og:description`, `og:image` 1200×630, `og:locale`, `og:site_name`, `og:type`).
- **Twitter Card** (`summary_large_image`).
- **Schema.org JSON-LD validado**:
  - 19 `Product` con `AggregateOffer`, precios en ARS, `availability: InStock` — verificado en `/rodillos/`.
  - 1 `Organization` con `sameAs` a Instagram + `contactPoint`.
  - 1 `WebSite`.
  - Sintaxis JSON válida (parseada exitosamente).
- **URLs limpias** sin parámetros (`/rodillos/`, `/sellos/`).
- **`docs/` excluido del build** — los specs internos ya no se publican.

### Conversión / UX
- **WhatsApp con mensajes pre-cargados por producto**: ej. `"Hola! Me interesa el Rodillo Calaveras de su web. ¿Tienen disponible?"`. El cliente no escribe nada.
- **Barra de envíos siempre visible** con links a WA e Instagram.
- **WA FAB** móvil — acceso de 1 tap.
- **MercadoLibre con flujo de 3 pasos** explicado en el home.
- **Dark mode** con persistencia en localStorage + respeto a `prefers-color-scheme`.
- **Bilingüe (ES/EN)** con toggle en navbar y menú móvil.
- **GA4 con eventos de conversión granulares**: `consulta_whatsapp` y `consulta_instagram` por producto, `cta_principal_whatsapp`, `seccion_vista`.

### Seguridad
- **HTTPS funcional** con certificado válido (TLS verify OK).
- **HTTP/2** activo.
- **No hay secretos hardcodeados** en JS/HTML/YAML — único ID público es el GA4 measurement ID (`G-8PCR39MRTB`), que es by-design público.
- **`.gitignore`** incluye `_site/`, `.sass-cache/`, `.jekyll-cache/`, `vendor/`, `.bundle/` — evita versionar artefactos de build.
- **Cloudflare como proxy** — protección DDoS básica + WAF gratuito + bot fight contra crawlers de IA.
- **`rel="noopener noreferrer"`** en todos los enlaces externos con `target="_blank"`.

---

## 4. Hallazgos por perspectiva

---

### 4.1 Técnica y UX

#### 🔴 Prioridad Alta

**T-1: `AUDITORIA.md` está publicado e indexado**
Confirmado en producción:
```
$ curl -I https://sasaceramica.shop/AUDITORIA/
HTTP/2 200
$ curl https://sasaceramica.shop/sitemap.xml | grep AUDITORIA
<loc>https://sasaceramica.shop/AUDITORIA/</loc>
```
El sitemap incluye la auditoría → Google probablemente ya la crawleó. Toda la lista de debilidades del negocio es pública.

**Fix inmediato:**
1. Agregar front matter a `AUDITORIA.md` para que Jekyll lo trate como private:
   ```yaml
   ---
   sitemap: false
   ---
   ```
2. **O** (más simple) agregar a `_config.yml`:
   ```yaml
   exclude:
     - AUDITORIA.md
     - docs
     ...
   ```
3. Pedir reindexación / remover URL en Google Search Console.

---

**T-2: Imágenes recién subidas sin optimizar (4.4 MB)**
`images/seccion_rodillos.png` — **2.4 MB**, 1448×1086 px → se renderiza a 400×300.
`images/moldes y cortantes/portada.png` — **2 MB**, 1122×1402 px → se renderiza a 400×300.

Comparativa con resto del catálogo:
| Imagen | Peso | Dimensiones |
|---|---|---|
| `rodillo_calaveras.webp` | 205 KB | OK |
| **`seccion_rodillos.png`** | **2.4 MB** | 12× más pesada |
| **`portada.png` (moldes)** | **2 MB** | 10× más pesada |

Estas imágenes están above-the-fold en la home → degradan LCP significativamente.

**Fix:**
```bash
cwebp -q 82 -resize 800 0 images/seccion_rodillos.png -o images/seccion_rodillos.webp
cwebp -q 82 -resize 800 0 "images/moldes y cortantes/portada.png" -o "images/moldes y cortantes/portada.webp"
```
Y actualizar `index.html:69` y `:82` para usar `<picture>` con `<source type="image/webp">`. Objetivo: ~150 KB cada una. **Ahorro: ~4 MB en el primer load del home**.

---

**T-3: `promocion_sasa.png` de 6.6 MB en el repo**
6.612 KB, 2754×1536 px. La versión `.webp` (205 KB) sí se sirve via `<picture>`, pero el `.png` original sigue en el repo y se descarga en browsers sin soporte WebP (IE 11, browsers muy viejos). Más relevante: pesa en el `git clone` y deploys.

**Fix:** Convertir el `.png` a JPG comprimido (~200-300 KB) o eliminarlo si la `.webp` cubre el 99% del tráfico.

---

#### 🟡 Prioridad Media

**T-4: CSS no minificado en origen (52 KB)**
`css/styles.css` — 2413 líneas, 52 KB. Brotli lo lleva a ~10 KB en transit (excelente), pero el archivo en GitHub Pages es el original. No es crítico dado que Brotli compensa, pero un pre-commit hook que minifique reduciría ~30 KB de footprint en cache de browsers que ignoran Brotli.

---

**T-5: Sin WebP en tarjetas de categoría (homepage)**
`index.html:69, 82, 95, 107`: los 4 category cards usan `<img>` o `<picture>` sin `<source type="image/webp">`. Los product-cards generados por el include sí tienen WebP.

**Fix:** Crear versiones `.webp` y usar `<picture><source srcset="...webp" type="image/webp"><img src="...jpg"></picture>`. Combinable con el fix de T-2.

---

**T-6: OG image (`preview.jpg`) 397 KB**
`images/preview.jpg` — 2848×1494 px, 397 KB. Dimensiones excedidas para OG (recomendado 1200×630 exacto).

**Fix:** Redimensionar a 1200×630 y comprimir a JPG quality 80 → ~80-100 KB.

---

**T-7: Logo visual ausente del diseño**
`images/logo_sasa.jpeg` (187 KB) está en el repo pero no se usa en ningún template. El logo del navbar es texto HTML puro. No es bug, pero el archivo está pesando sin uso, y la marca podría beneficiarse de un identificador visual.

---

**T-8: Imágenes huérfanas en el repo**
Verificado con grep contra HTML/YAML/CSS/JS:
- `rodillos_card.jpg` (351 KB) — reemplazada por `seccion_rodillos.png`, ya no se referencia.
- `rodillos_sin_logo.jpg` (578 KB) — nunca se referenció.
- `logo_sasa.jpeg` (187 KB) — ver T-7.

Total: ~1.1 MB de dead weight versionado.

---

**T-9: Jerarquía de headings en `sellos-page.html`**
H1 (título de página) → H3 (subsección "Personalizados" / "Diseños Predefinidos") → H3 (nombre del producto dentro del card). El producto debería ser H4 dentro de una subsección H3.

---

**T-10: Filenames con espacios y caracteres especiales**
`images/herramientas/Roller bolitas - costo 25.000.jpeg`, `Compas costo 6.000.jpeg`, etc. Funcionan pero son frágiles para URLs y CDNs.

**Fix a mediano plazo:** Renombrar con kebab-case: `roller-bolitas.jpeg`, `compas.jpeg`.

---

#### 🟢 Prioridad Baja

**T-11: Cache control conservador**
`cache-control: max-age=600` (10 min) sobre el HTML del home. GitHub Pages no permite configurar esto. Asegurate al menos que assets versionados (CSS `?v=19`, JS `?v=2`) tengan cache largo en Cloudflare (Page Rules → Cache Everything con TTL alto para `/css/*` y `/js/*`).

**T-12: Listener de scroll duplicado en `main.js`**
`main.js:194` añade un segundo listener de scroll para el caso "estar en hero", redundante con el `sectionObserver`. Sin impacto medible.

---

### 4.2 Marketing y SEO

#### ✅ Reconocimiento previo
Schema.org Product/Organization/WebSite, sitemap auto-generado, OG/Twitter cards, canonical tags, GA4 con eventos, WA pre-loaded — todo bien (ver sección 3).

#### 🔴 Prioridad Alta

**M-1: AUDITORIA.md indexada en sitemap** — duplicado con T-1 pero impacto SEO crítico: Google está crawleando un documento que enumera debilidades. Penaliza percepción de marca si alguien lo encuentra.

---

**M-2: Sin BreadcrumbList schema**
Páginas de categoría (`/rodillos/`, `/sellos/`, etc.) no exponen breadcrumbs estructurados. Google los usa para mostrar la jerarquía en SERPs en lugar de la URL plana.

**Fix:** Agregar al layout `category.html`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Inicio", "item": "{{ '/' | absolute_url }}"},
    {"@type": "ListItem", "position": 2, "name": "{{ page.section_title }}", "item": "{{ page.url | absolute_url }}"}
  ]
}
</script>
```

---

**M-3: Sin FAQPage schema**
Búsquedas como *"cómo limpiar rodillos de cerámica"*, *"qué grosor de arcilla usar con rodillo de textura"*, *"diferencia entre rodillo de relieve y de hueco"* tienen alta intención y poca competencia. Una FAQ con FAQPage schema captura tráfico de cola larga y aparece como rich snippet.

**Fix:** Crear `/preguntas-frecuentes/` con 8-15 Q&A y marcado FAQPage. Esfuerzo: 4-6h primera vez.

---

**M-4: Sin LocalBusiness schema**
Aunque el catálogo se envía a todo el país, una entidad LocalBusiness (con `areaServed: AR`, `address` aunque sea Buenos Aires sin calle exacta) ayuda a aparecer en búsquedas con intención local *"rodillos cerámica buenos aires"*, *"sellos arcilla Argentina"*.

**Fix:** Reemplazar el bloque `Organization` actual por:
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Sasa Cerámica",
  "image": "https://sasaceramica.shop/images/preview.jpg",
  "url": "https://sasaceramica.shop",
  "telephone": "+54-9-11-7239-1639",
  "areaServed": {"@type": "Country", "name": "Argentina"},
  "address": {"@type": "PostalAddress", "addressCountry": "AR", "addressRegion": "Buenos Aires"},
  "sameAs": ["https://www.instagram.com/sasa.ceramica/"]
}
```

---

**M-5: Copy genérico, no orientado a long-tail**
Los `description` de los productos hablan de estética ("Delicadas mariposas que transforman cualquier superficie...") pero no responden a queries reales:
- "¿qué medida de rodillo conviene para taza?"
- "¿el rodillo Calaveras sirve para porcelana?"
- "¿se puede esterilizar?"

Cada producto debería tener un bloque con: **uso recomendado** (vajilla / decorativo / souvenirs), **materiales compatibles** (arcilla / porcelana / porcelana fría / polímero), **medida ideal** según tipo de pieza.

**Fix:** Expandir `desc` en `_data/rodillos.yml` con 2-3 frases de uso recomendado por producto. Esto también enriquece el JSON-LD Product.

---

#### 🟡 Prioridad Media

**M-6: Sin testimonios visibles**
Sin prueba social real. Los badges "Más Vendido" / "Popular" son auto-declarados. Para una marca chica sin reputación SEO consolidada, los testimonios son el principal driver de conversión.

**Fix:** Sección `#testimonios` con 4-6 capturas/citas reales de DMs de Instagram o reseñas de ML. Marcar con `Review` schema cuando haya 5+.

---

**M-7: Galería no muestra el resultado real**
La sección "Mirá lo que podés crear" muestra fotos de los rodillos, no de las texturas impresas en piezas terminadas. Quien busca un rodillo quiere ver el efecto en cerámica, no el cilindro.

**Fix:** Reemplazar las 6 fotos por imágenes de piezas terminadas con texturas aplicadas. Esto también mejora el ratio de descripción de imagen relevante a keywords visuales ("textura mariposas arcilla", "ceramica con monstera estampada").

---

**M-8: Sin AggregateRating en Product schema**
Sin estrellas, sin rich snippets en SERPs. Una vez que haya 5+ testimonios reales, agregar al JSON-LD:
```json
"aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "47"}
```

---

**M-9: Sin captura de email**
Embudo actual: tráfico → producto → WA. Visitantes no convertidos se pierden 100%. Una secuencia básica (Mailchimp/Brevo free + popup exit-intent + formulario en footer) recupera 5-15% típicamente.

---

**M-10: Sin verificación de Google Search Console visible**
No hay `<meta name="google-site-verification">` ni archivo `.html` de verificación en `/.well-known/`. Probablemente esté verificado por DNS (lo cual es lo correcto), pero confirmá que GSC esté conectado para monitorear cobertura, queries y Core Web Vitals reales.

---

**M-11: Sin política/sección de envíos**
La barra superior dice "Envíos a todo Argentina" pero sin tiempos, costos ni transportista. Reduce confianza y genera consultas innecesarias por WA. Una sección `#envios` o página `/envios/` con tabla de tiempos por provincia + envío gratis >$30.000 ya está claro.

---

#### 🟢 Prioridad Baja

**M-12: `hreflang="x-default"` ausente** — `default.html:12` solo declara `es-AR`. Para sitios bilingües (aunque el switch sea client-side), Google recomienda incluir x-default.

**M-13: Detección de idioma del browser no implementada** — `i18n.js` arranca siempre en español si no hay preferencia. Un visitor con `navigator.language === "en"` debería ver inglés por default.

**M-14: Twitter card sin `twitter:site`** — sin cuenta declarada. Si no hay X/Twitter de la marca, ignorar.

**M-15: Cache-busting de CSS manual (`?v=19`)** — propenso a olvidos cuando se edita CSS. Hash automático en Jekyll con un plugin como `jekyll-asset-hash` resolvería esto.

---

### 4.3 Estratégica

#### 🔴 Prioridad Alta

**E-1: Cero retención post-visita**
El visitante que no convierte hoy está perdido. Sin email, sin notificaciones push, sin retargeting, sin secuencia de nurturing. Esto es el mayor leak del embudo actual y el de mayor ROI a 6 meses.

**Fix mínimo viable:**
1. Mailchimp free (hasta 500 contactos) o Brevo free.
2. Formulario en footer + popup exit-intent.
3. Secuencia de bienvenida de 3 emails (descuento 10% + galería de inspiración + "cómo elegir tu primer rodillo").

---

**E-2: Sin diferenciación articulada vs. importados**
El sitio dice "artesanales" pero no responde:
- ¿Qué material? (PLA, PETG, resina, ¿food-safe?)
- ¿Cuánto duran? (¿soportan 100 usos? ¿1000?)
- ¿Compatibles con qué arcilla? (high-fire, low-fire, porcelana)
- ¿Por qué $10.000 cuando hay genéricos chinos a $2.000?

Sin estos datos, el cliente arma su propia hipótesis (riesgo: rebote a opciones más baratas).

**Fix:** Sección "Por qué Sasa" en home + bloque de specs técnicos por producto en la página de categoría.

---

#### 🟡 Prioridad Media

**E-3: Sin contenido propio para SEO orgánico**
Búsquedas como *"tutorial rodillo textura cerámica"*, *"cómo firmar piezas de arcilla"*, *"texturas para vajilla artesanal"* tienen volumen y baja competencia. El sitio no posiciona para ninguna porque no hay contenido.

**Fix:** Blog en `/blog/` con 1 artículo por mes. Tutoriales con uso de productos propios — doble valor: SEO + venta consultiva. ROI esperado: 6-12 meses.

---

**E-4: Política de privacidad inexistente**
GA4 trackea visitas (cookies) sin Privacy Policy ni banner de consentimiento. La Ley 25.326 (AR) y, si vendes a Europa/Italia, GDPR exigen informar. No es ilegal per se en AR pero te expone si recibís un reclamo formal.

**Fix:** Página `/privacidad/` con uso de cookies + GA4. Banner de consentimiento si tu tráfico tiene componente europeo (Italia mencionado en el contexto).

---

**E-5: Único canal de conversión = WhatsApp**
Si tu número WA queda inhabilitado o tenés un día sin internet, perdiste la única vía de contacto formal. No hay email visible.

**Fix:** Agregar email de contacto (puede ser Gmail dedicado) en footer + Schema Organization. Costo: 10 min.

---

**E-6: Escalabilidad de precios manual**
40+ SKUs con precios hardcodeados en YAML. Con inflación AR, esto se actualiza muy seguido. Hoy es manejable pero a 100 SKUs es ingobernable.

**Fix a 6 meses:** Decap CMS (gratis, frontend para Jekyll), o pasar el catálogo a un Google Sheet → YAML automático via GitHub Action.

---

#### 🟢 Prioridad Baja

**E-7: Sin retargeting (Meta Pixel / TikTok Pixel)** — los visitantes que no convirtieron no pueden ser alcanzados con anuncios. Solo agregar si hay presupuesto de ads activo.

**E-8: Sin programa de recompra** — los ceramistas vuelven a comprar más rodillos. Un descuento de 10% por segunda compra (cupón en email post-compra) tiene altísimo ROI.

---

### 4.4 Seguridad e Infraestructura

#### 🔴 Prioridad Alta

**S-1: HTTP NO redirige a HTTPS**
Verificación en vivo:
```
$ curl -I http://sasaceramica.shop
HTTP/1.1 200 OK   ← debería ser 301
```
El sitio responde por HTTP plano. Implicaciones:
- **Seguridad:** Conexión vulnerable a MITM en redes públicas (cafés, aeropuertos). Un atacante puede inyectar JS en respuestas HTTP.
- **SEO:** Google trata HTTP y HTTPS como sitios distintos. Si links externos apuntan a `http://...`, fragmentás autoridad.
- **Privacidad:** Toda la navegación visible al ISP.

**Fix (5 min, sin código):** En Cloudflare → SSL/TLS → Edge Certificates → activar **"Always Use HTTPS"** + **"Automatic HTTPS Rewrites"**. Verificá también que el modo SSL/TLS esté en **"Full (strict)"**.

---

**S-2: Cero headers HTTP de seguridad**
Verificado en headers reales (`curl -I`):
| Header | Valor actual | Recomendado |
|---|---|---|
| `Strict-Transport-Security` | ❌ ausente | `max-age=31536000; includeSubDomains; preload` |
| `Content-Security-Policy` | ❌ ausente | Política restrictiva (ver fix) |
| `X-Frame-Options` | ❌ ausente | `DENY` |
| `X-Content-Type-Options` | ❌ ausente | `nosniff` |
| `Referrer-Policy` | ❌ ausente | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | ❌ ausente | `geolocation=(), camera=(), microphone=()` |

**Fix:** GitHub Pages no permite headers custom directos, pero **Cloudflare → Rules → Transform Rules → HTTP Response Header Modification** sí. Una regla para `*sasaceramica.shop/*` que agregue todos los headers de arriba. Configuración 30-45 min.

CSP sugerida (compatible con GA4 + Google Fonts + WhatsApp):
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https://www.google-analytics.com;
connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

---

**S-3: Sin Subresource Integrity (SRI) en scripts externos**
`default.html:39`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8PCR39MRTB"></script>
```
Y Google Fonts CSS sin `integrity`. Si Google Tag Manager o Google Fonts CDN son comprometidos, código arbitrario corre en los browsers de tus usuarios.

**Realidad práctica:** SRI no aplica bien a recursos versionados como GTM (cambia su contenido) o Fonts API (versiona dinámicamente). Para esos, el riesgo se mitiga con CSP restrictiva (S-2) que limita qué scripts pueden ejecutar. Mencionado por completitud pero **dejar a S-2 cubrir esto**.

---

#### 🟡 Prioridad Media

**S-4: `.claude/settings.local.json` versionado en git**
```
$ git ls-files .claude/
.claude/settings.local.json
```
El archivo contiene reglas de permisos locales para Claude Code, con paths absolutos del filesystem del autor (`/Users/nazareno/...`). No es un secreto crítico pero:
- Expone tu username de macOS.
- Configuración local pollutes el repo.
- Convención de Claude: este archivo es por-máquina, no por-proyecto.

**Fix:**
```bash
echo ".claude/settings.local.json" >> .gitignore
git rm --cached .claude/settings.local.json
git commit -m "Stop tracking local Claude settings"
```

---

**S-5: Sin `security.txt` en `.well-known/`**
`https://sasaceramica.shop/.well-known/security.txt` devuelve 404. No es crítico para un sitio sin formulario de pago, pero es buena práctica para responsables disclosure.

**Fix:** Crear `.well-known/security.txt`:
```
Contact: mailto:contacto@sasaceramica.shop
Preferred-Languages: es, en
Expires: 2027-12-31T23:59:59Z
```

---

**S-6: Sin DNSSEC verificado**
No se validó en este audit pero conviene chequear en GoDaddy si DNSSEC está activo. Protege contra envenenamiento de caché DNS / hijacking del dominio. Cloudflare puede activarlo si el registrar lo soporta.

---

#### 🟢 Prioridad Baja

**S-7: GA4 measurement ID expuesto** — `G-8PCR39MRTB` está en el HTML. Es by-design público (todos los GA4 lo son), no es secreto. Solo nota: configurá filtros de IP propia en GA4 para no contaminar métricas con tus propias visitas.

**S-8: `access-control-allow-origin: *` en headers** — viene de GitHub Pages, permite que cualquier dominio pueda hacer fetch del HTML. Para un sitio público estático sin datos sensibles, es aceptable.

**S-9: Server identificadores visibles** — Headers exponen `Server: cloudflare`, `X-GitHub-Request-Id`, `X-Served-By: cache-eze...`, `X-Fastly-Request-Id`. Información sobre el stack pero ninguna explotable.

---

## 5. Plan de acción priorizado

| #  | Hallazgo                                                  | Perspectiva | Prioridad | Esfuerzo | Impacto                                                       |
|----|-----------------------------------------------------------|-------------|-----------|----------|---------------------------------------------------------------|
| 1  | **T-1/M-1** Excluir AUDITORIA.md del build                | Téc/SEO     | 🔴 Alta   | S (5min) | Quita documento privado del índice de Google                  |
| 2  | **S-1** Activar "Always Use HTTPS" en Cloudflare          | Seguridad   | 🔴 Alta   | S (5min) | Fuerza HTTPS, unifica autoridad SEO, cierra MITM              |
| 3  | **T-2** Optimizar `seccion_rodillos.png` + `portada.png`  | Técnica     | 🔴 Alta   | S (15min)| -4 MB en primer load del home, mejora LCP                     |
| 4  | **S-2** Headers de seguridad via Cloudflare Transform     | Seguridad   | 🔴 Alta   | M (45min)| HSTS + CSP + X-Frame + nosniff. Saltás de F a A en securityheaders.com |
| 5  | **E-1** Captura de email + secuencia bienvenida           | Estrategia  | 🔴 Alta   | M (4-6h) | Activa retención, ROI alto a 3-6 meses                        |
| 6  | **M-6** Sección de testimonios                            | Marketing   | 🔴 Alta   | M (3-4h) | Aumenta conversión de nuevos visitantes                       |
| 7  | **M-4** LocalBusiness schema                              | SEO         | 🟡 Media  | S (30min)| Captura búsquedas locales                                     |
| 8  | **M-2** BreadcrumbList schema                             | SEO         | 🟡 Media  | S (1h)   | Rich snippets en SERPs                                        |
| 9  | **M-3** FAQ page con FAQPage schema                       | SEO         | 🟡 Media  | M (4-6h) | Tráfico de long-tail + rich snippets                          |
| 10 | **M-5** Expandir descripciones de producto con uso        | SEO/Copy    | 🟡 Media  | M (3-4h) | Mejora SEO on-page + reduce dudas pre-venta                   |
| 11 | **E-2** Sección "Por qué Sasa" con specs técnicos         | Estrategia  | 🟡 Media  | M (3h)   | Justifica precio frente a importados                          |
| 12 | **M-7** Reemplazar galería con resultados en arcilla      | Marketing   | 🟡 Media  | M (2-3h) | Mejora conversión y valor visual                              |
| 13 | **M-11** Sección/página de envíos                         | Marketing   | 🟡 Media  | S (2h)   | Reduce fricción y consultas innecesarias                      |
| 14 | **E-4** Política de privacidad                            | Estrategia  | 🟡 Media  | M (2h)   | Cumplimiento Ley 25.326 + GDPR si aplica                      |
| 15 | **T-5** WebP en tarjetas de categoría                     | Técnica     | 🟡 Media  | S (1h)   | -300-500 KB en homepage                                       |
| 16 | **S-4** `.claude/settings.local.json` → .gitignore        | Seguridad   | 🟡 Media  | S (5min) | Limpia repo de config local                                   |
| 17 | **T-6** Reducir `preview.jpg` a 1200×630 optimizado       | Técnica     | 🟡 Media  | S (15min)| OG image más liviana                                          |
| 18 | **E-3** Blog SEO con tutoriales                           | Estrategia  | 🟢 Baja   | L        | ROI orgánico 6-12 meses                                       |
| 19 | **E-6** Decap CMS o GSheet → YAML                         | Estrategia  | 🟢 Baja   | L        | Escalabilidad operativa a 100+ SKUs                           |
| 20 | **T-8** Limpiar imágenes huérfanas del repo               | Técnica     | 🟢 Baja   | S (10min)| -1.1 MB en el repo                                            |

---

## 6. Quick wins — menos de 1 hora, alto impacto

### QW-1: Despublicar AUDITORIA.md (5 min) — **HACER YA**
`_config.yml`:
```yaml
exclude:
  - AUDITORIA.md
  - docs
  - Gemfile
  ...
```
Commit + push. En GSC: Eliminar URL `https://sasaceramica.shop/AUDITORIA/`.

### QW-2: Forzar HTTPS en Cloudflare (5 min)
Cloudflare dashboard → SSL/TLS → Edge Certificates:
- **Always Use HTTPS** → ON
- **Automatic HTTPS Rewrites** → ON
- Verificá modo SSL/TLS en **Full (strict)**.

### QW-3: Optimizar las dos imágenes nuevas (15 min)
```bash
cd images
cwebp -q 82 -resize 800 0 seccion_rodillos.png -o seccion_rodillos.webp
cd "moldes y cortantes"
cwebp -q 82 -resize 800 0 portada.png -o portada.webp
```
Actualizar `index.html` para usar `<picture>` con WebP source. Impacto: -4 MB en home.

### QW-4: HSTS header en Cloudflare (10 min)
Cloudflare → SSL/TLS → Edge Certificates → HTTP Strict Transport Security (HSTS) → Enable.
Configuración recomendada: max-age 6 meses, includeSubDomains, sin preload inicialmente.

### QW-5: Excluir `.claude/` del repo (5 min)
```bash
echo ".claude/" >> .gitignore
git rm -rf --cached .claude/
git commit -am "Stop tracking local Claude config"
```

### QW-6: `hreflang="x-default"` (5 min)
`_layouts/default.html:12`:
```html
<link rel="alternate" hreflang="x-default" href="{{ '/' | absolute_url }}">
```

### QW-7: Verificar que `preconnect` a Cloudflare no sea redundante (5 min)
El navbar tiene `dns-prefetch` a Instagram. Considerá agregar `preconnect` a `https://wa.me` también si querés acelerar el primer click WA.

---

## 7. Roadmap de posicionamiento — 30 / 60 / 90 días

### Sprint 0 (esta semana) — Cerrar fugas
- QW-1 a QW-7 — todos los quick wins de la sección 6.
- Verificar Google Search Console: que `sasaceramica.shop` esté verificado y que el sitemap esté indexado. Pedir reindexación manual de las páginas principales.
- Crear cuenta de email transaccional (Gmail dedicado) y publicarlo en footer.

### Mes 1 — Confianza y conversión
- **Testimonios** (M-6): 4-6 testimonios reales en home + Review schema.
- **LocalBusiness + BreadcrumbList schema** (M-4 + M-2).
- **Sección "Por qué Sasa"** (E-2): material, durabilidad, compatibilidad de arcillas.
- **Captura de email** (E-1): Mailchimp free + popup exit-intent + formulario footer.
- **Política de envíos** (M-11) + **Política de privacidad** (E-4).
- Activar Brotli + Headers de seguridad si no se hizo en Sprint 0 (S-2).

### Mes 2 — SEO de contenido
- **FAQ page** con FAQPage schema (M-3): 10-15 preguntas de las que más te llegan por WA.
- **Expandir descripciones de producto** (M-5): bloque de uso recomendado por producto en YAML.
- **Reemplazar galería** con resultados reales (M-7).
- **Primer post de blog** (E-3): "Cómo elegir tu primer rodillo de textura" — apuntando a una palabra clave informacional.
- Configurar Search Console alerts para errores de cobertura.

### Mes 3 — Crecimiento y escalado
- **2 posts más de blog** — uno tutorial, uno comparativo ("rodillo de textura vs sello para firmar piezas").
- **Implementar AggregateRating** una vez con 5+ reseñas reales.
- Evaluar **Meta Pixel** si se va a hacer ads en Instagram (anuncia retargeting).
- Auditar Core Web Vitals reales en GSC y optimizar si LCP > 2.5s.
- Si el catálogo creció >50 SKUs: planificar Decap CMS o Google Sheets → YAML.

### Métricas de éxito a 90 días
| Métrica | Baseline (estimado) | Objetivo 90d |
|---|---|---|
| Páginas indexadas en Google | 5 | 15+ (con blog + FAQ) |
| LCP del home (móvil) | ~3-4s (estimado con imágenes 2-6 MB sin optimizar) | <2.5s |
| Lista de email | 0 | 100+ |
| Testimonios visibles | 0 | 5+ |
| Score `securityheaders.com` | F | A o A+ |
| Conversiones WhatsApp tracked (GA4) | desconocido | medir baseline, +30% |

---

*Auditoría generada por análisis directo del código fuente, headers HTTP en vivo (`curl -I`), y validación manual de JSON-LD. Cierre del informe: `7fb1f60`.*
