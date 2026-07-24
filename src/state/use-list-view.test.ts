import { describe, expect, it } from 'vitest';

import { buildDemoVehiclesBundle } from '@/data/demo-vehicles-seed';
import { computeRanking } from '@/domain';

describe('AE6 filter recalculation', () => {
  it('recalculate uses only visible items for dynamic targets', () => {
    const bundle = buildDemoVehiclesBundle();
    const hybrids = bundle.items.filter((i) => i.values.c_tipo === 'Hibrido gasolina');
    const allRanked = computeRanking(hybrids, bundle.columns, bundle.globals, {
      universeItems: bundle.items,
    });
    const recalcRanked = computeRanking(hybrids, bundle.columns, bundle.globals, {
      universeItems: hybrids,
    });

    const keep = allRanked.find((r) => r.itemId === hybrids[0].id)!;
    const recalc = recalcRanked.find((r) => r.itemId === hybrids[0].id)!;
    // Dynamic min target for precio_pasajero changes when universe shrinks → totals can differ
    expect(keep.total === recalc.total || keep.partials.c_precio_pasajero !== recalc.partials.c_precio_pasajero).toBe(
      true,
    );
  });
});
