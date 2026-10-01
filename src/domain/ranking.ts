import { evaluateCalculatedColumns } from './evaluate';
import type {
  FieldValue,
  Item,
  ListColumn,
  ListGlobal,
  RankDirection,
  RankTarget,
  RankedItem,
} from './types';

const WEIGHT_TOLERANCE = 0.01;

export function scoreCriterion(
  value: number | null,
  target: number,
  direction: RankDirection,
): number {
  if (value == null || Number.isNaN(value) || target === 0) {
    return 0;
  }
  if (direction === 'lowerBetter') {
    if (value <= target) return 100;
    return (target / value) * 100;
  }
  if (value >= target) return 100;
  return (value / target) * 100;
}

export function assertWeightsSumTo100(weights: number[]): {
  ok: boolean;
  sum: number;
  remaining: number;
} {
  const sum = weights.reduce((acc, w) => acc + w, 0);
  const remaining = 100 - sum;
  return {
    ok: Math.abs(remaining) <= WEIGHT_TOLERANCE,
    sum,
    remaining,
  };
}

export function resolveTargetValue(
  target: RankTarget,
  values: (number | null | undefined)[],
): number | null {
  if (target.mode === 'custom') {
    return target.customValue ?? null;
  }
  const nums = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  if (nums.length === 0) return null;
  if (target.mode === 'min') return Math.min(...nums);
  if (target.mode === 'max') return Math.max(...nums);
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function criterionColumns(columns: ListColumn[]): ListColumn[] {
  return columns.filter((c) => c.rank != null);
}

export function resolveTargetsForUniverse(
  columns: ListColumn[],
  resolvedByItem: Map<string, Record<string, FieldValue>>,
): Record<string, number | null> {
  const targets: Record<string, number | null> = {};
  for (const column of criterionColumns(columns)) {
    const rank = column.rank!;
    const columnValues = [...resolvedByItem.values()].map((vals) => {
      const v = vals[column.id];
      return typeof v === 'number' ? v : null;
    });
    targets[column.id] = resolveTargetValue(rank.target, columnValues);
  }
  return targets;
}

export function computeItemScores(
  item: Item,
  columns: ListColumn[],
  globals: ListGlobal[],
  targets: Record<string, number | null>,
): { partials: Record<string, number>; total: number; resolvedValues: Record<string, FieldValue> } {
  const resolvedValues = evaluateCalculatedColumns(item, columns, globals);
  const partials: Record<string, number> = {};
  let total = 0;

  for (const column of criterionColumns(columns)) {
    const rank = column.rank!;
    const target = targets[column.id];
    const raw = resolvedValues[column.id];
    const numeric = typeof raw === 'number' ? raw : null;
    const score =
      target == null ? 0 : scoreCriterion(numeric, target, rank.direction);
    partials[column.id] = score;
    total += (score * rank.weight) / 100;
  }

  return { partials, total, resolvedValues };
}

export type ComputeRankingOptions = {
  /** Items used only for target resolution (universe). Defaults to `items`. */
  universeItems?: Item[];
};

export function computeRanking(
  items: Item[],
  columns: ListColumn[],
  globals: ListGlobal[],
  options: ComputeRankingOptions = {},
): RankedItem[] {
  const universe = options.universeItems ?? items;
  const universeResolved = new Map<string, Record<string, FieldValue>>();
  for (const item of universe) {
    universeResolved.set(item.id, evaluateCalculatedColumns(item, columns, globals));
  }
  const targets = resolveTargetsForUniverse(columns, universeResolved);

  return items.map((item) => {
    const scored = computeItemScores(item, columns, globals, targets);
    return {
      itemId: item.id,
      total: scored.total,
      partials: scored.partials,
      resolvedValues: scored.resolvedValues,
    };
  });
}

export function canSaveSchema(columns: ListColumn[]): {
  ok: boolean;
  sum: number;
  remaining: number;
} {
  const weights = criterionColumns(columns).map((c) => c.rank!.weight);
  if (weights.length === 0) {
    return { ok: true, sum: 0, remaining: 0 };
  }
  return assertWeightsSumTo100(weights);
}
