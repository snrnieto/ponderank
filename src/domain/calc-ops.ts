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

export const CALC_OPS: CalcOpMeta[] = [
  {
    op: 'div',
    label: 'Dividir A ÷ B',
    example: 'Precio ÷ Puestos → precio por pasajero',
    description: 'Divide el valor de la columna A entre el de la columna B.',
    left: 'column',
    right: 'column',
    leftLabel: 'Columna A (numerador)',
    rightLabel: 'Columna B (denominador)',
  },
  {
    op: 'mul',
    label: 'Multiplicar A × B',
    example: 'Ancho × Alto → área',
    description: 'Multiplica dos columnas del item.',
    left: 'column',
    right: 'column',
    leftLabel: 'Columna A',
    rightLabel: 'Columna B',
  },
  {
    op: 'add',
    label: 'Sumar A + B',
    example: 'Precio + matrícula → costo total',
    description: 'Suma dos columnas del item.',
    left: 'column',
    right: 'column',
    leftLabel: 'Columna A',
    rightLabel: 'Columna B',
  },
  {
    op: 'sub',
    label: 'Restar A − B',
    example: 'Precio − descuento → neto',
    description: 'Resta la columna B de la columna A.',
    left: 'column',
    right: 'column',
    leftLabel: 'Columna A',
    rightLabel: 'Columna B (resta)',
  },
  {
    op: 'pct',
    label: 'Porcentaje (A ÷ B) × 100',
    example: 'Usado ÷ Total → % uso',
    description: 'Divide A entre B y multiplica por 100.',
    left: 'column',
    right: 'column',
    leftLabel: 'Columna A',
    rightLabel: 'Columna B',
  },
  {
    op: 'globalDivCol',
    label: 'Variable global ÷ columna',
    example: 'Precio galón ÷ km/galón → precio por km',
    description: 'Divide una variable global de la lista entre una columna del item.',
    left: 'global',
    right: 'column',
    leftLabel: 'Variable global',
    rightLabel: 'Columna del item',
  },
  {
    op: 'colMulGlobal',
    label: 'Columna × variable global',
    example: 'Precio/km × km viaje → costo del viaje',
    description: 'Multiplica una columna del item por una variable/parámetro global.',
    left: 'column',
    right: 'global',
    leftLabel: 'Columna del item',
    rightLabel: 'Variable global',
  },
];

export function getCalcOpMeta(op: CalcOp): CalcOpMeta {
  const found = CALC_OPS.find((item) => item.op === op);
  if (!found) {
    throw new Error(`Unknown calc op: ${op}`);
  }
  return found;
}
