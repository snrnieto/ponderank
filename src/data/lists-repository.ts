import type { ComparisonListBundle, Item, List, ListColumn, ListGlobal } from '@/domain';

export type ListsRepository = {
  loadAll(): Promise<ComparisonListBundle[]>;
  saveAll(bundles: ComparisonListBundle[]): Promise<void>;
  getBundle(listId: string): Promise<ComparisonListBundle | null>;
  upsertBundle(bundle: ComparisonListBundle): Promise<void>;
  deleteList(listId: string): Promise<void>;
  createList(name: string): Promise<ComparisonListBundle>;
  upsertItem(listId: string, item: Item): Promise<void>;
  deleteItem(listId: string, itemId: string): Promise<void>;
  replaceSchema(
    listId: string,
    schema: { globals: ListGlobal[]; columns: ListColumn[] },
  ): Promise<void>;
  renameList(listId: string, name: string): Promise<void>;
};

export type StoredPayload = {
  version: 1;
  bundles: ComparisonListBundle[];
};

export function emptyList(name: string): ComparisonListBundle {
  const now = new Date().toISOString();
  const list: List = {
    id: createId('list'),
    name,
    createdAt: now,
    updatedAt: now,
  };
  return { list, globals: [], columns: [], items: [] };
}

export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}
