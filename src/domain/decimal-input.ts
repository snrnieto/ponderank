/**
 * Limpia lo que el usuario escribe en un campo numérico: solo dígitos, un separador decimal
 * (punto o coma, se normaliza a punto) y un signo menos inicial.
 */
export function sanitizeDecimalText(text: string): string {
  let out = '';
  let hasSeparator = false;
  for (const [i, ch] of [...text.trim()].entries()) {
    if (ch >= '0' && ch <= '9') out += ch;
    else if ((ch === '.' || ch === ',') && !hasSeparator) {
      out += '.';
      hasSeparator = true;
    } else if (ch === '-' && i === 0) out += ch;
  }
  return out;
}

/** Número del texto ya limpio; null si está vacío o incompleto ("", "-", "."). */
export function parseDecimalText(text: string): number | null {
  if (text === '' || text === '-' || text === '.' || text === '-.') return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}
