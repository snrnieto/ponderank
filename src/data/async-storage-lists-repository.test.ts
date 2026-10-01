import { beforeEach, describe, expect, it } from 'vitest';

import { createAsyncStorageListsRepository, LEGACY_STORAGE_KEY, STORAGE_KEY } from './async-storage-lists-repository';

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    async getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    async setItem(key: string, value: string) {
      map.set(key, value);
    },
    map,
  };
}

describe('AsyncStorageListsRepository', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_DEMO_SEED = 'true';
  });

  it('seeds vehicles when storage empty and seed enabled', async () => {
    const storage = memoryStorage();
    const repo = createAsyncStorageListsRepository(storage);
    const bundles = await repo.loadAll();
    expect(bundles).toHaveLength(1);
    expect(bundles[0].list.name).toBe('Vehículos usados');
    expect(bundles[0].items.length).toBe(10);
  });

  it('does not seed by default', async () => {
    delete process.env.EXPO_PUBLIC_ENABLE_DEMO_SEED;
    const repo = createAsyncStorageListsRepository(memoryStorage());
    expect(await repo.loadAll()).toHaveLength(0);
  });

  it('does not seed when flag is false', async () => {
    process.env.EXPO_PUBLIC_ENABLE_DEMO_SEED = 'false';
    const storage = memoryStorage();
    const repo = createAsyncStorageListsRepository(storage);
    const bundles = await repo.loadAll();
    expect(bundles).toHaveLength(0);
  });

  it('persists createList across reload', async () => {
    process.env.EXPO_PUBLIC_ENABLE_DEMO_SEED = 'false';
    const storage = memoryStorage();
    const repo = createAsyncStorageListsRepository(storage);
    await repo.createList('Computadores');
    const again = createAsyncStorageListsRepository(storage);
    const bundles = await again.loadAll();
    expect(bundles.map((b) => b.list.name)).toContain('Computadores');
    expect(storage.map.has(STORAGE_KEY)).toBe(true);
  });

  it('migrates lists saved under the legacy key', async () => {
    process.env.EXPO_PUBLIC_ENABLE_DEMO_SEED = 'false';
    const storage = memoryStorage();
    const repo = createAsyncStorageListsRepository(storage);
    await repo.createList('Viejas');
    storage.map.set(LEGACY_STORAGE_KEY, storage.map.get(STORAGE_KEY)!);
    storage.map.delete(STORAGE_KEY);

    const bundles = await createAsyncStorageListsRepository(storage).loadAll();
    expect(bundles.map((b) => b.list.name)).toEqual(['Viejas']);
    expect(storage.map.get(STORAGE_KEY)).toBe(storage.map.get(LEGACY_STORAGE_KEY));
  });

  it('does not duplicate seed on second load', async () => {
    const storage = memoryStorage();
    const repo = createAsyncStorageListsRepository(storage);
    await repo.loadAll();
    await repo.loadAll();
    const bundles = await repo.loadAll();
    expect(bundles).toHaveLength(1);
  });

  it('deletes and replaces items in bulk', async () => {
    process.env.EXPO_PUBLIC_ENABLE_DEMO_SEED = 'false';
    const repo = createAsyncStorageListsRepository(memoryStorage());
    const { list } = await repo.createList('IA');
    const item = (id: string) => ({ id, listId: list.id, createdAt: '', values: { n: id } });
    await repo.addItems(list.id, [item('a'), item('b'), item('c')]);

    await repo.deleteItems(list.id, ['a', 'c']);
    expect((await repo.getBundle(list.id))!.items.map((i) => i.id)).toEqual(['b']);

    await repo.replaceItems(list.id, [item('x'), item('y')]);
    expect((await repo.getBundle(list.id))!.items.map((i) => i.id)).toEqual(['x', 'y']);
  });
});
