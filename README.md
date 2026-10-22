# Skills y agentes del estudio

Instalado el 1 oct 2026 a partir del inventario de skills y agentes:
https://claude.ai/artifact/2sd7ek1xVhooefHHbwi7jo

Este repo es la copia de seguridad del estudio: guarda las skills propias, la lista de todo lo demás y el mapa de cómo encaja cada pieza. Las skills de terceros no se suben: `estudio.sh` las descarga de sus repos originales.

> **Visibilidad:** el repo es **público** en GitHub. No subas aquí claves, datos de clientes ni nada que no publicarías.

## El mapa

**[`mapa/MAPA.md`](mapa/MAPA.md)** es todo lo que usa Claude en el estudio y en el portfolio, como un grafo: qué decide sobre qué, quién delega en quién y qué valida cada resultado. Incluye:

- **Vista de capas:** fuentes de verdad, proyecto, estudio, conectores y lo incluido en Claude Code.
- **Núcleo del portfolio:** de `PRODUCT.md` a Vercel.
- **6 flujos de trabajo:** caso, vídeo para LinkedIn, candidatura, evaluar un repo externo, discovery y revisión semanal.
- **Solapes:** qué pieza gana cuando dos hacen lo mismo.
- **Automatizaciones pendientes**, por prioridad.

La fuente es [`mapa/grafo.json`](mapa/grafo.json). Para cambiar el mapa, edita el JSON y ejecuta:

```bash
node mapa/generar.mjs          # valida el grafo y regenera mapa/MAPA.md y skills/CATALOGO.md
node mapa/generar.mjs --check  # solo comprueba (falla si algo está desfasado)
```

El generador falla si una arista apunta a un nodo que no existe, si una carpeta de `skills/` no está en el grafo o si los grupos de agentes no cuadran con `agentes.txt`.

Necesita Node 18 o superior, sin dependencias. Si el Mac sigue sin Node, Claude lo regenera en una sesión en la nube.

## En un ordenador nuevo

1. Clona el repo y ejecuta el script:

```bash
git clone https://github.com/vctrmz/claude-estudio.git ~/.claude/repos/vctrmz__claude-estudio
bash ~/.claude/repos/vctrmz__claude-estudio/estudio.sh
```

El script clona los repos de `fuentes.txt`, enlaza las skills en `~/.claude/skills` y copia los agentes en `~/.claude/agents`.

## Cómo está organizado

```
~/.claude/
├── repos/                        ← un clon de GitHub por fuente
│   ├── vctrmz__claude-estudio/   ← este repo
│   │   ├── estudio.sh            ← la selección completa: qué se clona, qué se enlaza y qué se copia
│   │   ├── fuentes.txt           ← los repos de terceros que se clonan
│   │   ├── agentes.txt           ← los 62 agentes elegidos de agency-agents
│   │   ├── mapa/                 ← el grafo (grafo.json), su generador y MAPA.md
│   │   └── skills/<categoría>/   ← las 40 skills propias, en 6 categorías (ver skills/CATALOGO.md)
│   └── <dueño>__<repo>/
├── skills/                       ← lo que Claude carga: todo son enlaces a repos/, planos
├── agents/                       ← los 62 agentes (copiados desde agency-agents)
└── archivo/                      ← versiones retiradas (ui-ux-pro-max-v1)
```

- **Instalar o rehacer los enlaces:** `bash ~/.claude/repos/vctrmz__claude-estudio/estudio.sh`
- **Actualizar todo desde GitHub:** `bash ~/.claude/repos/vctrmz__claude-estudio/estudio.sh --actualizar`
- **Añadir o quitar algo:** edita `estudio.sh`, `fuentes.txt` o `agentes.txt`, vuelve a ejecutarlo y borra a mano el enlace que sobre en `~/.claude/skills`. Después, añade o quita su nodo en `mapa/grafo.json` y regenera.
- **Añadir una skill propia:** crea la carpeta en `skills/<categoría>/`, añádela a los `miembros` de su categoría en `mapa/grafo.json`, regenera y ejecuta el script.
- **Guardar los cambios en GitHub:** dentro de este repo, `git add -A && git commit -m "..." && git push`.

> **Desde el 22 oct 2026 las skills propias van por categorías** (`skills/diseno-ui/`, `skills/motion-video/`…). En `~/.claude/skills` siguen planas y con el mismo nombre. Si haces `git pull` a mano, los enlaces antiguos se quedan rotos hasta que vuelvas a ejecutar `estudio.sh`, que los rehace. `--actualizar` ya lo hace todo en una pasada.

## Skills propias

40 skills en 6 categorías, con la descripción de cada una en **[`skills/CATALOGO.md`](skills/CATALOGO.md)**:

| Categoría | Skills |
|---|---|
| `diseno-ui` | `design-md`, `ai-component-metadata`, `ai-ds-composer`, `microinteractions`, `design-everyday-things`, `scrollcraft` |
| `motion-video` | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-frameworks`, `gsap-performance`, `gsap-utils`, `gsap`, `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `website-to-hyperframes`, `remotion-to-hyperframes` |
| `research-ux` | `mom-test`, `jobs-to-be-done`, `continuous-discovery`, `design-sprint`, `lean-ux`, `user-test`, `ux-lab`, `adversarial-ux-test` |
| `producto-crecimiento` | `hooked-ux`, `improve-retention`, `influence-psychology` |
| `decision-escritura` | `one-three-one-rule`, `decision-questionnaire`, `grounded-citations`, `spec-ideation`, `prompt-master`, `humanizer` |
| `operaciones` | `email-inbox-triage`, `weekly-review-planning`, `competitor-news-monitor` |

`design-md` es un envoltorio que apunta a `VoltAgent/awesome-design-md`. Las ocho de Hermes (`scrollcraft`, `adversarial-ux-test`, `one-three-one-rule`, `decision-questionnaire`, `grounded-citations`, `competitor-news-monitor`, `weekly-review-planning`, `email-inbox-triage`) son copias adaptadas a Claude Code; el clon parcial queda como referencia.

## Fuentes de terceros

| Repo | Qué aporta | Cómo se instala |
|---|---|---|
| `msitarzewski/agency-agents` | 62 agentes: diseño, marketing, paid media, producto, proyectos, research y ventas | copia (`agentes.txt`) |
| `educlopez/ui-craft` | 4 skills base y 10 comandos de diseño de UI. Los otros 16 comandos están en el repo, apagados | enlace |
| `Leonxlnx/taste-skill` | `brandkit`, `imagegen-frontend-web` | enlace |
| `vercel-labs/agent-skills` | `web-design-guidelines`, `writing-guidelines`, `deploy-to-vercel` | enlace |
| `vercel-labs/skills` | `find-skills` | enlace |
| `JacobLinCool/ux-discovery-interviewer-skill` | `ux-discovery-interviewer` | enlace |
| `dickwu/apple-design-skill` | `apple-design` | enlace |
| `Owl-Listener/agent-ready` | `agent-ready` | enlace |
| `nextlevelbuilder/ui-ux-pro-max-skill` | `ui-ux-pro-max` v2.13 y 6 skills de marca, banners y slides. Antes era plugin | enlace |
| `Varnan-Tech/opendirectory` | 59 skills de go-to-market | enlace |
| `latent-spaces/brag` | `brag` y `brag-slim`: vídeo de lanzamiento de un proyecto | enlace |
| `architecture-decision-record/architecture-decision-record` | `architecture-decision-record-skill`. Licencia CC BY-NC-SA: solo enlace, nunca copia | enlace (clon parcial) |
| `VoltAgent/awesome-design-md` | 73 DESIGN.md de marcas, envueltos como skill `design-md` | skill propia que apunta al repo |
| `NousResearch/hermes-agent` (parcial) | las 8 skills de Hermes de arriba | copias adaptadas en `skills/` |

## Fuera de este repo

El mapa también recoge lo que no instala `estudio.sh`:

- **Proyecto `vctrmz/proyectos`:**
  - skills `impeccable`, `design-taste-frontend`, `magnific-mcp` y `voice-audit`;
  - los 4 agentes de `impeccable` y su hook;
  - el MCP de Playwright (`.mcp.json`).

  Viven en el repo del portfolio porque leen su `PRODUCT.md`.
- **Conectores de claude.ai:** Figma, Gmail, Google Drive, Notion, GitHub y Claude Docs. Firecrawl y PostHog, pendientes de conectar.

## Pendiente

- **superpowers**: plugin del directorio oficial de Anthropic. Se instala desde la app.
- **claude-mem**: necesita Node o Bun para su proceso de fondo, y este Mac no tiene ninguno.
- **briefing-web** y **linear-design** (skills propias): no hay copia en este Mac. `linear-design` queda cubierta en parte por `design-md` (`linear.app`).
- Los 5 skills anidados de opendirectory (`seo-keyword-research`, `meta-ads-expert`, `position-me`, `twitter-GTM-find`, `yc-jobs-scraper`) siguen sin detectarse, igual que antes.
- Las automatizaciones de [`mapa/MAPA.md`](mapa/MAPA.md#automatizaciones-pendientes).
