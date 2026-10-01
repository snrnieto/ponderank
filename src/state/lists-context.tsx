import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createRepository } from '@/data/create-repository';
import { createId } from '@/data/lists-repository';
import type { ComparisonListBundle, FieldValue, Item, ListColumn, ListGlobal } from '@/domain';
import type { ListsRepository } from '@/data/lists-repository';

type ListsContextValue = {
  loading: boolean;
  bundles: ComparisonListBundle[];
  refresh: () => Promise<void>;
  createList: (name: string) => Promise<ComparisonListBundle>;
  renameList: (listId: string, name: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  getBundle: (listId: string) => ComparisonListBundle | undefined;
  saveItem: (listId: string, item: Item) => Promise<void>;
  removeItem: (listId: string, itemId: string) => Promise<void>;
  importItems: (listId: string, rows: Record<string, FieldValue>[]) => Promise<void>;
  saveSchema: (
    listId: string,
    schema: { globals: ListGlobal[]; columns: ListColumn[] },
  ) => Promise<void>;
  newItemDraft: (listId: string) => Item;
};

const ListsContext = createContext<ListsContextValue | null>(null);

export function ListsProvider({
  children,
  repository = createRepository(),
}: {
  children: React.ReactNode;
  repository?: ListsRepository;
}) {
  const [loading, setLoading] = useState(true);
  const [bundles, setBundles] = useState<ComparisonListBundle[]>([]);

  const refresh = useCallback(async () => {
    const next = await repository.loadAll();
    setBundles(next);
  }, [repository]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const next = await repository.loadAll();
      if (active) {
        setBundles(next);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [repository]);

  const value = useMemo<ListsContextValue>(
    () => ({
      loading,
      bundles,
      refresh,
      createList: async (name) => {
        const bundle = await repository.createList(name);
        await refresh();
        return bundle;
      },
      renameList: async (listId, name) => {
        await repository.renameList(listId, name);
        await refresh();
      },
      deleteList: async (listId) => {
        await repository.deleteList(listId);
        await refresh();
      },
      getBundle: (listId) => bundles.find((b) => b.list.id === listId),
      saveItem: async (listId, item) => {
        await repository.upsertItem(listId, item);
        await refresh();
      },
      removeItem: async (listId, itemId) => {
        await repository.deleteItem(listId, itemId);
        await refresh();
      },
      importItems: async (listId, rows) => {
        const createdAt = new Date().toISOString();
        await repository.addItems(
          listId,
          rows.map((values) => ({ id: createId('item'), listId, values, createdAt })),
        );
        await refresh();
      },
      saveSchema: async (listId, schema) => {
        await repository.replaceSchema(listId, schema);
        await refresh();
      },
      newItemDraft: (listId) => ({
        id: createId('item'),
        listId,
        values: {},
        createdAt: new Date().toISOString(),
      }),
    }),
    [bundles, loading, refresh, repository],
  );

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists() {
  const ctx = useContext(ListsContext);
  if (!ctx) throw new Error('useLists must be used within ListsProvider');
  return ctx;
}
