import { describe, expect, it } from 'vitest';

import { explainTopRanking, type ExplainableRow } from './ranking-explain';
import type { ListColumn } from './types';

const columns: ListColumn[] = [
  { id: 'name', listId: 'l', name: 'Nombre', kind: 'text', order: 0 },
  {
    id: 'price',
    listId: 'l',
    name: 'Precio',
    kind: 'number',
    order: 1,
    rank: { weight: 60, direction: 'lowerBetter', target: { mode: 'min' } },
  },
  {
    id: 'speed',
    listId: 'l',
    name: 'Velocidad',
    kind: 'number',
    order: 2,
    rank: { weight: 40, direction: 'higherBetter', target: { mode: 'max' } },
  },
];

const row = (itemId: string, price: number, speed: number): ExplainableRow => ({
  itemId,
  name: itemId.toUpperCase(),
  partials: { price, speed },
  total: (price * 60 + speed * 40) / 100,
  resolvedValues: {},
});

describe('explainTopRanking', () => {
  // A: 100/50 → 80 ; B: 50/100 → 70 ; C: 40/40 → 40 ; D: 10/10 → 10
  const rows = [row('c', 40, 40), row('a', 100, 50), row('d', 10, 10), row('b', 50, 100)];
  const [first, second, third] = explainTopRanking(rows, columns);

  it('orders by total and keeps only the top 3', () => {
    expect([first.name, second.name, third.name]).toEqual(['A', 'B', 'C']);
    expect(explainTopRanking(rows, columns)).toHaveLength(3);
  });

  it('breaks each item down into points per criterion, best first', () => {
    expect(first.criteria.map((c) => [c.name, c.points, c.lost])).toEqual([
      ['Precio', 60, 0],
      ['Velocidad', 20, 20],
    ]);
  });

  it('compares against the next item: where it wins and where it loses', () => {
    expect(first.vsNext).toEqual({
      name: 'B',
      gap: 10,
      wins: [{ name: 'Precio', diff: 30 }],
      losses: [{ name: 'Velocidad', diff: -20 }],
    });
    expect(third.vsNext?.name).toBe('D');
  });

  it('has no comparison for the last item', () => {
    const [only] = explainTopRanking([row('a', 100, 100)], columns);
    expect(only.vsNext).toBeNull();
  });
});
