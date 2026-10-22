---
name: design-md
description: 73 sistemas de diseño DESIGN.md de marcas reales (Stripe, Linear, Apple, Vercel, Notion, Airbnb, Figma, Framer, Spotify…) para diseñar o construir una interfaz «como X» / "in the style of X". Usar cuando se pida UI con el estilo de una marca o web conocida, comparar sistemas de diseño, buscar referencias de paleta, tipografía o componentes, o crear el DESIGN.md de un proyecto a partir de una referencia.
---

# design-md

Colección [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md), clonada en local. Cada marca tiene un `DESIGN.md` en formato Google Stitch con 9 secciones: tema visual, paleta y roles, tipografía, componentes, layout, profundidad, qué hacer y qué evitar, responsive y una guía de prompts para agentes.

Ruta: `~/.claude/repos/VoltAgent__awesome-design-md/design-md/<marca>/DESIGN.md`

## Cómo usarla

1. **Encuentra la referencia.** Lista las marcas disponibles con `ls ~/.claude/repos/VoltAgent__awesome-design-md/design-md/`. Algunas carpetas llevan dominio (`linear.app`, `mistral.ai`, `x.ai`) o año (`dell-1996`, `nintendo-2001`).
2. **Lee el `DESIGN.md` completo** antes de diseñar. Si el usuario no nombra una marca, propone dos o tres que encajen con el brief y explica por qué.
3. **Aplícalo como dirección, no como copia.** Toma la paleta, la tipografía, el ritmo de espaciado, los radios, las sombras y los patrones de componentes, y adáptalos al contenido y a la marca del cliente.
4. **Si el estilo debe persistir en el proyecto**, copia el archivo a la raíz como `DESIGN.md` y anota de qué referencia viene y qué se cambió. Otras skills (`hermes-design-md`, `impeccable`, `ui-craft`) leen ese archivo.
5. **Para mezclar referencias**, deja claro qué se toma de cada una (por ejemplo, tipografía de Stripe y densidad de Linear) para que el resultado sea un sistema propio.

## Límites

- Son análisis del estilo público de cada web, no material oficial de esas empresas. No digas que un diseño está aprobado por la marca ni lo presentes como suyo.
- No reproduzcas logos, ilustraciones, fotografías ni textos de esas marcas. Úsalas como referencia de estilo.
- Para trabajo de estudio, la referencia es el punto de partida. El sistema final debe ser propio del cliente.

## Actualizar

`bash ~/.claude/repos/estudio.sh --actualizar` hace `git pull` de este repo y de los demás.
