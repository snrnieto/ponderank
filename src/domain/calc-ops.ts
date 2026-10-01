import type { Locale } from './locale';
import type { CalcOp } from './types';

export type CalcOpMeta = {
  op: CalcOp;
  label: string;
  example: string;
  description: string;
  left: 'column' | 'global';
  right: 'column' | 'global';
  leftLabel: string;
  rightLabel: string;
};

type OpShape = Pick<CalcOpMeta, 'op' | 'left' | 'right'>;
type OpText = Omit<CalcOpMeta, 'op' | 'left' | 'right'>;

const SHAPES: OpShape[] = [
  { op: 'div', left: 'column', right: 'column' },
  { op: 'mul', left: 'column', right: 'column' },
  { op: 'add', left: 'column', right: 'column' },
  { op: 'sub', left: 'column', right: 'column' },
  { op: 'pct', left: 'column', right: 'column' },
  { op: 'globalDivCol', left: 'global', right: 'column' },
  { op: 'colMulGlobal', left: 'column', right: 'global' },
];

const TEXT: Record<Locale, Record<CalcOp, OpText>> = {
  es: {
    div: {
      label: 'Dividir A ÷ B',
      example: 'Precio ÷ Puestos → precio por pasajero',
      description: 'Divide el dato A entre el dato B.',
      leftLabel: 'Dato A',
      rightLabel: 'Dato B (divide a A)',
    },
    mul: {
      label: 'Multiplicar A × B',
      example: 'Ancho × Alto → área',
      description: 'Multiplica dos datos de la opción.',
      leftLabel: 'Dato A',
      rightLabel: 'Dato B',
    },
    add: {
      label: 'Sumar A + B',
      example: 'Precio + matrícula → costo total',
      description: 'Suma dos datos de la opción.',
      leftLabel: 'Dato A',
      rightLabel: 'Dato B',
    },
    sub: {
      label: 'Restar A − B',
      example: 'Precio − descuento → neto',
      description: 'Le resta el dato B al dato A.',
      leftLabel: 'Dato A',
      rightLabel: 'Dato B (se resta)',
    },
    pct: {
      label: 'Porcentaje (A ÷ B) × 100',
      example: 'Usado ÷ Total → % de uso',
      description: 'Divide A entre B y multiplica por 100.',
      leftLabel: 'Dato A',
      rightLabel: 'Dato B',
    },
    globalDivCol: {
      label: 'Dato fijo ÷ dato',
      example: 'Precio del galón ÷ km por galón → precio por km',
      description: 'Divide un dato fijo de la lista entre un dato de la opción.',
      leftLabel: 'Dato fijo',
      rightLabel: 'Dato de la opción',
    },
    colMulGlobal: {
      label: 'Dato × dato fijo',
      example: 'Precio por km × km del viaje → costo del viaje',
      description: 'Multiplica un dato de la opción por un dato fijo de la lista.',
      leftLabel: 'Dato de la opción',
      rightLabel: 'Dato fijo',
    },
  },
  en: {
    div: {
      label: 'Divide A ÷ B',
      example: 'Price ÷ Seats → price per passenger',
      description: 'Divides value A by value B.',
      leftLabel: 'Value A',
      rightLabel: 'Value B (divides A)',
    },
    mul: {
      label: 'Multiply A × B',
      example: 'Width × Height → area',
      description: 'Multiplies two values of the option.',
      leftLabel: 'Value A',
      rightLabel: 'Value B',
    },
    add: {
      label: 'Add A + B',
      example: 'Price + registration → total cost',
      description: 'Adds two values of the option.',
      leftLabel: 'Value A',
      rightLabel: 'Value B',
    },
    sub: {
      label: 'Subtract A − B',
      example: 'Price − discount → net',
      description: 'Subtracts value B from value A.',
      leftLabel: 'Value A',
      rightLabel: 'Value B (subtracted)',
    },
    pct: {
      label: 'Percentage (A ÷ B) × 100',
      example: 'Used ÷ Total → % used',
      description: 'Divides A by B and multiplies by 100.',
      leftLabel: 'Value A',
      rightLabel: 'Value B',
    },
    globalDivCol: {
      label: 'Fixed value ÷ value',
      example: 'Gas price per gallon ÷ km per gallon → price per km',
      description: 'Divides a fixed value of the list by a value of the option.',
      leftLabel: 'Fixed value',
      rightLabel: 'Option value',
    },
    colMulGlobal: {
      label: 'Value × fixed value',
      example: 'Price per km × trip km → trip cost',
      description: 'Multiplies a value of the option by a fixed value of the list.',
      leftLabel: 'Option value',
      rightLabel: 'Fixed value',
    },
  },
};

/** Operaciones predefinidas (sin editor de fórmulas, por decisión de producto) en el idioma dado. */
export function getCalcOps(locale: Locale = 'es'): CalcOpMeta[] {
  return SHAPES.map((shape) => ({ ...shape, ...TEXT[locale][shape.op] }));
}

/** @deprecated Usa `getCalcOps(locale)`. Se mantiene en español por compatibilidad. */
export const CALC_OPS: CalcOpMeta[] = getCalcOps('es');

export function getCalcOpMeta(op: CalcOp, locale: Locale = 'es'): CalcOpMeta {
  const found = getCalcOps(locale).find((item) => item.op === op);
  if (!found) {
    throw new Error(`Unknown calc op: ${op}`);
  }
  return found;
}

/** Fórmula legible de un cálculo, ej. "Precio ÷ Puestos". */
export function formatCalcFormula(op: CalcOp, left: string, right: string): string {
  switch (op) {
    case 'div':
    case 'globalDivCol':
      return `${left} ÷ ${right}`;
    case 'mul':
    case 'colMulGlobal':
      return `${left} × ${right}`;
    case 'add':
      return `${left} + ${right}`;
    case 'sub':
      return `${left} − ${right}`;
    case 'pct':
      return `(${left} ÷ ${right}) × 100`;
  }
}
