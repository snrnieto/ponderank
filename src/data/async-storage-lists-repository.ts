import type { ComparisonListBundle, Item, ListColumn, ListGlobal } from '@/domain';
import { buildDemoVehiclesBundle, isDemoSeedEnabled } from './demo-vehicles-seed';
import {
  createId,
  emptyList,
  type ListsRepository,
  type StoredPayload,
} from './lists-repository';

export const STORAGE_KEY = 'item-ranking:v1';

export type MemoryStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export function createAsyncStorageListsRepository(storage: MemoryStore): ListsRepository {
  async function read(): Promise<StoredPayload> {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) {
      if (isDemoSeedEnabled()) {
        const seeded: StoredPayload = { version: 1, bundles: [buildDemoVehiclesBundle()] };
        await storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return { version: 1, bundles: [] };
    }
    return JSON.parse(raw) as StoredPayload;
  }

  async function write(payload: StoredPayload): Promise<void> {
    await storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  async function touch(listId: string, mutate: (bundle: ComparisonListBundle) => void) {
    const payload = await read();
    const bundle = payload.bundles.find((b) => b.list.id === listId);
    if (!bundle) throw new Error(`List not found: ${listId}`);
    mutate(bundle);
    bundle.list.updatedAt = new Date().toISOString();
    await write(payload);
  }

  return {
    async loadAll() {
      return (await read()).bundles;
    },

    async saveAll(bundles) {
      await write({ version: 1, bundles });
    },

    async getBundle(listId) {
      const payload = await read();
      return payload.bundles.find((b) => b.list.id === listId) ?? null;
    },

    async upsertBundle(bundle) {
      const payload = await read();
      const index = payload.bundles.findIndex((b) => b.list.id === bundle.list.id);
      if (index >= 0) payload.bundles[index] = bundle;
      else payload.bundles.push(bundle);
      await write(payload);
    },

    async deleteList(listId) {
      const payload = await read();
      payload.bundles = payload.bundles.filter((b) => b.list.id !== listId);
      await write(payload);
    },

    async createList(name) {
      const payload = await read();
      const bundle = emptyList(name);
      payload.bundles.push(bundle);
      await write(payload);
      return bundle;
    },

    async upsertItem(listId, item: Item) {
      await touch(listId, (bundle) => {
        const index = bundle.items.findIndex((i) => i.id === item.id);
        if (index >= 0) bundle.items[index] = item;
        else bundle.items.push({ ...item, listId, id: item.id || createId('item') });
      });
    },

    async addItems(listId, items) {
      await touch(listId, (bundle) => {
        for (const item of items) {
          bundle.items.push({ ...item, listId, id: item.id || createId('item') });
        }
      });
    },

    async deleteItem(listId, itemId) {
      await touch(listId, (bundle) => {
        bundle.items = bundle.items.filter((i) => i.id !== itemId);
      });
    },

    async replaceSchema(listId, schema: { globals: ListGlobal[]; columns: ListColumn[] }) {
      await touch(listId, (bundle) => {
        const removedIds = new Set(
          bundle.columns
            .filter((c) => !schema.columns.some((n) => n.id === c.id))
            .map((c) => c.id),
        );
        bundle.globals = schema.globals;
        bundle.columns = schema.columns;
        if (removedIds.size > 0) {
          for (const item of bundle.items) {
            for (const id of removedIds) {
              delete item.values[id];
            }
          }
        }
      });
    },

    async renameList(listId, name) {
      await touch(listId, (bundle) => {
        bundle.list.name = name;
      });
    },
  };
}
