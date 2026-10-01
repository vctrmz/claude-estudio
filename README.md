# Skills y agentes del estudio

Instalado el 1 oct 2026 a partir del inventario de skills y agentes:
https://claude.ai/artifact/2sd7ek1xVhooefHHbwi7jo

Este repo (privado) es la copia de seguridad: guarda las skills propias y la lista de todo lo demás.
Las skills de terceros no se suben; `estudio.sh` las descarga de sus repos originales.

## En un ordenador nuevo

1. Inicia sesión en GitHub desde la terminal (`gh auth login`) para poder clonar este repo privado.
2. Clónalo y ejecuta el script:

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
│   │   └── skills/               ← las 40 skills propias
│   └── <dueño>__<repo>/
├── skills/                       ← lo que Claude carga: todo son enlaces a repos/
├── agents/                       ← los 62 agentes (copiados desde agency-agents)
└── archivo/                      ← versiones retiradas (ui-ux-pro-max-v1)
```

- **Instalar o rehacer los enlaces:** `bash ~/.claude/repos/vctrmz__claude-estudio/estudio.sh`
- **Actualizar todo desde GitHub:** `bash ~/.claude/repos/vctrmz__claude-estudio/estudio.sh --actualizar`
- **Añadir o quitar algo:** edita `estudio.sh`, `fuentes.txt` o `agentes.txt`, vuelve a ejecutarlo y borra a mano el enlace que sobre en `~/.claude/skills`.
- **Añadir una skill propia:** crea la carpeta en `skills/` de este repo y ejecuta el script.
- **Guardar los cambios en GitHub:** dentro de este repo, `git add -A && git commit -m "..." && git push`.

## Fuentes

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
| `VoltAgent/awesome-design-md` | 73 DESIGN.md de marcas, envueltos como skill `design-md` | skill propia (`skills/design-md`) que apunta al repo |
| `NousResearch/hermes-agent` (sparse) | 8 skills: scrollcraft, adversarial-ux-test, one-three-one-rule, decision-questionnaire, grounded-citations, competitor-news-monitor, weekly-review-planning, email-inbox-triage | **copias adaptadas** a Claude Code, en `skills/` de este repo; el clon queda como referencia |

## Skills propias (`skills/` de este repo)

Además de `design-md` y las 8 portadas de Hermes, restauradas desde copias de seguridad el 1 oct 2026:

- **GSAP:** `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-frameworks`, `gsap-performance`, `gsap-utils`
- **HyperFrames:** `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `gsap`, `website-to-hyperframes`, `remotion-to-hyperframes`
- **Sistemas de diseño, UX e ideación:** `ai-component-metadata`, `ai-ds-composer`, `user-test`, `ux-lab`, `spec-ideation`, `prompt-master`
- **Producto y UX:** `mom-test`, `jobs-to-be-done`, `continuous-discovery`, `design-sprint`, `lean-ux`, `design-everyday-things`, `microinteractions`, `hooked-ux`, `improve-retention`, `influence-psychology`, `humanizer`

## Pendiente

- **superpowers**: plugin del directorio oficial de Anthropic. Se instala desde la app.
- **claude-mem**: necesita Node o Bun para su proceso de fondo, y este Mac no tiene ninguno.
- **briefing-web** y **linear-design** (skills propias): no hay copia en este Mac. `linear-design` queda cubierta en parte por `design-md` (`linear.app`).
- Los 5 skills anidados de opendirectory (`seo-keyword-research`, `meta-ads-expert`, `position-me`, `twitter-GTM-find`, `yc-jobs-scraper`) siguen sin detectarse, igual que antes.
