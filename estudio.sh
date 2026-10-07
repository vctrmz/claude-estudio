#!/bin/bash
# Instala o actualiza las skills y agentes del estudio a partir de los repos de ~/.claude/repos.
# Toda la selección está aquí: para añadir o quitar algo, edita este archivo y vuelve a ejecutarlo.
#
#   bash ~/.claude/repos/vctrmz__claude-estudio/estudio.sh               # clona lo que falte, enlaza y copia agentes
#   bash ~/.claude/repos/vctrmz__claude-estudio/estudio.sh --actualizar  # además hace git pull de cada repo
#
# Las skills enlazadas apuntan al repo, así que un git pull las actualiza.
# Las skills propias (portadas de Hermes, design-md, GSAP, HyperFrames...) viven en skills/ de este repo.
set -euo pipefail
R="$HOME/.claude/repos"; E="$R/vctrmz__claude-estudio"; SK="$HOME/.claude/skills"; AG="$HOME/.claude/agents"
mkdir -p "$SK" "$AG"

# --- Clona los repos de fuentes.txt que falten (un ordenador nuevo parte de aquí) ---
while read -r repo rutas; do
  [[ -z "$repo" || "$repo" == \#* ]] && continue
  d="$R/${repo/\//__}"
  [[ -d "$d" ]] && continue
  echo "clonando: $repo"
  if [[ -n "$rutas" ]]; then
    git clone -q --depth 1 --filter=blob:none --sparse "https://github.com/$repo.git" "$d" </dev/null \
      && git -C "$d" sparse-checkout set $rutas || echo "ERROR al clonar: $repo"
  else
    git clone -q --depth 1 "https://github.com/$repo.git" "$d" </dev/null || echo "ERROR al clonar: $repo"
  fi
done < "$E/fuentes.txt"

if [[ "${1:-}" == "--actualizar" ]]; then
  for g in "$R"/*/.git; do
    d="${g%/.git}"
    git -C "$d" pull -q --ff-only && echo "actualizado: $(basename "$d")" || echo "ERROR al actualizar: $(basename "$d")"
  done
fi

link() { # link <nombre> <ruta dentro de repos>
  local src="$R/$2" dst="$SK/$1"
  [[ -f "$src/SKILL.md" ]] || { echo "FALTA SKILL.md: $2"; return 0; }
  if [[ -e "$dst" && ! -L "$dst" ]]; then echo "omitida $1: ya hay una carpeta real con ese nombre"; return 0; fi
  ln -sfn "$src" "$dst"
}

# --- ui-craft (educlopez/ui-craft): base del flujo de diseño de UI ---
for s in ui-craft ui-craft-minimal ui-craft-editorial ui-craft-dense-dashboard; do link "$s" "educlopez__ui-craft/skills/$s"; done
for s in audit clarify critique finalize harden heuristic polish redesign shape tokens; do link "$s" "educlopez__ui-craft/.agents/skills/$s"; done
# Apagados a propósito (están en el repo pero sin enlazar): adapt animate bolder brief colorize craft delight
# distill extract friction-log quieter remember sddesign start typeset unhappy

# --- taste-skill (Leonxlnx/taste-skill): dirección visual con imágenes ---
for s in brandkit imagegen-frontend-web; do link "$s" "Leonxlnx__taste-skill/skills/$s"; done

# --- Vercel (vercel-labs/agent-skills) ---
for s in web-design-guidelines writing-guidelines deploy-to-vercel; do link "$s" "vercel-labs__agent-skills/skills/$s"; done

# --- Sueltas, una por repo ---
link find-skills              vercel-labs__skills/skills/find-skills
link ux-discovery-interviewer JacobLinCool__ux-discovery-interviewer-skill/.agents/skills/ux-discovery-interviewer
link apple-design             dickwu__apple-design-skill
link agent-ready              Owl-Listener__agent-ready

# --- ADR (architecture-decision-record): registra decisiones con su porqué. Licencia CC BY-NC-SA, no copiar al repo ---
link architecture-decision-record-skill architecture-decision-record__architecture-decision-record/skills/architecture-decision-record-skill

# --- brag (latent-spaces/brag): vídeo de lanzamiento de un proyecto. En Opus 5.5 /brag delega en /brag-slim ---
for s in brag brag-slim; do link "$s" "latent-spaces__brag/skills/$s"; done

# --- ui-ux-pro-max v2.13 (nextlevelbuilder/ui-ux-pro-max-skill) ---
for d in "$R"/nextlevelbuilder__ui-ux-pro-max-skill/.claude/skills/*/; do
  s="$(basename "$d")"; link "$s" "nextlevelbuilder__ui-ux-pro-max-skill/.claude/skills/$s"
done

# --- opendirectory GTM (Varnan-Tech/opendirectory): marketing y crecimiento del estudio ---
for d in "$R"/Varnan-Tech__opendirectory/skills/*/; do
  s="$(basename "$d")"; [[ -f "$d/SKILL.md" ]] && link "$s" "Varnan-Tech__opendirectory/skills/$s"
done

# --- Skills propias (skills/ de este repo). Van al final para que ganen si un nombre coincide ---
for d in "$E"/skills/*/; do
  s="$(basename "$d")"; link "$s" "vctrmz__claude-estudio/skills/$s"
done

# --- Agentes (msitarzewski/agency-agents): se copian, la lista está en agentes.txt ---
while read -r f; do
  [[ -n "$f" ]] && cp "$R/msitarzewski__agency-agents/$f" "$AG/"
done < "$E/agentes.txt"

# --- Comprobación ---
rotos=$(find "$SK" -maxdepth 1 -type l ! -exec test -e {} \; -print)
[[ -n "$rotos" ]] && echo "enlaces rotos:" && echo "$rotos"
echo "skills: $(find "$SK" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ') · agentes: $(find "$AG" -name '*.md' | wc -l | tr -d ' ')"
