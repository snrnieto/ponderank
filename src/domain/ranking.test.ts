import { describe, expect, it } from 'vitest';

import {
  assertWeightsSumTo100,
  computeItemScores,
  computeRanking,
  resolveTargetValue,
  scoreCriterion,
} from './ranking';
import { evaluateCalculatedColumns } from './evaluate';
import type { Item, ListColumn, ListGlobal } from './types';

function col(partial: Partial<ListColumn> & Pick<ListColumn, 'id' | 'name' | 'kind'>): ListColumn {
  return {
    listId: 'list-1',
    order: 0,
    ...partial,
  };
}

describe('scoreCriterion', () => {
  it('AE1: lowerBetter — at target is 100%, double target is 50%', () => {
    expect(scoreCriterion(250, 250, 'lowerBetter')).toBe(100);
    expect(scoreCriterion(500, 250, 'lowerBetter')).toBe(50);
  });

  it('AE2: higherBetter — above target is 100%, 2/3 target is ~66.7%', () => {
    expect(scoreCriterion(200, 150, 'higherBetter')).toBe(100);
    expect(scoreCriterion(100, 150, 'higherBetter')).toBeCloseTo(66.666, 2);
  });

  it('AE5: null value scores 0', () => {
    expect(scoreCriterion(null, 250, 'lowerBetter')).toBe(0);
  });
});

describe('assertWeightsSumTo100', () => {
  it('AE4: fails when weights sum to 90', () => {
    expect(assertWeightsSumTo100([20, 50, 20]).ok).toBe(false);
    expect(assertWeightsSumTo100([20, 50, 20]).remaining).toBeCloseTo(10);
  });

  it('passes when weights sum to 100', () => {
    expect(assertWeightsSumTo100([20, 50, 30]).ok).toBe(true);
  });
});

describe('resolveTargetValue', () => {
  it('AE3: min mode uses minimum non-empty numeric value', () => {
    const values = [15_500_000, null, 13_600_000, 18_000_000];
    expect(resolveTargetValue({ mode: 'min' }, values)).toBe(13_600_000);
  });

  it('avg ignores nulls', () => {
    expect(resolveTargetValue({ mode: 'avg' }, [10, null, 20])).toBe(15);
  });

  it('custom returns customValue', () => {
    expect(resolveTargetValue({ mode: 'custom', customValue: 250 }, [1, 2])).toBe(250);
  });
});

describe('evaluateCalculatedColumns', () => {
  it('division by zero yields null', () => {
    const columns: ListColumn[] = [
      col({ id: 'a', name: 'A', kind: 'number' }),
      col({ id: 'b', name: 'B', kind: 'number' }),
      col({
        id: 'c',
        name: 'C',
        kind: 'calculated',
        calc: { op: 'div', leftRef: 'column:a', rightRef: 'column:b' },
      }),
    ];
    const item: Item = {
      id: 'i1',
      listId: 'list-1',
      values: { a: 10, b: 0 },
      createdAt: '2026-01-01',
    };
    const result = evaluateCalculatedColumns(item, columns, []);
    expect(result.c).toBeNull();
  });

  it('AE7: colMulGlobal produces informative cost without being a criterion', () => {
    const globals: ListGlobal[] = [
      { id: 'g-km', listId: 'list-1', key: 'km_piendamo', label: 'km Piendamo', value: 240 },
    ];
    const columns: ListColumn[] = [
      col({ id: 'price_km', name: 'Precio por km', kind: 'number' }),
      col({
        id: 'cost',
        name: 'Costo Piendamo',
        kind: 'calculated',
        calc: { op: 'colMulGlobal', leftRef: 'column:price_km', rightRef: 'global:g-km' },
      }),
    ];
    const item: Item = {
      id: 'i1',
      listId: 'list-1',
      values: { price_km: 330 },
      createdAt: '2026-01-01',
    };
    const result = evaluateCalculatedColumns(item, columns, globals);
    expect(result.cost).toBe(79200);
  });
});

describe('computeRanking', () => {
  it('AE1+weights: combines criterion scores with weights', () => {
    const columns: ListColumn[] = [
      col({
        id: 'price_km',
        name: 'Precio por km',
        kind: 'criterion',
        rank: {
          weight: 50,
          direction: 'lowerBetter',
          target: { mode: 'custom', customValue: 250 },
        },
      }),
      col({
        id: 'accel',
        name: '0-100',
        kind: 'criterion',
        rank: {
          weight: 50,
          direction: 'lowerBetter',
          target: { mode: 'custom', customValue: 11 },
        },
      }),
    ];
    const items: Item[] = [
      {
        id: 'a',
        listId: 'list-1',
        values: { price_km: 250, accel: 11 },
        createdAt: '2026-01-01',
      },
      {
        id: 'b',
        listId: 'list-1',
        values: { price_km: 500, accel: 11 },
        createdAt: '2026-01-01',
      },
    ];
    const ranked = computeRanking(items, columns, []);
    expect(ranked.find((r) => r.itemId === 'a')?.total).toBe(100);
    expect(ranked.find((r) => r.itemId === 'b')?.total).toBe(75);
  });

  it('AE5: missing criterion value contributes 0 to total', () => {
    const columns: ListColumn[] = [
      col({
        id: 'accel',
        name: '0-100',
        kind: 'criterion',
        rank: {
          weight: 100,
          direction: 'lowerBetter',
          target: { mode: 'custom', customValue: 11 },
        },
      }),
    ];
    const items: Item[] = [
      { id: 'missing', listId: 'list-1', values: {}, createdAt: '2026-01-01' },
    ];
    const ranked = computeRanking(items, columns, []);
    expect(ranked[0].partials.accel).toBe(0);
    expect(ranked[0].total).toBe(0);
  });
});

describe('computeItemScores helpers', () => {
  it('exposes partials map', () => {
    const columns: ListColumn[] = [
      col({
        id: 'hp',
        name: 'HP',
        kind: 'criterion',
        rank: {
          weight: 100,
          direction: 'higherBetter',
          target: { mode: 'custom', customValue: 150 },
        },
      }),
    ];
    const item: Item = {
      id: 'i',
      listId: 'list-1',
      values: { hp: 100 },
      createdAt: '2026-01-01',
    };
    const scores = computeItemScores(item, columns, [], { hp: 150 });
    expect(scores.partials.hp).toBeCloseTo(66.666, 2);
  });
});
