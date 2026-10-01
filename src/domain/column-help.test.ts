import { describe, expect, it } from 'vitest';

import { buildRankExample } from './column-help';

const scores = (ex: ReturnType<typeof buildRankExample>) => ex.rows.map((r) => r.score);

describe('buildRankExample', () => {
  it('lowerBetter + min: the cheapest gets 100, the rest proportionally less', () => {
    const ex = buildRankExample('lowerBetter', 'min');
    expect(scores(ex)).toEqual([100, 80, 67]);
    expect(ex.summary).toContain('$80 M');
    expect(buildRankExample('lowerBetter', 'min', 'en').summary).toContain('Price of $80 M');
    expect(ex.warning).toBeUndefined();
  });

  it('lowerBetter + max: everyone gets 100 and a warning is shown', () => {
    const ex = buildRankExample('lowerBetter', 'max');
    expect(scores(ex)).toEqual([100, 100, 100]);
    expect(ex.warning).toContain('El menor de la lista');
    expect(buildRankExample('lowerBetter', 'max', 'en').warning).toContain('The lowest in the list');
  });

  it('lowerBetter + avg and custom', () => {
    expect(scores(buildRankExample('lowerBetter', 'avg'))).toEqual([100, 100, 83]);
    expect(scores(buildRankExample('lowerBetter', 'custom'))).toEqual([100, 90, 75]);
  });

  it('higherBetter + max: the longest range gets 100', () => {
    const ex = buildRankExample('higherBetter', 'max');
    expect(scores(ex)).toEqual([60, 80, 100]);
    expect(ex.warning).toBeUndefined();
  });

  it('higherBetter + min warns', () => {
    expect(buildRankExample('higherBetter', 'min').warning).toContain('El mayor de la lista');
  });
});
