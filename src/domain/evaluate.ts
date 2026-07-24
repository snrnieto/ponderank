import type {
  CalcConfig,
  CalcOp,
  FieldValue,
  Item,
  ListColumn,
  ListGlobal,
  ValueRef,
} from './types';

function parseRef(ref: ValueRef): { kind: 'column' | 'global'; id: string } {
  const [kind, id] = ref.split(':') as ['column' | 'global', string];
  return { kind, id };
}

function readNumber(
  ref: ValueRef,
  values: Record<string, FieldValue>,
  globals: ListGlobal[],
): number | null {
  const parsed = parseRef(ref);
  if (parsed.kind === 'global') {
    const global = globals.find((g) => g.id === parsed.id);
    return global == null ? null : global.value;
  }
  const raw = values[parsed.id];
  if (raw == null || typeof raw !== 'number' || Number.isNaN(raw)) {
    return null;
  }
  return raw;
}

function applyOp(op: CalcOp, left: number, right: number): number | null {
  switch (op) {
    case 'div':
    case 'globalDivCol':
      if (right === 0) return null;
      return left / right;
    case 'mul':
    case 'colMulGlobal':
      return left * right;
    case 'add':
      return left + right;
    case 'sub':
      return left - right;
    case 'pct':
      if (right === 0) return null;
      return (left / right) * 100;
    default:
      return null;
  }
}

function depsOf(calc: CalcConfig): string[] {
  const refs = [calc.leftRef, calc.rightRef];
  return refs
    .filter((ref) => ref.startsWith('column:'))
    .map((ref) => parseRef(ref).id);
}

function topologicalCalculated(columns: ListColumn[]): ListColumn[] {
  const calculated = columns.filter((c) => c.calc);
  const byId = new Map(calculated.map((c) => [c.id, c]));
  const visited = new Set<string>();
  const stack = new Set<string>();
  const ordered: ListColumn[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    if (stack.has(id)) {
      throw new Error(`Circular calculated column dependency involving ${id}`);
    }
    stack.add(id);
    const column = byId.get(id);
    if (column?.calc) {
      for (const dep of depsOf(column.calc)) {
        if (byId.has(dep)) visit(dep);
      }
    }
    stack.delete(id);
    visited.add(id);
    if (column) ordered.push(column);
  }

  for (const column of calculated) {
    visit(column.id);
  }
  return ordered;
}

/** Merge item values with evaluated calculated columns. */
export function evaluateCalculatedColumns(
  item: Item,
  columns: ListColumn[],
  globals: ListGlobal[],
): Record<string, FieldValue> {
  const values: Record<string, FieldValue> = { ...item.values };
  const ordered = topologicalCalculated(columns);

  for (const column of ordered) {
    const calc = column.calc;
    if (!calc) {
      values[column.id] = null;
      continue;
    }
    const left = readNumber(calc.leftRef, values, globals);
    const right = readNumber(calc.rightRef, values, globals);
    if (left == null || right == null) {
      values[column.id] = null;
      continue;
    }
    values[column.id] = applyOp(calc.op, left, right);
  }

  return values;
}
