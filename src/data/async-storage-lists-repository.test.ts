import { beforeEach, describe, expect, it } from 'vitest';

import { createAsyncStorageListsRepository, STORAGE_KEY } from './async-storage-lists-repository';

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

  it('does not duplicate seed on second load', async () => {
    const storage = memoryStorage();
    const repo = createAsyncStorageListsRepository(storage);
    await repo.loadAll();
    await repo.loadAll();
    const bundles = await repo.loadAll();
    expect(bundles).toHaveLength(1);
  });
});
