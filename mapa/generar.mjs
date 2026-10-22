#!/usr/bin/env node
/* Genera el mapa del estudio a partir de mapa/grafo.json, la única fuente:
   mapa/MAPA.md (grafos en Mermaid, flujos, solapes, automatizaciones e
   inventario) y skills/CATALOGO.md (las skills propias con su descripción).

     node mapa/generar.mjs           # valida y escribe los dos archivos
     node mapa/generar.mjs --check   # valida y falla si están desfasados (para CI)

   Valida que cada arista, flujo y solape apunte a nodos que existen, que cada
   carpeta de skills/<categoría>/<skill> esté en el grafo una sola vez y que el
   recuento de agentes cuadre con agentes.txt. Sin dependencias. */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const G = JSON.parse(readFileSync(join(ROOT, 'mapa/grafo.json'), 'utf8'));
const errores = [];
const byId = new Map();
for (const n of G.nodos) {
  if (byId.has(n.id)) errores.push(`nodo repetido: ${n.id}`);
  byId.set(n.id, n);
  if (!G.capas[n.capa]) errores.push(`${n.id}: capa desconocida «${n.capa}»`);
}
const existe = (id, donde) => byId.has(id) || errores.push(`${donde}: el nodo «${id}» no existe`);
for (const a of G.aristas) {
  existe(a.de, `arista ${a.de}→${a.a}`); existe(a.a, `arista ${a.de}→${a.a}`);
  if (!G.relaciones[a.rel]) errores.push(`arista ${a.de}→${a.a}: relación desconocida «${a.rel}»`);
}
for (const f of G.flujos) f.pasos.forEach((p) => existe(p, `flujo ${f.id}`));
for (const s of G.solapes) s.nodos.forEach((p) => existe(p, `solape «${s.tema}»`));

/* Skills propias: cada carpeta, en un único nodo con su `carpeta`. */
const propias = [];
for (const cat of readdirSync(join(ROOT, 'skills'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  const nodo = G.nodos.find((n) => n.carpeta === `skills/${cat}`);
  if (!nodo) { errores.push(`skills/${cat}: ninguna categoría del grafo tiene esta carpeta`); continue; }
  for (const s of readdirSync(join(ROOT, 'skills', cat), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
    const file = join(ROOT, 'skills', cat, s, 'SKILL.md');
    if (!existsSync(file)) { errores.push(`skills/${cat}/${s}: falta SKILL.md`); continue; }
    if (!nodo.miembros?.includes(s)) errores.push(`skills/${cat}/${s}: no está en los miembros de ${nodo.id}`);
    propias.push({ cat, s, nodo, ...frontmatter(readFileSync(file, 'utf8')) });
  }
  for (const m of nodo.miembros ?? []) if (!existsSync(join(ROOT, 'skills', cat, m))) errores.push(`${nodo.id}: el miembro «${m}» no tiene carpeta en skills/${cat}`);
}

/* Agentes: los prefijos de cada grupo cubren agentes.txt sin huecos ni repetidos. */
const agentes = readFileSync(join(ROOT, 'agentes.txt'), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
const grupos = G.nodos.filter((n) => n.agentes);
for (const a of agentes) {
  const n = grupos.filter((g) => g.agentes.some((p) => a.startsWith(p))).length;
  if (n !== 1) errores.push(`agentes.txt: ${a} está en ${n} grupos del grafo`);
}
for (const g of grupos) {
  const n = agentes.filter((a) => g.agentes.some((p) => a.startsWith(p))).length;
  const dice = Number(/\((\d+)\)/.exec(g.nombre)?.[1]);
  if (dice !== n) errores.push(`${g.id}: el nombre dice ${dice} y agentes.txt tiene ${n}`);
}

if (errores.length) { console.error(errores.map((e) => `✗ ${e}`).join('\n')); process.exit(1); }

/** La descripción del frontmatter, también en bloque (> o |) o entre comillas. */
function frontmatter(src) {
  const m = /^---\n([\s\S]*?)\n---/.exec(src.replace(/\r\n/g, '\n'));
  if (!m) return { desc: '' };
  const lines = m[1].split('\n'), i = lines.findIndex((l) => /^description:/.test(l));
  if (i < 0) return { desc: '' };
  let v = lines[i].replace(/^description:\s*/, '');
  if (/^[>|][-+]?$/.test(v)) {
    const body = [];
    for (const l of lines.slice(i + 1)) { if (/^\S/.test(l)) break; body.push(l.trim()); }
    v = body.join(' ');
  }
  return { desc: v.replace(/^['"]|['"]$/g, '').trim() };
}

/* ---- Mermaid ---- */
const mid = (id) => id.replace(/[^a-zA-Z0-9]/g, '_');
const lbl = (t) => `"${t.replace(/"/g, '#quot;')}"`;
const FORMA = { documento: ['[/', '/]'], skill: ['(', ')'], grupo: ['[[', ']]'], agente: ['{{', '}}'], hook: ['>', ']'], script: ['[', ']'], superficie: ['[(', ')]'], mcp: ['([', '])'], conector: ['([', '])'] };
const nodoMd = (n) => { const [a, b] = FORMA[n.tipo] ?? ['[', ']']; return `${mid(n.id)}${a}${lbl(n.nombre)}${b}`; };
const FLECHA = { manda: '==>', dispara: '-.->' };

/** Las capas como cajas, con las relaciones entre ellas sumadas: la vista de un vistazo. */
function grafoCapas() {
  const out = ['```mermaid', 'flowchart LR'];
  for (const [capa, titulo] of Object.entries(G.capas)) {
    const n = G.nodos.filter((x) => x.capa === capa).length;
    out.push(`  ${capa}[${lbl(`${titulo.split(' · ')[0]}<br>${n} piezas`)}]`);
  }
  const suma = new Map();
  for (const a of G.aristas) {
    const de = byId.get(a.de).capa, al = byId.get(a.a).capa;
    if (de === al) continue;
    const k = `${de}|${al}|${a.rel}`;
    suma.set(k, (suma.get(k) ?? 0) + 1);
  }
  for (const [k, n] of suma) { const [de, al, rel] = k.split('|'); out.push(`  ${de} ${FLECHA[rel] ?? '-->'}|${rel} ×${n}| ${al}`); }
  out.push('```');
  return out.join('\n');
}

/** Un subgrafo de las aristas que pasa `dentro`, agrupado por capas. */
function grafo(dentro, dir) {
  const as = G.aristas.filter(dentro);
  const usados = new Set(as.flatMap((a) => [a.de, a.a]));
  const out = ['```mermaid', `flowchart ${dir}`];
  for (const [capa, titulo] of Object.entries(G.capas)) {
    const ns = G.nodos.filter((n) => n.capa === capa && usados.has(n.id));
    if (ns.length) out.push(`  subgraph ${capa}[${lbl(titulo.split(' · ')[0])}]`, ...ns.map((n) => `    ${nodoMd(n)}`), '  end');
  }
  for (const a of as) out.push(`  ${mid(a.de)} ${FLECHA[a.rel] ?? '-->'}|${a.rel}| ${mid(a.a)}`);
  out.push('```');
  return out.join('\n');
}
const NUCLEO = new Set(['fuente', 'proyecto']);
const enNucleo = (a) => NUCLEO.has(byId.get(a.de).capa) && NUCLEO.has(byId.get(a.a).capa);

function grafoFlujo(f) {
  const out = ['```mermaid', 'flowchart LR', ...f.pasos.map((p) => `  ${nodoMd(byId.get(p))}`)];
  f.pasos.slice(1).forEach((p, i) => out.push(`  ${mid(f.pasos[i])} --> ${mid(p)}`));
  out.push('```');
  return out.join('\n');
}

const fila = (cells) => `| ${cells.map((c) => String(c).replace(/\|/g, '\\|')).join(' | ')} |`;

const mapa = [
  '# Mapa del estudio',
  '',
  '<!-- Generado por mapa/generar.mjs desde mapa/grafo.json. No editar a mano: edita el JSON y vuelve a generar. -->',
  '',
  `Todo lo que usa Claude en el estudio y en el portfolio, como un grafo: qué decide sobre qué, quién delega en quién y qué valida cada resultado. Versión ${G.version}.`,
  '',
  'Las fuentes de verdad mandan (flecha gruesa), las skills y agentes trabajan, y los scripts, los tests y el navegador validan antes de que algo llegue a Vercel. Las flechas de puntos son automáticas.',
  '',
  '## Leyenda',
  '',
  fila(['Forma', 'Tipo']), fila(['---', '---']),
  fila(['`/documento/`', 'fuente de verdad']), fila(['`(skill)`', 'skill suelta']), fila(['`[[grupo]]`', 'grupo de skills']),
  fila(['`{{agente}}`', 'agente o grupo de agentes']), fila(['`>hook]`', 'hook']), fila(['`[script]`', 'script o test']),
  fila(['`[(superficie)]`', 'web, lab o despliegue']), fila(['`([conector])`', 'conector o MCP']),
  '',
  fila(['Relación', 'Significa']), fila(['---', '---']),
  ...Object.entries(G.relaciones).map(([k, v]) => fila([`\`${k}\``, v])),
  '',
  '## Vista de capas',
  '',
  'Cada caja es una capa; cada flecha suma las relaciones que van de una a otra.',
  '',
  grafoCapas(),
  '',
  '## Núcleo: el portfolio',
  '',
  'Fuentes de verdad y piezas del repo proyectos. Es donde se decide qué llega a producción.',
  '',
  grafo(enNucleo, 'TB'),
  '',
  '## Estudio y conectores',
  '',
  'Lo que entra al núcleo desde el estudio global, los conectores y las skills incluidas.',
  '',
  grafo((a) => !enNucleo(a), 'LR'),
  '',
  '## Flujos de trabajo',
  '',
  'Cada flujo es un camino por el grafo. Es la secuencia que conviene seguir, y la fila «Automatizar» es el siguiente paso para que lo haga solo.',
  '',
  ...G.flujos.flatMap((f) => [`### ${f.nombre}`, '', `**Cuándo:** ${f.cuando}`, '', grafoFlujo(f), '', `**Automatizar:** ${f.automatizar}`, '']),
  '## Solapes y quién gana',
  '',
  'Cuando dos piezas hacen lo mismo, Claude puede elegir la que no toca. Esta es la regla de cada caso.',
  '',
  fila(['Tema', 'Piezas', 'Regla']), fila(['---', '---', '---']),
  ...G.solapes.map((s) => fila([s.tema, s.nodos.map((n) => byId.get(n).nombre).join(' · '), s.regla])),
  '',
  '## Automatizaciones pendientes',
  '',
  fila(['#', 'Qué', 'Por qué', 'Con qué']), fila(['---', '---', '---', '---']),
  ...G.automatizaciones.sort((a, b) => a.prioridad - b.prioridad).map((a) => fila([a.prioridad, a.que, a.por, a.con])),
  '',
  '## Inventario',
  '',
  ...Object.entries(G.capas).flatMap(([capa, titulo]) => [
    `### ${titulo}`, '',
    fila(['Pieza', 'Tipo', 'Dónde', 'Cómo se activa', 'Qué hace']), fila(['---', '---', '---', '---', '---']),
    ...G.nodos.filter((n) => n.capa === capa).map((n) => fila([
      n.nombre, n.tipo, `\`${n.donde}\``, n.activa,
      n.miembros ? `${n.que} <br>*${n.miembros.join(', ')}*` : n.que,
    ])),
    '',
  ]),
].join('\n');

const catalogo = [
  '# Catálogo de skills propias',
  '',
  '<!-- Generado por mapa/generar.mjs desde el frontmatter de cada SKILL.md. No editar a mano. -->',
  '',
  `${propias.length} skills en ${new Set(propias.map((p) => p.cat)).size} categorías. En el repo van por carpetas; \`estudio.sh\` las enlaza planas en \`~/.claude/skills\`, con su nombre de siempre.`,
  '',
  ...[...new Set(propias.map((p) => p.cat))].flatMap((cat) => {
    const ps = propias.filter((p) => p.cat === cat), n = ps[0].nodo;
    const t = n.nombre.replace(/^Propias · /, '');
    return [`## ${t[0].toUpperCase()}${t.slice(1)}`, '', n.que, '', fila(['Skill', 'Para qué']), fila(['---', '---']),
      ...ps.map((p) => fila([`[\`${p.s}\`](${cat}/${p.s}/SKILL.md)`, p.desc.length > 220 ? `${p.desc.slice(0, 217)}…` : p.desc || '—'])), ''];
  }),
].join('\n');

const salidas = { 'mapa/MAPA.md': mapa, 'skills/CATALOGO.md': catalogo };
if (process.argv.includes('--check')) {
  const viejos = Object.entries(salidas).filter(([f, t]) => !existsSync(join(ROOT, f)) || readFileSync(join(ROOT, f), 'utf8') !== t).map(([f]) => f);
  if (viejos.length) { console.error(`✗ desfasados: ${viejos.join(', ')}. Ejecuta node mapa/generar.mjs`); process.exit(1); }
  console.log('✓ grafo válido y archivos al día');
} else {
  for (const [f, t] of Object.entries(salidas)) writeFileSync(join(ROOT, f), t);
  console.log(`✓ ${G.nodos.length} nodos · ${G.aristas.length} aristas · ${G.flujos.length} flujos · ${propias.length} skills propias · ${agentes.length} agentes`);
}
