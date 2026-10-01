import type { Locale } from './locale';
import { resolveTargetValue, scoreCriterion } from './ranking';
import type { ColumnKind, RankDirection, TargetMode } from './types';

export type HelpText = {
  label: string;
  description: string;
};

const KIND_HELP: Record<Locale, Record<ColumnKind, HelpText & { example: string }>> = {
  es: {
    text: {
      label: 'Texto',
      description: 'Un texto que solo se muestra, como el nombre o una nota. No cuenta para decidir.',
      example: 'Nombre, notas.',
    },
    number: {
      label: 'Número',
      description: 'Un número que anotas en cada opción, como el precio o la batería. Puede contar para decidir.',
      example: 'Precio, autonomía.',
    },
    image: { label: 'Imagen', description: 'Una foto de cada opción. Solo se muestra.', example: 'Foto del carro.' },
    category: {
      label: 'Tipo',
      description: 'Una etiqueta de una lista cerrada, como «Gasolina» o «Eléctrico». Sirve para filtrar.',
      example: 'Tipo: Eléctrico, Gasolina.',
    },
    calculated: {
      label: 'Dato calculado',
      description: 'Se calcula solo a partir de otros datos, como precio ÷ puestos. Puede contar para decidir.',
      example: 'Precio ÷ Puestos.',
    },
    criterion: { label: 'Número que cuenta', description: 'Un número que ya cuenta para decidir.', example: 'Precio.' },
  },
  en: {
    text: {
      label: 'Text',
      description: 'Text that is only displayed, like the name or a note. It does not count toward the decision.',
      example: 'Name, notes.',
    },
    number: {
      label: 'Number',
      description: 'A number you enter for each option, like the price or battery life. It can count toward the decision.',
      example: 'Price, range.',
    },
    image: { label: 'Image', description: 'A photo of each option. Only displayed.', example: 'Photo of the car.' },
    category: {
      label: 'Type',
      description: 'A label from a fixed list, like “Gas” or “Electric”. Useful for filtering.',
      example: 'Type: Electric, Gas.',
    },
    calculated: {
      label: 'Calculated value',
      description: 'Calculated from other values, like price ÷ seats. It can count toward the decision.',
      example: 'Price ÷ Seats.',
    },
    criterion: { label: 'Counting number', description: 'A number that already counts toward the decision.', example: 'Price.' },
  },
};

const DIRECTION_HELP: Record<Locale, Record<RankDirection, HelpText>> = {
  es: {
    lowerBetter: { label: 'Mejor si es más bajo', description: 'Gana el valor más bajo, como el precio o el consumo.' },
    higherBetter: { label: 'Mejor si es más alto', description: 'Gana el valor más alto, como la batería o los puestos.' },
  },
  en: {
    lowerBetter: { label: 'Lower is better', description: 'The lowest value wins, like price or fuel use.' },
    higherBetter: { label: 'Higher is better', description: 'The highest value wins, like battery life or seats.' },
  },
};

const TARGET_HELP: Record<Locale, Record<TargetMode, HelpText>> = {
  es: {
    min: { label: 'El menor de la lista', description: 'La opción con el valor más bajo saca 100.' },
    max: { label: 'El mayor de la lista', description: 'La opción con el valor más alto saca 100.' },
    avg: { label: 'El promedio', description: 'Saca 100 quien iguale o supere el promedio de las opciones.' },
    custom: { label: 'Un valor fijo', description: 'Tú pones el número, por ejemplo tu presupuesto. Quien lo cumpla saca 100.' },
  },
  en: {
    min: { label: 'The lowest in the list', description: 'The option with the lowest value scores 100.' },
    max: { label: 'The highest in the list', description: 'The option with the highest value scores 100.' },
    avg: { label: 'The average', description: 'Anything that matches or beats the average scores 100.' },
    custom: { label: 'A fixed value', description: 'You set the number, like your budget. Anything that meets it scores 100.' },
  },
};

export function columnKindHelp(locale: Locale = 'es') {
  return KIND_HELP[locale];
}

export function rankDirectionHelp(locale: Locale = 'es') {
  return DIRECTION_HELP[locale];
}

export function targetModeHelp(locale: Locale = 'es') {
  return TARGET_HELP[locale];
}

/** Modo de objetivo que normalmente tiene sentido para cada sentido. */
export const RECOMMENDED_TARGET: Record<RankDirection, TargetMode> = {
  lowerBetter: 'min',
  higherBetter: 'max',
};

type Sample = {
  customValue: number;
  format: (value: number) => string;
  values: number[];
};

const SAMPLES: Record<RankDirection, Sample> = {
  lowerBetter: {
    customValue: 90_000_000,
    format: (v) => `$${Math.round(v / 1_000_000)} M`,
    values: [80_000_000, 100_000_000, 120_000_000],
  },
  higherBetter: {
    customValue: 450,
    format: (v) => `${Math.round(v)} km`,
    values: [300, 400, 500],
  },
};

const SAMPLE_TEXT: Record<Locale, { column: Record<RankDirection, string>; item: (letter: string) => string }> = {
  es: { column: { lowerBetter: 'Precio', higherBetter: 'Autonomía' }, item: (l) => `Carro ${l}` },
  en: { column: { lowerBetter: 'Price', higherBetter: 'Range' }, item: (l) => `Car ${l}` },
};

export type RankExample = {
  /** Frase que explica cómo se fija el objetivo con los datos de ejemplo. */
  summary: string;
  rows: { name: string; value: string; score: number }[];
  /** Advertencia cuando la combinación sentido/objetivo no diferencia a las opciones. */
  warning?: string;
};

/**
 * Ejemplo numérico de cómo puntúa un criterio con el sentido y objetivo elegidos.
 * Usa datos de muestra fijos (precio o autonomía) y el mismo motor de ranking de la app.
 */
export function buildRankExample(direction: RankDirection, mode: TargetMode, locale: Locale = 'es'): RankExample {
  const sample = SAMPLES[direction];
  const text = SAMPLE_TEXT[locale];
  const target = resolveTargetValue({ mode, customValue: sample.customValue }, sample.values) ?? sample.customValue;

  const rows = sample.values.map((value, i) => ({
    name: text.item(['A', 'B', 'C'][i]),
    value: sample.format(value),
    score: Math.round(scoreCriterion(value, target, direction)),
  }));

  const listed = sample.values.map(sample.format).join(', ');
  const targetText = sample.format(target);
  const column = text.column[direction];
  const summary =
    locale === 'es'
      ? mode === 'custom'
        ? `${column} de ${listed}. Si pones ${targetText} como el valor que saca 100:`
        : `${column} de ${listed}. Saca 100 ${TARGET_HELP.es[mode].label.toLowerCase()} = ${targetText}:`
      : mode === 'custom'
        ? `${column} of ${listed}. If ${targetText} is the value that scores 100:`
        : `${column} of ${listed}. ${TARGET_HELP.en[mode].label} scores 100 = ${targetText}:`;

  const allMax = rows.every((r) => r.score === 100);
  const recommended = TARGET_HELP[locale][RECOMMENDED_TARGET[direction]].label;
  const directionLabel = DIRECTION_HELP[locale][direction].label;
  const warning = allMax
    ? locale === 'es'
      ? `Con «${directionLabel}» esta opción le da 100 a todas y este dato no ayuda a decidir. Usa «${recommended}».`
      : `With “${directionLabel}” this gives every option 100, so this value doesn't help you decide. Use “${recommended}”.`
    : undefined;

  return { summary, rows, warning };
}
