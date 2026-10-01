import { normalizeKey } from './bulk-import';
import type { FieldValue, Item, ListColumn } from './types';

/**
 * - `append`: todas las filas se agregan como items nuevos.
 * - `upsert`: si el nombre coincide con un item existente se actualizan sus valores; si no, se agrega.
 * - `replace`: se borran todos los items actuales y quedan solo los importados.
 */
export type ImportMode = 'append' | 'upsert' | 'replace';

export type ImportRowAction = 'add' | 'update';

export type ImportPlan = {
  /** Lista final de items de la lista tras aplicar la importación. */
  items: Item[];
  /** Acción por fila, en el mismo orden que `rows`. */
  actions: ImportRowAction[];
  added: number;
  updated: number;
  removed: number;
};

function nameKey(values: Record<string, FieldValue>, nameColumnId: string | undefined): string | null {
  const raw = nameColumnId ? values[nameColumnId] : null;
  if (typeof raw !== 'string') return null;
  const key = normalizeKey(raw).replace(/\s+/g, ' ');
  return key === '' ? null : key;
}

export function planImport(
  existing: Item[],
  columns: ListColumn[],
  rows: Record<string, FieldValue>[],
  mode: ImportMode,
  newItem: (values: Record<string, FieldValue>) => Item,
): ImportPlan {
  const nameColumnId = columns.find((c) => c.kind === 'text')?.id;
  const items = mode === 'replace' ? [] : existing.map((item) => ({ ...item }));
  const removed = mode === 'replace' ? existing.length : 0;

  // Índice nombre → posición en `items`; incluye los agregados para fusionar filas repetidas.
  const byName = new Map<string, number>();
  if (mode === 'upsert') {
    items.forEach((item, index) => {
      const key = nameKey(item.values, nameColumnId);
      if (key && !byName.has(key)) byName.set(key, index);
    });
  }

  const actions: ImportRowAction[] = [];
  const updatedIndexes = new Set<number>();
  let added = 0;

  for (const values of rows) {
    const key = mode === 'upsert' ? nameKey(values, nameColumnId) : null;
    const index = key != null ? byName.get(key) : undefined;
    if (index != null) {
      // Solo pisa los valores que trae la fila; lo vacío conserva el valor actual.
      items[index] = { ...items[index], values: { ...items[index].values, ...values } };
      if (index < existing.length) updatedIndexes.add(index);
      actions.push('update');
      continue;
    }
    items.push(newItem(values));
    if (key != null) byName.set(key, items.length - 1);
    added++;
    actions.push('add');
  }

  return { items, actions, added, updated: updatedIndexes.size, removed };
}
