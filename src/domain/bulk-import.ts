import type { FieldValue, ListColumn } from './types';

/** Columns the user fills in by hand (everything except calculated ones). */
export function editableColumns(columns: ListColumn[]): ListColumn[] {
  return columns.filter(
    (c) =>
      c.kind === 'text' ||
      c.kind === 'number' ||
      c.kind === 'image' ||
      c.kind === 'category' ||
      (c.kind === 'criterion' && !c.calc),
  );
}

function isNumericColumn(column: ListColumn): boolean {
  return column.kind === 'number' || column.kind === 'criterion';
}

function typeHint(column: ListColumn): string {
  if (isNumericColumn(column)) {
    return 'número (sin puntos de miles ni símbolo de moneda)';
  }
  if (column.kind === 'category') {
    const options = (column.options ?? []).map((o) => `"${o}"`).join(', ');
    return options ? `una de estas opciones exactas: ${options}` : 'texto';
  }
  if (column.kind === 'image') return 'URL de imagen (texto)';
  return 'texto';
}

function sampleValue(column: ListColumn, index: number, random: () => number): FieldValue {
  if (isNumericColumn(column)) return Math.floor(random() * 1000) + 1;
  if (column.kind === 'category') {
    const options = column.options ?? [];
    return options.length > 0 ? options[Math.floor(random() * options.length)] : `Opción ${index}`;
  }
  if (column.kind === 'image') return `https://ejemplo.com/imagen-${index}.jpg`;
  return `Texto ${index}`;
}

/** Prompt the user copies into an AI, built from the list's editable columns. */
export function buildImportTemplate(
  listName: string,
  columns: ListColumn[],
  random: () => number = Math.random,
): string {
  const editable = editableColumns(columns);
  const keys = editable.map((c) => `  "${c.name}": ${typeHint(c)}`).join('\n');
  const examples = [1, 2].map((index) => {
    const entry: Record<string, FieldValue> = {};
    for (const column of editable) {
      entry[column.name] = sampleValue(column, index, random);
    }
    return entry;
  });
  const exampleJson = JSON.stringify(examples, null, 2);

  return [
    `Convierte la información que está al final en un arreglo JSON de items para mi lista de comparación "${listName}".`,
    '',
    'Reglas:',
    '- Responde SOLO con el JSON, sin texto adicional.',
    '- Usa exactamente estas claves:',
    keys,
    '- Si un dato no aparece, usa null. No inventes valores.',
    '- Los valores del ejemplo son de relleno; solo muestran el formato.',
    '',
    'Ejemplo del formato:',
    exampleJson,
    '',
    'Datos a convertir:',
    '<pega aquí tu listado>',
  ].join('\n');
}

export type ImportRow = {
  /** 1-based position in the pasted array. */
  index: number;
  values: Record<string, FieldValue>;
  errors: string[];
  warnings: string[];
};

export type ImportParseResult =
  | { ok: true; rows: ImportRow[]; warnings: string[] }
  | { ok: false; error: string };

export function normalizeKey(key: string): string {
  return key
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

/** Strip markdown fences / surrounding chatter and return the JSON payload. */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.search(/[[{]/);
  if (start < 0) return body;
  const closing = body[start] === '[' ? ']' : '}';
  const end = body.lastIndexOf(closing);
  return end > start ? body.slice(start, end + 1) : body.slice(start);
}

export function parseNumberLoose(raw: string): number | null {
  let s = raw.replace(/[\s$€£]/g, '');
  if (s === '') return null;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
    // 98.000.000 or 1.234,5 → dots are thousands separators
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) {
    // 98,000,000 or 1,234.5
    s = s.replace(/,/g, '');
  } else {
    s = s.replace(',', '.');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function convertValue(
  column: ListColumn,
  raw: unknown,
): { value: FieldValue; error?: string } {
  if (raw == null || (typeof raw === 'string' && raw.trim() === '')) {
    return { value: null };
  }
  if (isNumericColumn(column)) {
    if (typeof raw === 'number' && Number.isFinite(raw)) return { value: raw };
    if (typeof raw === 'string') {
      const n = parseNumberLoose(raw);
      if (n != null) return { value: n };
    }
    return { value: null, error: `"${column.name}" debe ser un número (recibido: ${JSON.stringify(raw)})` };
  }
  if (typeof raw !== 'string' && typeof raw !== 'number') {
    return { value: null, error: `"${column.name}" debe ser texto` };
  }
  const text = String(raw).trim();
  if (column.kind === 'category') {
    const options = column.options ?? [];
    const match = options.find((o) => normalizeKey(o) === normalizeKey(text));
    if (!match) {
      return {
        value: null,
        error: `"${column.name}": "${text}" no es una opción válida (${options.join(', ')})`,
      };
    }
    return { value: match };
  }
  return { value: text };
}

/** Parse the JSON the AI returns into item values keyed by column id. */
export function parseImportText(text: string, columns: ListColumn[]): ImportParseResult {
  if (text.trim() === '') {
    return { ok: false, error: 'Pega el JSON que te devolvió la IA.' };
  }

  let data: unknown;
  try {
    data = JSON.parse(extractJson(text));
  } catch {
    return { ok: false, error: 'El texto no es un JSON válido. Revisa que esté completo.' };
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const wrapped = (data as Record<string, unknown>).items;
    data = Array.isArray(wrapped) ? wrapped : [data];
  }
  if (!Array.isArray(data)) {
    return { ok: false, error: 'Se esperaba un arreglo de items: [ { ... }, { ... } ]' };
  }
  if (data.length === 0) {
    return { ok: false, error: 'El arreglo está vacío.' };
  }

  const editable = editableColumns(columns);
  const byKey = new Map(editable.map((c) => [normalizeKey(c.name), c]));
  const calculatedKeys = new Set(
    columns.filter((c) => !editable.includes(c)).map((c) => normalizeKey(c.name)),
  );
  const ignored = new Set<string>();
  const calculatedIgnored = new Set<string>();

  const rows: ImportRow[] = data.map((entry, i) => {
    const row: ImportRow = { index: i + 1, values: {}, errors: [], warnings: [] };
    if (entry == null || typeof entry !== 'object' || Array.isArray(entry)) {
      row.errors.push('No es un objeto { ... }');
      return row;
    }
    for (const [key, raw] of Object.entries(entry as Record<string, unknown>)) {
      const normalized = normalizeKey(key);
      const column = byKey.get(normalized);
      if (!column) {
        if (calculatedKeys.has(normalized)) calculatedIgnored.add(key);
        else ignored.add(key);
        continue;
      }
      const { value, error } = convertValue(column, raw);
      if (error) row.errors.push(error);
      else if (value != null) row.values[column.id] = value;
    }
    if (row.errors.length === 0 && Object.keys(row.values).length === 0) {
      row.errors.push('No tiene ningún dato de las columnas de la lista');
    }
    for (const column of editable) {
      if (column.rank && row.values[column.id] == null && row.errors.length === 0) {
        row.warnings.push(`"${column.name}" vacío → aportará 0% al ranking`);
      }
    }
    return row;
  });

  const warnings: string[] = [];
  if (calculatedIgnored.size > 0) {
    warnings.push(`Se ignoran columnas calculadas (la app las calcula): ${[...calculatedIgnored].join(', ')}`);
  }
  if (ignored.size > 0) {
    warnings.push(`Se ignoran claves que no existen en la lista: ${[...ignored].join(', ')}`);
  }

  return { ok: true, rows, warnings };
}
