import { describe, expect, it } from 'vitest';

import { buildTargetPreview, collectColumnValues } from './rank-preview';
import type { Item, ListColumn } from './types';

const columns: ListColumn[] = [
  { id: 'name', listId: 'l', name: 'Nombre', kind: 'text', order: 0 },
  { id: 'price', listId: 'l', name: 'Precio', kind: 'number', order: 1 },
  { id: 'seats', listId: 'l', name: 'Puestos', kind: 'number', order: 2 },
  {
    id: 'pp',
    listId: 'l',
    name: 'Precio por pasajero',
    kind: 'calculated',
    order: 3,
    calc: { op: 'div', leftRef: 'column:price', rightRef: 'column:seats' },
  },
];

function item(id: string, name: string, price: number | null, seats: number): Item {
  return { id, listId: 'l', createdAt: '', values: { name, price, seats } };
}

const items = [item('a', 'A', 80, 4), item('b', 'B', 100, 5), item('c', 'C', 120, 4), item('d', 'D', null, 5)];

describe('collectColumnValues', () => {
  it('reads raw and calculated values, skipping empty ones', () => {
    expect(collectColumnValues(items, columns, [], 'price')).toEqual([
      { name: 'A', value: 80 },
      { name: 'B', value: 100 },
      { name: 'C', value: 120 },
    ]);
    expect(collectColumnValues(items, columns, [], 'pp').map((v) => v.value)).toEqual([20, 20, 30]);
  });
});

describe('buildTargetPreview', () => {
  const values = collectColumnValues(items, columns, [], 'price');

  it('returns min, max, avg with item names and the resolved target', () => {
    const preview = buildTargetPreview(values, 'lowerBetter', { mode: 'min' })!;
    expect(preview.min).toEqual({ name: 'A', value: 80 });
    expect(preview.max).toEqual({ name: 'C', value: 120 });
    expect(preview.avg).toBe(100);
    expect(preview.target).toBe(80);
    expect(preview.count).toBe(3);
  });

  it('lists best, middle and worst with their scores', () => {
    const lower = buildTargetPreview(values, 'lowerBetter', { mode: 'min' })!;
    expect(lower.rows.map((r) => [r.name, r.score])).toEqual([
      ['A', 100],
      ['B', 80],
      ['C', 67],
    ]);
    const higher = buildTargetPreview(values, 'higherBetter', { mode: 'custom', customValue: 110 })!;
    expect(higher.rows.map((r) => [r.name, r.score])).toEqual([
      ['C', 100],
      ['B', 91],
      ['A', 73],
    ]);
  });

  it('returns null without values', () => {
    expect(buildTargetPreview([], 'lowerBetter', { mode: 'min' })).toBeNull();
  });
});
