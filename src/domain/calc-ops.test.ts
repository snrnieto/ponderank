import { describe, expect, it } from 'vitest';

import { formatCalcFormula } from './calc-ops';

describe('formatCalcFormula', () => {
  it('formats each operation with the operand labels', () => {
    expect(formatCalcFormula('div', 'Precio', 'Puestos')).toBe('Precio ÷ Puestos');
    expect(formatCalcFormula('colMulGlobal', 'Precio/km', 'Km viaje')).toBe('Precio/km × Km viaje');
    expect(formatCalcFormula('pct', 'Usado', 'Total')).toBe('(Usado ÷ Total) × 100');
  });
});
