import { useMemo, useState } from 'react';

import { computeRanking, type ComparisonListBundle, type RankedItem } from '@/domain';

export type SortKey = 'ranking' | `column:${string}` | `partial:${string}` | 'name';
export type SortDir = 'asc' | 'desc';

export type FilterState = {
  categoryColumnId: string | null;
  categoryValue: string | null;
};

export type RecalcMode = 'all' | 'visible';

function itemDisplayName(bundle: ComparisonListBundle, itemId: string): string {
  const nameCol = bundle.columns.find((c) => c.kind === 'text');
  const item = bundle.items.find((i) => i.id === itemId);
  if (!nameCol || !item) return itemId;
  const value = item.values[nameCol.id];
  return typeof value === 'string' ? value : itemId;
}

export function useListView(bundle: ComparisonListBundle | undefined) {
  const [sortKey, setSortKey] = useState<SortKey>('ranking');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showPartials, setShowPartials] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    categoryColumnId: null,
    categoryValue: null,
  });
  const [recalcMode, setRecalcMode] = useState<RecalcMode>('all');
  const [pendingFilter, setPendingFilter] = useState<FilterState | null>(null);

  const visibleItems = useMemo(() => {
    if (!bundle) return [];
    if (!filter.categoryColumnId || !filter.categoryValue) return bundle.items;
    return bundle.items.filter(
      (item) => item.values[filter.categoryColumnId!] === filter.categoryValue,
    );
  }, [bundle, filter]);

  const ranked: RankedItem[] = useMemo(() => {
    if (!bundle) return [];
    const universe = recalcMode === 'visible' ? visibleItems : bundle.items;
    return computeRanking(visibleItems, bundle.columns, bundle.globals, {
      universeItems: universe,
    });
  }, [bundle, visibleItems, recalcMode]);

  const rows = useMemo(() => {
    if (!bundle) return [];
    const enriched = ranked.map((r) => ({
      ...r,
      name: itemDisplayName(bundle, r.itemId),
    }));

    const sorted = [...enriched].sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      if (sortKey === 'ranking') {
        av = a.total;
        bv = b.total;
      } else if (sortKey === 'name') {
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
      } else if (sortKey.startsWith('partial:')) {
        const id = sortKey.slice('partial:'.length);
        av = a.partials[id] ?? 0;
        bv = b.partials[id] ?? 0;
      } else if (sortKey.startsWith('column:')) {
        const id = sortKey.slice('column:'.length);
        const rawA = a.resolvedValues[id];
        const rawB = b.resolvedValues[id];
        av = typeof rawA === 'number' ? rawA : typeof rawA === 'string' ? rawA.toLowerCase() : '';
        bv = typeof rawB === 'number' ? rawB : typeof rawB === 'string' ? rawB.toLowerCase() : '';
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [bundle, ranked, sortKey, sortDir]);

  function requestFilterChange(next: FilterState) {
    setPendingFilter(next);
  }

  function applyPendingFilter(mode: RecalcMode) {
    if (!pendingFilter) return;
    setRecalcMode(mode);
    setFilter(pendingFilter);
    setPendingFilter(null);
  }

  function clearFilter() {
    setFilter({ categoryColumnId: null, categoryValue: null });
    setRecalcMode('all');
  }

  function cancelPendingFilter() {
    setPendingFilter(null);
  }

  return {
    sortKey,
    setSortKey,
    sortDir,
    setSortDir,
    showPartials,
    setShowPartials,
    filter,
    pendingFilter,
    requestFilterChange,
    applyPendingFilter,
    cancelPendingFilter,
    clearFilter,
    recalcMode,
    rows,
    visibleCount: visibleItems.length,
  };
}
