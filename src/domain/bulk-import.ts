import type { Locale } from './locale';
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

const MSG = {
  es: {
    numberHint: 'número (sin puntos de miles ni símbolo de moneda)',
    optionsHint: (options: string) => `una de estas opciones exactas: ${options}`,
    textHint: 'texto',
    imageHint: 'URL de imagen (texto)',
    sampleOption: (i: number) => `Opción ${i}`,
    sampleImage: (i: number) => `https://ejemplo.com/imagen-${i}.jpg`,
    sampleText: (i: number) => `Texto ${i}`,
    template: (listName: string, keys: string, example: string) =>
      [
        `Convierte la información que está al final en un arreglo JSON de opciones para mi lista de comparación "${listName}".`,
        '',
        'Reglas:',
        '- Responde SOLO con el JSON, sin texto adicional.',
        '- Usa exactamente estas claves:',
        keys,
        '- Si un dato no aparece, usa null. No inventes valores.',
        '- Los valores del ejemplo son de relleno; solo muestran el formato.',
        '',
        'Ejemplo del formato:',
        example,
        '',
        'Datos a convertir:',
        '<pega aquí tu listado>',
      ].join('\n'),
    empty: 'Pega aquí lo que te respondió la IA o una tabla copiada de tu hoja de cálculo.',
    invalid:
      'No pudimos leer el texto. Si viene de la IA, copia la respuesta completa; si es una tabla, incluye la fila de encabezados.',
    notList: 'No encontramos una lista de opciones en el texto. Revisa que copiaste la respuesta completa.',
    noRows: 'El texto no tiene ninguna opción.',
    notObject: 'Esta fila no tiene el formato esperado.',
    mustBeNumber: (name: string, raw: string) => `"${name}" debe ser un número (recibido: ${raw})`,
    mustBeText: (name: string) => `"${name}" debe ser texto`,
    badOption: (name: string, text: string, options: string) =>
      `"${name}": "${text}" no es una opción válida (${options})`,
    noData: 'No tiene ningún dato de esta lista',
    emptyCriterion: (name: string) => `"${name}" está vacío: esta opción sacará 0 en ese dato`,
    ignoredCalculated: (keys: string) => `Se ignoran datos calculados (la app los calcula sola): ${keys}`,
    ignoredKeys: (keys: string) => `Se ignoran columnas que no existen en esta lista: ${keys}`,
  },
  en: {
    numberHint: 'number (no thousands separators or currency symbols)',
    optionsHint: (options: string) => `one of these exact options: ${options}`,
    textHint: 'text',
    imageHint: 'image URL (text)',
    sampleOption: (i: number) => `Option ${i}`,
    sampleImage: (i: number) => `https://example.com/image-${i}.jpg`,
    sampleText: (i: number) => `Text ${i}`,
    template: (listName: string, keys: string, example: string) =>
      [
        `Convert the information at the end into a JSON array of options for my comparison list "${listName}".`,
        '',
        'Rules:',
        '- Reply ONLY with the JSON, no extra text.',
        '- Use exactly these keys:',
        keys,
        '- If a value is missing, use null. Do not make up values.',
        '- The example values are placeholders; they only show the format.',
        '',
        'Format example:',
        example,
        '',
        'Data to convert:',
        '<paste your list here>',
      ].join('\n'),
    empty: 'Paste the AI reply here, or a table copied from your spreadsheet.',
    invalid:
      'We couldn’t read the text. If it comes from the AI, copy the whole reply; if it’s a table, include the header row.',
    notList: 'We couldn’t find a list of options in the text. Check that you copied the whole reply.',
    noRows: 'The text has no options.',
    notObject: 'This row isn’t in the expected format.',
    mustBeNumber: (name: string, raw: string) => `"${name}" must be a number (got: ${raw})`,
    mustBeText: (name: string) => `"${name}" must be text`,
    badOption: (name: string, text: string, options: string) => `"${name}": "${text}" is not a valid option (${options})`,
    noData: 'It has no values for this list',
    emptyCriterion: (name: string) => `"${name}" is empty: this option will score 0 there`,
    ignoredCalculated: (keys: string) => `Calculated values are ignored (the app calculates them): ${keys}`,
    ignoredKeys: (keys: string) => `Columns that don’t exist in this list are ignored: ${keys}`,
  },
} satisfies Record<Locale, unknown>;

type Messages = (typeof MSG)['es'];

function typeHint(column: ListColumn, m: Messages): string {
  if (isNumericColumn(column)) return m.numberHint;
  if (column.kind === 'category') {
    const options = (column.options ?? []).map((o) => `"${o}"`).join(', ');
    return options ? m.optionsHint(options) : m.textHint;
  }
  if (column.kind === 'image') return m.imageHint;
  return m.textHint;
}

function sampleValue(column: ListColumn, index: number, random: () => number, m: Messages): FieldValue {
  if (isNumericColumn(column)) return Math.floor(random() * 1000) + 1;
  if (column.kind === 'category') {
    const options = column.options ?? [];
    return options.length > 0 ? options[Math.floor(random() * options.length)] : m.sampleOption(index);
  }
  if (column.kind === 'image') return m.sampleImage(index);
  return m.sampleText(index);
}

/** Instrucciones que el usuario copia en una IA, armadas con los datos editables de la lista. */
export function buildImportTemplate(
  listName: string,
  columns: ListColumn[],
  random: () => number = Math.random,
  locale: Locale = 'es',
): string {
  const m = MSG[locale];
  const editable = editableColumns(columns);
  const keys = editable.map((c) => `  "${c.name}": ${typeHint(c, m)}`).join('\n');
  const examples = [1, 2].map((index) => {
    const entry: Record<string, FieldValue> = {};
    for (const column of editable) entry[column.name] = sampleValue(column, index, random, m);
    return entry;
  });
  return m.template(listName, keys, JSON.stringify(examples, null, 2));
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

/** Quita bloques de código markdown alrededor del contenido útil. */
function stripFences(text: string): string {
  const fenced = text.match(/```(?:json|csv|tsv)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

/** Recorta el JSON (arreglo u objeto) que haya dentro del texto. */
function extractJson(body: string): string {
  const start = body.search(/[[{]/);
  if (start < 0) return body;
  const closing = body[start] === '[' ? ']' : '}';
  const end = body.lastIndexOf(closing);
  return end > start ? body.slice(start, end + 1) : body.slice(start);
}

/** Divide una línea de texto delimitado respetando comillas dobles. */
function splitDelimited(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else current += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      cells.push(current);
      current = '';
    } else current += ch;
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

/**
 * Lee una tabla pegada desde una hoja de cálculo (tabulaciones, punto y coma o comas) con la
 * primera fila como encabezados. Devuelve null si no parece una tabla.
 */
export function parseTableText(text: string): Record<string, string>[] | null {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) return null;
  const header = lines[0];
  const delimiter = header.includes('\t') ? '\t' : header.includes(';') ? ';' : header.includes(',') ? ',' : null;
  if (!delimiter) return null;
  const headers = splitDelimited(header, delimiter);
  if (headers.length < 2) return null;
  return lines.slice(1).map((line) => {
    const cells = splitDelimited(line, delimiter);
    const entry: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (h) entry[h] = cells[i] ?? '';
    });
    return entry;
  });
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

function convertValue(column: ListColumn, raw: unknown, m: Messages): { value: FieldValue; error?: string } {
  if (raw == null || (typeof raw === 'string' && raw.trim() === '')) {
    return { value: null };
  }
  if (isNumericColumn(column)) {
    if (typeof raw === 'number' && Number.isFinite(raw)) return { value: raw };
    if (typeof raw === 'string') {
      const n = parseNumberLoose(raw);
      if (n != null) return { value: n };
    }
    return { value: null, error: m.mustBeNumber(column.name, JSON.stringify(raw)) };
  }
  if (typeof raw !== 'string' && typeof raw !== 'number') {
    return { value: null, error: m.mustBeText(column.name) };
  }
  const text = String(raw).trim();
  if (column.kind === 'category') {
    const options = column.options ?? [];
    const match = options.find((o) => normalizeKey(o) === normalizeKey(text));
    if (!match) return { value: null, error: m.badOption(column.name, text, options.join(', ')) };
    return { value: match };
  }
  return { value: text };
}

/** ¿El texto parece JSON (empieza por [ o {), en vez de una tabla? */
function looksLikeJson(body: string): boolean {
  const firstLine = body.split(/\r?\n/)[0] ?? '';
  if (firstLine.includes('\t')) return false;
  // La IA a veces antepone una frase («Aquí está:»); el JSON empieza poco después.
  return /[[{]/.test(body.slice(0, 300));
}

/**
 * Convierte lo que el usuario pega (la respuesta JSON de una IA o una tabla copiada de una hoja de
 * cálculo) en valores por columna. Las claves/encabezados se emparejan por nombre de columna.
 */
export function parseImportText(text: string, columns: ListColumn[], locale: Locale = 'es'): ImportParseResult {
  const m = MSG[locale];
  if (text.trim() === '') return { ok: false, error: m.empty };

  const body = stripFences(text);
  let data: unknown;
  if (looksLikeJson(body)) {
    try {
      data = JSON.parse(extractJson(body));
    } catch {
      return { ok: false, error: m.invalid };
    }
  } else {
    const table = parseTableText(body);
    if (!table) return { ok: false, error: m.invalid };
    data = table;
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const wrapped = (data as Record<string, unknown>).items;
    data = Array.isArray(wrapped) ? wrapped : [data];
  }
  if (!Array.isArray(data)) return { ok: false, error: m.notList };
  if (data.length === 0) return { ok: false, error: m.noRows };

  const editable = editableColumns(columns);
  const byKey = new Map(editable.map((c) => [normalizeKey(c.name), c]));
  const calculatedKeys = new Set(columns.filter((c) => !editable.includes(c)).map((c) => normalizeKey(c.name)));
  const ignored = new Set<string>();
  const calculatedIgnored = new Set<string>();

  const rows: ImportRow[] = data.map((entry, i) => {
    const row: ImportRow = { index: i + 1, values: {}, errors: [], warnings: [] };
    if (entry == null || typeof entry !== 'object' || Array.isArray(entry)) {
      row.errors.push(m.notObject);
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
      const { value, error } = convertValue(column, raw, m);
      if (error) row.errors.push(error);
      else if (value != null) row.values[column.id] = value;
    }
    if (row.errors.length === 0 && Object.keys(row.values).length === 0) row.errors.push(m.noData);
    for (const column of editable) {
      if (column.rank && row.values[column.id] == null && row.errors.length === 0) {
        row.warnings.push(m.emptyCriterion(column.name));
      }
    }
    return row;
  });

  const warnings: string[] = [];
  if (calculatedIgnored.size > 0) warnings.push(m.ignoredCalculated([...calculatedIgnored].join(', ')));
  if (ignored.size > 0) warnings.push(m.ignoredKeys([...ignored].join(', ')));

  return { ok: true, rows, warnings };
}
