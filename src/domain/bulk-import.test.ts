import { describe, expect, it } from 'vitest';

import { buildImportTemplate, editableColumns, parseImportText, parseNumberLoose } from './bulk-import';
import type { ListColumn } from './types';

function col(partial: Partial<ListColumn> & Pick<ListColumn, 'id' | 'name' | 'kind'>): ListColumn {
  return { listId: 'list-1', order: 0, ...partial };
}

const columns: ListColumn[] = [
  col({ id: 'name', name: 'Nombre', kind: 'text' }),
  col({
    id: 'price',
    name: 'Precio',
    kind: 'criterion',
    rank: { weight: 60, direction: 'lowerBetter', target: { mode: 'min' } },
  }),
  col({ id: 'range', name: 'Autonomía', kind: 'number' }),
  col({ id: 'type', name: 'Tipo', kind: 'category', options: ['Eléctrico', 'Híbrido'] }),
  col({ id: 'photo', name: 'Foto', kind: 'image' }),
  col({
    id: 'ppk',
    name: 'Precio/km',
    kind: 'calculated',
    calc: { op: 'div', leftRef: 'column:price', rightRef: 'column:range' },
    rank: { weight: 40, direction: 'lowerBetter', target: { mode: 'min' } },
  }),
];

describe('editableColumns', () => {
  it('excludes calculated columns', () => {
    expect(editableColumns(columns).map((c) => c.id)).toEqual(['name', 'price', 'range', 'type', 'photo']);
  });
});

describe('buildImportTemplate', () => {
  it('lists only editable columns and contains a parseable example', () => {
    const template = buildImportTemplate('Vehiculos', columns, () => 0);
    expect(template).toContain('"Vehiculos"');
    expect(template).toContain('"Precio": número');
    expect(template).toContain('"Eléctrico", "Híbrido"');
    expect(template).not.toContain('Precio/km');

    const example = template.split('Ejemplo del formato:\n')[1].split('\n\nDatos a convertir')[0];
    const result = parseImportText(example, columns);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rows).toHaveLength(2);
      expect(result.rows.every((r) => r.errors.length === 0)).toBe(true);
    }
  });
});

describe('parseNumberLoose', () => {
  it('handles thousands separators and decimal commas', () => {
    expect(parseNumberLoose('98.000.000')).toBe(98000000);
    expect(parseNumberLoose('$ 69,990,000')).toBe(69990000);
    expect(parseNumberLoose('44,9')).toBe(44.9);
    expect(parseNumberLoose('7.3')).toBe(7.3);
    expect(parseNumberLoose('98 millones')).toBeNull();
  });
});

describe('parseImportText', () => {
  it('maps keys by column name (case/accent-insensitive) to column ids', () => {
    const result = parseImportText(
      '```json\n[{"nombre":"BYD Dolphin","PRECIO":"98.000.000","Autonomia":427,"tipo":"eléctrico"}]\n```',
      columns,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows[0].errors).toEqual([]);
    expect(result.rows[0].values).toEqual({
      name: 'BYD Dolphin',
      price: 98000000,
      range: 427,
      type: 'Eléctrico',
    });
  });

  it('flags invalid numbers and categories per row', () => {
    const result = parseImportText(
      '[{"Nombre":"A","Precio":"98 millones"},{"Nombre":"B","Precio":1,"Tipo":"Diésel"}]',
      columns,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows[0].errors[0]).toContain('"Precio" debe ser un número');
    expect(result.rows[1].errors[0]).toContain('"Diésel" no es una opción válida');
  });

  it('warns about empty criteria and ignored keys', () => {
    const result = parseImportText('[{"Nombre":"A","Precio/km":3,"Color":"rojo"}]', columns);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows[0].warnings).toEqual(['"Precio" vacío → aportará 0% al ranking']);
    expect(result.warnings).toHaveLength(2);
  });

  it('accepts a single object or { items: [...] }', () => {
    const single = parseImportText('{"Nombre":"A"}', columns);
    const wrapped = parseImportText('Aquí está:\n{"items":[{"Nombre":"A"},{"Nombre":"B"}]}', columns);
    expect(single.ok && single.rows.length).toBe(1);
    expect(wrapped.ok && wrapped.rows.length).toBe(2);
  });

  it('fails on invalid JSON or empty input', () => {
    expect(parseImportText('', columns).ok).toBe(false);
    expect(parseImportText('[{"Nombre":', columns).ok).toBe(false);
    expect(parseImportText('[]', columns).ok).toBe(false);
  });

  it('rejects rows with no known data', () => {
    const result = parseImportText('[{"Otra":1}]', columns);
    expect(result.ok && result.rows[0].errors).toEqual(['No tiene ningún dato de las columnas de la lista']);
  });
});
