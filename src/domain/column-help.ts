import { resolveTargetValue, scoreCriterion } from './ranking';
import type { ColumnKind, RankDirection, TargetMode } from './types';

export type HelpText = {
  label: string;
  description: string;
};

export const COLUMN_KIND_HELP: Record<ColumnKind, HelpText & { example: string }> = {
  text: {
    label: 'Texto',
    description: 'Solo se muestra; no afecta el ranking.',
    example: 'Nombre, notas.',
  },
  number: {
    label: 'Número',
    description: 'Dato que llenas en cada item. Actívalo en el ranking si debe sumar puntos.',
    example: 'Precio, autonomía.',
  },
  image: {
    label: 'Imagen',
    description: 'Foto del item; solo se muestra.',
    example: 'Foto del carro.',
  },
  category: {
    label: 'Categoría',
    description: 'Opciones fijas; sirve para filtrar el ranking.',
    example: 'Tipo: Eléctrico, Gasolina.',
  },
  calculated: {
    label: 'Cálculo',
    description: 'Se calcula sola con otras columnas o variables. Puede contar en el ranking.',
    example: 'Precio ÷ Puestos.',
  },
  criterion: {
    label: 'Criterio',
    description: 'Atajo: un Número que ya nace activado en el ranking.',
    example: 'Precio, menor es mejor.',
  },
};

export const RANK_DIRECTION_HELP: Record<RankDirection, HelpText> = {
  lowerBetter: {
    label: 'Menor es mejor',
    description: 'Gana el valor más bajo. Ej.: precio, consumo, 0-100.',
  },
  higherBetter: {
    label: 'Mayor es mejor',
    description: 'Gana el valor más alto. Ej.: autonomía, batería, puestos.',
  },
};

export const TARGET_MODE_HELP: Record<TargetMode, HelpText> = {
  min: {
    label: 'El menor de la lista',
    description: 'El objetivo (100 puntos) es el valor más bajo entre los items.',
  },
  max: {
    label: 'El mayor de la lista',
    description: 'El objetivo (100 puntos) es el valor más alto entre los items.',
  },
  avg: {
    label: 'El promedio',
    description:
      'El objetivo es el promedio de los items: los que lo igualan o superan sacan 100 puntos.',
  },
  custom: {
    label: 'Un valor fijo',
    description: 'Tú defines el objetivo (ej. tu presupuesto). Quien lo cumpla saca 100 puntos.',
  },
};

/** Modo de objetivo que normalmente tiene sentido para cada sentido. */
export const RECOMMENDED_TARGET: Record<RankDirection, TargetMode> = {
  lowerBetter: 'min',
  higherBetter: 'max',
};

type Sample = {
  columnName: string;
  customValue: number;
  format: (value: number) => string;
  items: { name: string; value: number }[];
};

const SAMPLES: Record<RankDirection, Sample> = {
  lowerBetter: {
    columnName: 'Precio',
    customValue: 90_000_000,
    format: (v) => `$${Math.round(v / 1_000_000)} M`,
    items: [
      { name: 'Carro A', value: 80_000_000 },
      { name: 'Carro B', value: 100_000_000 },
      { name: 'Carro C', value: 120_000_000 },
    ],
  },
  higherBetter: {
    columnName: 'Autonomía',
    customValue: 450,
    format: (v) => `${Math.round(v)} km`,
    items: [
      { name: 'Carro A', value: 300 },
      { name: 'Carro B', value: 400 },
      { name: 'Carro C', value: 500 },
    ],
  },
};

export type RankExample = {
  /** Frase que explica cómo se fija el objetivo con los datos de ejemplo. */
  summary: string;
  rows: { name: string; value: string; score: number }[];
  /** Advertencia cuando la combinación sentido/objetivo no diferencia a los items. */
  warning?: string;
};

/**
 * Ejemplo numérico de cómo puntúa un criterio con el sentido y objetivo elegidos.
 * Usa datos de muestra fijos (precio o autonomía) y el mismo motor de ranking de la app.
 */
export function buildRankExample(direction: RankDirection, mode: TargetMode): RankExample {
  const sample = SAMPLES[direction];
  const values = sample.items.map((i) => i.value);
  const target =
    resolveTargetValue({ mode, customValue: sample.customValue }, values) ?? sample.customValue;

  const rows = sample.items.map((item) => ({
    name: item.name,
    value: sample.format(item.value),
    score: Math.round(scoreCriterion(item.value, target, direction)),
  }));

  const listed = sample.items.map((i) => sample.format(i.value)).join(', ');
  const targetText = sample.format(target);
  const summary =
    mode === 'custom'
      ? `${sample.columnName} de ${listed}. Si fijas el objetivo en ${targetText}:`
      : `${sample.columnName} de ${listed}. Objetivo = ${TARGET_MODE_HELP[mode].label.toLowerCase()} = ${targetText}:`;

  const warning = rows.every((r) => r.score === 100)
    ? `Con "${RANK_DIRECTION_HELP[direction].label}" este objetivo le da 100 a todos y el criterio no diferencia. Usa "${TARGET_MODE_HELP[RECOMMENDED_TARGET[direction]].label}".`
    : undefined;

  return { summary, rows, warning };
}
