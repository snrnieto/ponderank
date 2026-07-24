export type ColumnKind =
  | 'text'
  | 'number'
  | 'image'
  | 'category'
  | 'calculated'
  | 'criterion';

export type CalcOp =
  | 'div'
  | 'mul'
  | 'add'
  | 'sub'
  | 'pct'
  | 'globalDivCol'
  | 'colMulGlobal';

export type RankDirection = 'lowerBetter' | 'higherBetter';

export type TargetMode = 'min' | 'max' | 'avg' | 'custom';

export type ValueRef = `column:${string}` | `global:${string}`;

export type FieldValue = string | number | null;

export type List = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ListGlobal = {
  id: string;
  listId: string;
  key: string;
  label: string;
  value: number;
};

export type CalcConfig = {
  op: CalcOp;
  leftRef: ValueRef;
  rightRef: ValueRef;
};

export type RankTarget = {
  mode: TargetMode;
  customValue?: number;
};

export type RankConfig = {
  weight: number;
  direction: RankDirection;
  target: RankTarget;
};

export type ListColumn = {
  id: string;
  listId: string;
  name: string;
  kind: ColumnKind;
  options?: string[];
  calc?: CalcConfig;
  rank?: RankConfig;
  order: number;
};

export type Item = {
  id: string;
  listId: string;
  values: Record<string, FieldValue>;
  createdAt: string;
};

export type RankedItem = {
  itemId: string;
  total: number;
  partials: Record<string, number>;
  resolvedValues: Record<string, FieldValue>;
};

export type ComparisonListBundle = {
  list: List;
  globals: ListGlobal[];
  columns: ListColumn[];
  items: Item[];
};
