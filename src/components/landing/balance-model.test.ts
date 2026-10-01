import { describe, expect, it } from 'vitest';

import { weigh } from './balance-model';

describe('weigh (landing demo)', () => {
  it('changes the winner depending on which criterion carries the weights', () => {
    expect(weigh({ precio: 3, bateria: 2, almacenamiento: 1 })[0].name).toBe('Nova A15');
    expect(weigh({ precio: 1, bateria: 4, almacenamiento: 1 })[0].name).toBe('Pulse 8 Pro');
    expect(weigh({ precio: 1, bateria: 1, almacenamiento: 4 })[0].name).toBe('Zenit Ultra');
  });

  it('keeps every total within 0–100 and its parts adding up to it', () => {
    for (const option of weigh({ precio: 2, bateria: 2, almacenamiento: 2 })) {
      expect(option.total).toBeGreaterThan(0);
      expect(option.total).toBeLessThanOrEqual(100);
      expect(option.parts.reduce((a, p) => a + p.points, 0)).toBeCloseTo(option.total);
    }
  });
});
