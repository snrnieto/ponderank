import { useLocalSearchParams, useNavigation, useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { RankingExplainModal } from '@/components/list/ranking-explain-modal';
import { RankingTable } from '@/components/list/ranking-table';
import { SetupChecklist } from '@/components/list/setup-checklist';
import { VerdictBlock } from '@/components/list/verdict-block';
import { ViewControlsModal } from '@/components/list/view-controls-modal';
import { ActionMenu } from '@/components/ui/action-menu';
import { Button } from '@/components/ui/button';
import { confirmAction } from '@/components/ui/confirm-action';
import { PageShell } from '@/components/ui/page-shell';
import { PageTitle } from '@/components/ui/page-title';
import { Text } from '@/components/ui/text';
import { explainTopRanking } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { clearFlash, useFlash } from '@/state/flash';
import { useLists } from '@/state/lists-context';
import { useListView } from '@/state/use-list-view';

const COMPACT_BREAKPOINT = 720;

export default function ListDetailScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { getBundle, removeItems } = useLists();
  const bundle = getBundle(listId);
  const view = useListView(bundle);
  const theme = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const compact = width < COMPACT_BREAKPOINT;
  const [controlsVisible, setControlsVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [explainPosition, setExplainPosition] = useState<number | null>(null);
  const flash = useFlash(listId);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => clearFlash(flash.id), 4500);
    return () => clearTimeout(timer);
  }, [flash]);

  useEffect(() => {
    if (bundle) navigation.setOptions({ title: bundle.list.name });
  }, [bundle, navigation]);

  const categoryColumn = useMemo(() => bundle?.columns.find((c) => c.kind === 'category'), [bundle]);

  const go = (path: string) => router.push(`/list/${listId}${path}` as Href);

  function exitSelection() {
    setSelecting(false);
    setSelectedIds(new Set());
  }

  function toggleSelected(itemId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function onDeleteSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const total = bundle?.items.length ?? 0;
    confirmAction(
      t.ranking.deleteTitle(ids.length),
      ids.length === total ? t.ranking.deleteAllBody : t.common.irreversible,
      () => {
        void removeItems(listId, ids).then(exitSelection);
      },
      { confirm: t.common.delete, cancel: t.common.cancel },
    );
  }

  if (!bundle) {
    return (
      <PageShell maxWidth={560} style={{ justifyContent: 'center' }}>
        <Text variant="title">{t.common.listNotFound}</Text>
        <Text colorKey="textSecondary">{t.common.listNotFoundBody}</Text>
        <Button title={t.common.goToLists} variant="accent" onPress={() => router.replace('/list' as Href)} />
      </PageShell>
    );
  }

  const criteria = bundle.columns.filter((c) => c.rank);
  const hasColumns = bundle.columns.some((c) => c.kind !== 'text');
  const hasItems = bundle.items.length > 0;
  const ready = criteria.length > 0 && hasItems;
  const explanations = criteria.length > 0 ? explainTopRanking(view.rows, bundle.columns) : [];
  const winner = explanations[0];
  const imageCol = bundle.columns.find((c) => c.kind === 'image');
  const winnerImage = (() => {
    if (!winner || !imageCol) return null;
    const value = view.rows.find((r) => r.itemId === winner.itemId)?.resolvedValues[imageCol.id];
    return typeof value === 'string' && value ? value : null;
  })();
  const filterActive = !!view.filter.categoryValue;
  const flashPosition = (() => {
    if (!flash?.itemId || criteria.length === 0) return null;
    const sorted = [...view.rows].sort((a, b) => b.total - a.total);
    const index = sorted.findIndex((r) => r.itemId === flash.itemId);
    return index >= 0 ? index + 1 : null;
  })();

  const secondaryActions = [
    { label: t.ranking.pasteMany, onPress: () => go('/items/import') },
    { label: t.ranking.whatYouCompare, onPress: () => go('/schema') },
    ...(hasItems
      ? [
          { label: t.ranking.sortAndDetails, onPress: () => setControlsVisible(true) },
          { label: t.ranking.select, onPress: () => setSelecting(true) },
        ]
      : []),
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ flexGrow: 1, width: '100%', paddingBottom: 96 }}>
        {/* La tabla necesita ancho: en pantallas grandes se usa casi todo para evitar el scroll horizontal. */}
        <PageShell maxWidth={1680}>
          <PageTitle parts={[bundle.list.name]} />

          {!ready ? (
            <SetupChecklist
              steps={[
                {
                  title: t.checklist.step1,
                  description: t.checklist.step1Body,
                  done: hasColumns,
                  action: { title: t.checklist.step1Action, onPress: () => go('/schema') },
                },
                {
                  title: t.checklist.step2,
                  description: t.checklist.step2Body,
                  done: criteria.length > 0,
                  action: { title: t.checklist.step2Action, onPress: () => go('/schema') },
                },
                {
                  title: t.checklist.step3,
                  description: t.checklist.step3Body,
                  done: hasItems,
                  action: { title: t.checklist.step3Action, onPress: () => go('/items/new') },
                  secondary: { title: t.checklist.step3Secondary, onPress: () => go('/items/import') },
                },
              ]}
            />
          ) : winner ? (
            <VerdictBlock winner={winner} image={winnerImage} optionCount={view.visibleCount} onExplain={() => setExplainPosition(1)} />
          ) : null}

          {selecting ? (
            <View style={styles.toolbar}>
              <Text variant="label" style={{ marginRight: theme.spacing[2] }}>
                {t.ranking.selected(selectedIds.size)}
              </Text>
              <Button
                title={
                  view.rows.every((r) => selectedIds.has(r.itemId)) && view.rows.length > 0
                    ? t.ranking.clearSelection
                    : t.ranking.selectAll(view.rows.length)
                }
                variant="secondary"
                size="sm"
                onPress={() =>
                  setSelectedIds(view.rows.every((r) => selectedIds.has(r.itemId)) ? new Set() : new Set(view.rows.map((r) => r.itemId)))
                }
              />
              <Button title={t.ranking.deleteCount(selectedIds.size)} variant="danger" size="sm" disabled={selectedIds.size === 0} onPress={onDeleteSelected} />
              <Button title={t.common.cancel} variant="ghost" size="sm" onPress={exitSelection} />
            </View>
          ) : hasColumns ? (
            compact ? (
              <View style={styles.toolbar}>
                <Button title={t.ranking.addOption} variant={ready ? 'accent' : 'primary'} size="sm" style={{ flexGrow: 1 }} onPress={() => go('/items/new')} />
                <Button title={t.common.more} variant="secondary" size="sm" onPress={() => setMenuVisible(true)} />
              </View>
            ) : (
              <View style={[styles.toolbar, { justifyContent: 'space-between' }]}>
                <View style={styles.toolbarGroup}>
                  <Button title={t.ranking.addOption} variant={ready ? 'accent' : 'primary'} size="sm" onPress={() => go('/items/new')} />
                  <Button title={t.ranking.pasteMany} variant="secondary" size="sm" onPress={() => go('/items/import')} />
                  <Button title={t.ranking.whatYouCompare} variant="secondary" size="sm" onPress={() => go('/schema')} />
                </View>
                {hasItems ? (
                  <View style={styles.toolbarGroup}>
                    <Button title={t.ranking.sortAndDetails} variant="ghost" size="sm" onPress={() => setControlsVisible(true)} />
                    <Button title={t.ranking.select} variant="ghost" size="sm" onPress={() => setSelecting(true)} />
                  </View>
                ) : null}
              </View>
            )
          ) : null}

          {categoryColumn && hasItems ? (
            <View style={{ gap: theme.spacing[2] }}>
              <View style={styles.toolbarGroup}>
                <Text variant="label" colorKey="textSecondary" style={{ marginRight: theme.spacing[1] }}>
                  {categoryColumn.name}:
                </Text>
                <Button title={t.ranking.filterAll} size="sm" pill variant={filterActive ? 'secondary' : 'primary'} onPress={view.clearFilter} />
                {(categoryColumn.options ?? []).map((option) => (
                  <Button
                    key={option}
                    title={option}
                    size="sm"
                    pill
                    accessibilityState={{ selected: view.filter.categoryValue === option }}
                    variant={view.filter.categoryValue === option ? 'primary' : 'secondary'}
                    onPress={() => view.applyFilter({ categoryColumnId: categoryColumn.id, categoryValue: option })}
                  />
                ))}
              </View>
              {filterActive ? (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: theme.spacing[2],
                    padding: theme.spacing[3],
                    borderRadius: theme.radius.sm,
                    backgroundColor: theme.colors.infoSoft,
                  }}
                >
                  <Text style={{ flexShrink: 1 }} colorKey="info">
                    {view.recalcMode === 'visible'
                      ? t.ranking.comparingOnly(view.visibleCount, view.filter.categoryValue!)
                      : t.ranking.showingAgainstAll(view.filter.categoryValue!)}
                  </Text>
                  <Button
                    title={view.recalcMode === 'visible' ? t.ranking.compareAgainstAll : t.ranking.compareOnlyThese}
                    size="sm"
                    variant="ghost"
                    onPress={() => view.setRecalcMode(view.recalcMode === 'visible' ? 'all' : 'visible')}
                  />
                </View>
              ) : null}
            </View>
          ) : null}

          {hasItems ? (
            <RankingTable
              bundle={bundle}
              rows={view.rows}
              showPartials={view.showPartials}
              onEditItem={(id) => go(`/items/${id}`)}
              onExplain={setExplainPosition}
              selection={
                selecting
                  ? {
                      selectedIds,
                      onToggle: toggleSelected,
                      onToggleAll: (select) => setSelectedIds(select ? new Set(view.rows.map((r) => r.itemId)) : new Set()),
                    }
                  : undefined
              }
            />
          ) : null}
        </PageShell>
      </ScrollView>

      <ViewControlsModal
        visible={controlsVisible}
        bundle={bundle}
        showPartials={view.showPartials}
        sortKey={view.sortKey}
        sortDir={view.sortDir}
        onShowPartials={view.setShowPartials}
        onSortKey={view.setSortKey}
        onSortDir={view.setSortDir}
        onClose={() => setControlsVisible(false)}
      />

      <ActionMenu visible={menuVisible} items={secondaryActions} onClose={() => setMenuVisible(false)} />

      {flash ? (
        <View
          accessibilityLiveRegion="polite"
          pointerEvents="none"
          style={{ position: 'absolute', left: theme.spacing[4], right: theme.spacing[4], bottom: theme.spacing[5], alignItems: 'center' }}
        >
          <View
            style={{
              backgroundColor: theme.colors.text,
              borderRadius: theme.radius.sm,
              paddingHorizontal: theme.spacing[4],
              paddingVertical: theme.spacing[3],
              maxWidth: 520,
            }}
          >
            <Text variant="label" color={theme.colors.background}>
              {flash.message}
              {flashPosition ? t.ranking.landedAt(flashPosition) : ''}
            </Text>
          </View>
        </View>
      ) : null}

      <RankingExplainModal
        explanations={explanations}
        position={explainPosition}
        onChangePosition={setExplainPosition}
        onClose={() => setExplainPosition(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  toolbarGroup: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, flexShrink: 1 },
});
