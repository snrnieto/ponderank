import type { FieldValue, ListColumn } from './types';

export type ExplainableRow = {
  itemId: string;
  name: string;
  total: number;
  partials: Record<string, number>;
  resolvedValues: Record<string, FieldValue>;
};

export type CriterionBreakdown = {
  columnId: string;
  name: string;
  weight: number;
  value: FieldValue;
  /** Puntaje 0–100 en el criterio. */
  score: number;
  /** Puntos que aporta al total (score × peso / 100). */
  points: number;
  /** Puntos que deja de ganar respecto al máximo posible (peso − points). */
  lost: number;
};

export type CriterionDiff = { name: string; diff: number };

export type RankExplanation = {
  itemId: string;
  name: string;
  position: number;
  total: number;
  /** Criterios ordenados de mayor a menor aporte. */
  criteria: CriterionBreakdown[];
  /** Comparación contra el siguiente del ranking (null si es el último). */
  vsNext: {
    name: string;
    gap: number;
    /** Criterios donde saca más puntos que el siguiente, de mayor a menor ventaja. */
    wins: CriterionDiff[];
    /** Criterios donde saca menos puntos que el siguiente, de mayor a menor desventaja. */
    losses: CriterionDiff[];
  } | null;
};

const EPSILON = 0.05;

function breakdown(row: ExplainableRow, criteria: ListColumn[]): CriterionBreakdown[] {
  return criteria
    .map((column) => {
      const weight = column.rank!.weight;
      const score = row.partials[column.id] ?? 0;
      const points = (score * weight) / 100;
      return {
        columnId: column.id,
        name: column.name,
        weight,
        value: row.resolvedValues[column.id] ?? null,
        score,
        points,
        lost: weight - points,
      };
    })
    .sort((a, b) => b.points - a.points);
}

/** Explica por qué los primeros `count` items del ranking (por puntaje total) quedan donde quedan. */
export function explainTopRanking(
  rows: ExplainableRow[],
  columns: ListColumn[],
  count = 3,
): RankExplanation[] {
  const criteria = columns.filter((c) => c.rank);
  const byTotal = [...rows].sort((a, b) => b.total - a.total);

  return byTotal.slice(0, count).map((row, index) => {
    const own = breakdown(row, criteria);
    const next = byTotal[index + 1];
    let vsNext: RankExplanation['vsNext'] = null;
    if (next) {
      const nextPoints = new Map(breakdown(next, criteria).map((c) => [c.columnId, c.points]));
      const diffs = own.map((c) => ({ name: c.name, diff: c.points - (nextPoints.get(c.columnId) ?? 0) }));
      vsNext = {
        name: next.name,
        gap: row.total - next.total,
        wins: diffs.filter((d) => d.diff > EPSILON).sort((a, b) => b.diff - a.diff),
        losses: diffs.filter((d) => d.diff < -EPSILON).sort((a, b) => a.diff - b.diff),
      };
    }
    return { itemId: row.itemId, name: row.name, position: index + 1, total: row.total, criteria: own, vsNext };
  });
}
