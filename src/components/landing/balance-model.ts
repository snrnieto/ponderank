import { formatNumber, resolveTargetValue, scoreCriterion, type Locale, type RankDirection } from '@/domain';

/**
 * Datos de ejemplo de la landing: tres celulares ficticios (precios en COP). Están elegidos para que
 * cada criterio pueda hacer ganar a uno distinto según dónde pongas las pesas.
 */
export const DEMO_OPTIONS = [
  { id: 'nova', name: 'Nova A15', values: { precio: 899_000, bateria: 20, almacenamiento: 128 } },
  { id: 'pulse', name: 'Pulse 8 Pro', values: { precio: 1_499_000, bateria: 32, almacenamiento: 256 } },
  { id: 'zenit', name: 'Zenit Ultra', values: { precio: 3_799_000, bateria: 24, almacenamiento: 512 } },
] as const;

export type CriterionId = keyof (typeof DEMO_OPTIONS)[number]['values'];

export const DEMO_CRITERIA: {
  id: CriterionId;
  name: string;
  direction: RankDirection;
  format: (value: number, locale: Locale) => string;
}[] = [
  { id: 'precio', name: 'Precio', direction: 'lowerBetter', format: (v, locale) => `$${formatNumber(v, locale, 0)}` },
  { id: 'bateria', name: 'Batería', direction: 'higherBetter', format: (v) => `${v} h` },
  { id: 'almacenamiento', name: 'Memoria', direction: 'higherBetter', format: (v) => `${v} GB` },
];

export const MAX_WEIGHTS = 5;

export type Weights = Record<CriterionId, number>;

export type WeighedOption = {
  id: string;
  name: string;
  total: number;
  parts: { criterion: (typeof DEMO_CRITERIA)[number]; value: number; score: number; share: number; points: number }[];
};

/** Pesa las opciones de ejemplo con el mismo cálculo que usa la app (objetivo: el mejor de la lista). */
export function weigh(weights: Weights): WeighedOption[] {
  const totalWeights = DEMO_CRITERIA.reduce((acc, c) => acc + weights[c.id], 0) || 1;
  const targets = Object.fromEntries(
    DEMO_CRITERIA.map((c) => [
      c.id,
      resolveTargetValue(
        { mode: c.direction === 'lowerBetter' ? 'min' : 'max' },
        DEMO_OPTIONS.map((o) => o.values[c.id]),
      ) ?? 0,
    ]),
  ) as Record<CriterionId, number>;

  return DEMO_OPTIONS.map((option) => {
    const parts = DEMO_CRITERIA.map((criterion) => {
      const value = option.values[criterion.id];
      const score = scoreCriterion(value, targets[criterion.id], criterion.direction);
      const share = (weights[criterion.id] / totalWeights) * 100;
      return { criterion, value, score, share, points: (score * share) / 100 };
    });
    return {
      id: option.id,
      name: option.name,
      parts,
      total: parts.reduce((acc, p) => acc + p.points, 0),
    };
  }).sort((a, b) => b.total - a.total);
}
