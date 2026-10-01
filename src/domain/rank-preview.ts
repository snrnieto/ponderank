import { evaluateCalculatedColumns } from './evaluate';
import { resolveTargetValue, scoreCriterion } from './ranking';
import type { Item, ListColumn, ListGlobal, RankDirection, RankTarget } from './types';

export type NamedValue = { name: string; value: number };

export type TargetPreview = {
  count: number;
  min: NamedValue;
  max: NamedValue;
  avg: number;
  /** Valor que saca 100 puntos con el objetivo elegido (null si es fijo y no hay valor). */
  target: number | null;
  /** Mejor, intermedio y peor item con su puntaje en este criterio (sin repetidos). */
  rows: (NamedValue & { score: number })[];
};

/** Nombre visible de un item: su primera columna de texto. */
export function itemDisplayName(item: Item, columns: ListColumn[], fallback = 'Sin nombre'): string {
  const textColumn = columns.find((c) => c.kind === 'text');
  const value = textColumn ? item.values[textColumn.id] : null;
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

/**
 * Valores numéricos de una columna en todos los items (resolviendo columnas calculadas).
 * Ignora items sin valor. Si el esquema tiene un ciclo de cálculos devuelve [].
 */
export function collectColumnValues(
  items: Item[],
  columns: ListColumn[],
  globals: ListGlobal[],
  columnId: string,
): NamedValue[] {
  try {
    return items.flatMap((item) => {
      const value = evaluateCalculatedColumns(item, columns, globals)[columnId];
      return typeof value === 'number' && Number.isFinite(value)
        ? [{ name: itemDisplayName(item, columns), value }]
        : [];
    });
  } catch {
    return [];
  }
}

export function buildTargetPreview(
  values: NamedValue[],
  direction: RankDirection,
  target: RankTarget,
): TargetPreview | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a.value - b.value);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = values.reduce((acc, v) => acc + v.value, 0) / values.length;
  const targetValue = resolveTargetValue(
    target,
    values.map((v) => v.value),
  );

  const bestFirst = direction === 'lowerBetter' ? sorted : [...sorted].reverse();
  const picks = [bestFirst[0], bestFirst[Math.floor((bestFirst.length - 1) / 2)], bestFirst[bestFirst.length - 1]];
  const rows = [...new Set(picks)].map((v) => ({
    ...v,
    score: targetValue == null ? 0 : Math.round(scoreCriterion(v.value, targetValue, direction)),
  }));

  return { count: values.length, min, max, avg, target: targetValue, rows };
}
