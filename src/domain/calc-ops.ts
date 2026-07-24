import type { CalcOp } from './types';

export type CalcOpMeta = {
  op: CalcOp;
  label: string;
  example: string;
  description: string;
};

export const CALC_OPS: CalcOpMeta[] = [
  {
    op: 'div',
    label: 'Dividir A ÷ B',
    example: 'Precio ÷ Puestos → precio por pasajero',
    description: 'Divide el valor de la columna A entre el de la columna B.',
  },
  {
    op: 'mul',
    label: 'Multiplicar A × B',
    example: 'Ancho × Alto → área',
    description: 'Multiplica dos columnas del item.',
  },
  {
    op: 'add',
    label: 'Sumar A + B',
    example: 'Precio + matrícula → costo total',
    description: 'Suma dos columnas del item.',
  },
  {
    op: 'sub',
    label: 'Restar A − B',
    example: 'Precio − descuento → neto',
    description: 'Resta la columna B de la columna A.',
  },
  {
    op: 'pct',
    label: 'Porcentaje (A ÷ B) × 100',
    example: 'Usado ÷ Total → % uso',
    description: 'Divide A entre B y multiplica por 100.',
  },
  {
    op: 'globalDivCol',
    label: 'Variable global ÷ columna',
    example: 'Precio galón ÷ km/galón → precio por km',
    description: 'Divide una variable global de la lista entre una columna del item.',
  },
  {
    op: 'colMulGlobal',
    label: 'Columna × variable global',
    example: 'Precio/km × km viaje → costo del viaje',
    description: 'Multiplica una columna del item por una variable/parámetro global.',
  },
];

export function getCalcOpMeta(op: CalcOp): CalcOpMeta {
  const found = CALC_OPS.find((item) => item.op === op);
  if (!found) {
    throw new Error(`Unknown calc op: ${op}`);
  }
  return found;
}
