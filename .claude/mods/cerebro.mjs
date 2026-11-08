// Ayuda compartida de los mods: lee el estado de los módulos del cerebro del proyecto
// desde el archivo que indica .claude/mods/proyecto.json («cerebro», p. ej. lib/admin/jarvis.ts).
// Solo lee; si el proyecto no tiene cerebro declarado devuelve null.
// Generado por AI-Projects-Control-Plane/equipos-skills; no editar a mano.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MODULO = /name:\s*"([^"]+)"[\s\S]*?status:\s*"(live|ready|building|pending|blocked)"[\s\S]*?next:\s*"((?:[^"\\]|\\.)*)"/g;

export function leerCerebro(raiz) {
  let archivo = null;
  try { archivo = JSON.parse(readFileSync(join(raiz, '.claude/mods/proyecto.json'), 'utf8')).cerebro ?? null; } catch {}
  if (!archivo || !existsSync(join(raiz, archivo))) return null;
  const texto = readFileSync(join(raiz, archivo), 'utf8');
  const modulos = [...texto.matchAll(MODULO)].map(([, nombre, estado, siguiente]) => ({ nombre, estado, siguiente }));
  if (!modulos.length) return null;
  return {
    archivo,
    modulos,
    vivos: modulos.filter((m) => m.estado === 'live').length,
    bloqueados: modulos.filter((m) => m.estado === 'blocked'),
  };
}
