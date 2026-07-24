import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAsyncStorageListsRepository } from './async-storage-lists-repository';
import type { ListsRepository } from './lists-repository';

/** Swap this factory later for a Supabase-backed repository. */
export function createRepository(): ListsRepository {
  return createAsyncStorageListsRepository(AsyncStorage);
}
