# Sellos Page Design

**Date:** 2026-05-26  
**Status:** Approved

## Overview

Add product content to the existing `/sellos/` page. The page shows two types of stamps (sellos) in a single unified view: personalizados first, predefinidos second.

## Files

| File | Action |
|------|--------|
| `sellos.html` | Change `layout: category` → `layout: sellos-page`; update front matter |
| `_layouts/sellos-page.html` | Create — custom two-section layout |
| `_data/sellos_predefinidos.yml` | Create — product data for predefined stamps |

## Page Structure

```
<section class="section productos productos--page">
  <div class="section__header">
    eyebrow / title / divider / desc

  ── Personalizados ──────────────────────────────
  Single wide card (not in grid):
    - Row of 3 example images (images/sellos/personalizados/)
    - Name + service description
    - Price: $6.000 c/u (shown once)
    - [WhatsApp] [Instagram] buttons

  ── Predefinidos ────────────────────────────────
  Sub-heading: "Diseños Predefinidos"
  productos__grid with product-card.html includes:
    - Botánicos: 17 unidades, $16.000
```

## Layout: `_layouts/sellos-page.html`

- Extends `layout: default`
- Section header pulled from front matter (same fields as `category.html`)
- Personalizados card: hardcoded image paths, price, WA/IG buttons; reuses existing CSS classes (`producto-card__body`, `btn btn--whatsapp`, `btn btn--instagram`)
- Predefinidos: iterates `site.data.sellos_predefinidos` via `product-card.html` include, same as other category pages
- Images use `relative_url` filter, paths start with `/images/...`

## Data: `_data/sellos_predefinidos.yml`

```yaml
- slug: sello-botanicos
  name: "Botánicos"
  desc: "Un set de sellos con motivos botánicos para firmar y personalizar tus piezas de cerámica con diseños de hojas y flores."
  single_size:
    badge_text: "17 unidades"
    price: "$16.000"
  image:
    src: "/images/sellos/predefinidos/botanicos_17_unidades_16_mil_pesos.png"
    alt: "Set de sellos botánicos para cerámica — 17 unidades — Sasa Cerámica"
  wa_text: "Hola!%20Me%20interesa%20el%20set%20de%20Sellos%20Bot%C3%A1nicos%20de%20su%20web.%20%C2%BFTienen%20disponible%3F"
```

Uses `single_size` (existing field in `product-card.html`) instead of S/M/L sizes. `dims` is omitted since predefined stamps have no physical dimensions to display.

## Personalizados Card

- Images: `sello_1.png`, `sello_2.png`, `sello_3.png` from `images/sellos/personalizados/`
- 3 images displayed in a flex row
- Reuses existing CSS classes; no new styles added
- Price shown once: $6.000 c/u
- WhatsApp message: asks about custom stamp service
- CTA label: "Pedir el mío"

## Constraints

- CSS mínimo: reusar clases existentes. Solo se agrega lo necesario para el contenedor flex de las 3 imágenes de personalizados
- No changes to `category.html`, `product-card.html`, or any shared includes
- Consistent with existing section/card visual language
- Image paths use `/images/...` with `relative_url` filter
