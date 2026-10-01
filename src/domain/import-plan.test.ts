import { describe, expect, it } from 'vitest';

import { planImport } from './import-plan';
import type { FieldValue, Item, ListColumn } from './types';

const columns: ListColumn[] = [
  { id: 'name', listId: 'l', name: 'Nombre', kind: 'text', order: 0 },
  { id: 'cost', listId: 'l', name: 'Costo', kind: 'number', order: 1 },
  { id: 'speed', listId: 'l', name: 'Velocidad', kind: 'number', order: 2 },
];

const existing: Item[] = [
  { id: 'a', listId: 'l', createdAt: '', values: { name: 'GPT-6 Luna', cost: 0.2, speed: 125 } },
  { id: 'b', listId: 'l', createdAt: '', values: { name: 'Kimi K3', cost: 6, speed: 34 } },
];

let seq = 0;
const newItem = (values: Record<string, FieldValue>): Item => ({
  id: `new${++seq}`,
  listId: 'l',
  createdAt: '',
  values,
});

describe('planImport', () => {
  it('append adds every row', () => {
    const plan = planImport(existing, columns, [{ name: 'Kimi K3', cost: 2 }], 'append', newItem);
    expect(plan.items).toHaveLength(3);
    expect(plan).toMatchObject({ added: 1, updated: 0, removed: 0, actions: ['add'] });
  });

  it('upsert updates by normalized name, keeps values the row does not bring, adds the rest', () => {
    const plan = planImport(
      existing,
      columns,
      [
        { name: '  kimi   k3 ', cost: 2 },
        { name: 'Step 5', cost: 0.72 },
      ],
      'upsert',
      newItem,
    );
    expect(plan).toMatchObject({ added: 1, updated: 1, removed: 0, actions: ['update', 'add'] });
    const kimi = plan.items.find((i) => i.id === 'b')!;
    expect(kimi.values).toEqual({ name: '  kimi   k3 ', cost: 2, speed: 34 });
    expect(plan.items).toHaveLength(3);
    // No modifica los items originales.
    expect(existing[1].values.cost).toBe(6);
  });

  it('upsert merges repeated rows of the same new item instead of duplicating', () => {
    const plan = planImport(
      [],
      columns,
      [
        { name: 'Nuevo', cost: 1 },
        { name: 'nuevo', speed: 50 },
      ],
      'upsert',
      newItem,
    );
    expect(plan.items).toHaveLength(1);
    expect(plan.items[0].values).toMatchObject({ cost: 1, speed: 50 });
    expect(plan).toMatchObject({ added: 1, updated: 0, actions: ['add', 'update'] });
  });

  it('replace drops existing items and keeps only imported ones', () => {
    const plan = planImport(existing, columns, [{ name: 'Solo', cost: 1 }], 'replace', newItem);
    expect(plan.items.map((i) => i.values.name)).toEqual(['Solo']);
    expect(plan).toMatchObject({ added: 1, updated: 0, removed: 2 });
  });
});
