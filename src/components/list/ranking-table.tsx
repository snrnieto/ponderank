import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Checkbox } from '@/components/ui/checkbox';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { formatNumber, type ComparisonListBundle, type FieldValue, type ListColumn, type Locale } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

type Row = {
  itemId: string;
  name: string;
  total: number;
  partials: Record<string, number>;
  resolvedValues: Record<string, FieldValue>;
};

type Props = {
  bundle: ComparisonListBundle;
  rows: Row[];
  /** Muestra la nota (0–100) de cada criterio bajo su valor. */
  showPartials: boolean;
  onEditItem: (itemId: string) => void;
  /** Abre la explicación de una posición del top 3 (1-based). */
  onExplain: (position: number) => void;
  /** Modo selección: cada fila muestra un checkbox y tocarla la (de)selecciona. */
  selection?: {
    selectedIds: Set<string>;
    onToggle: (itemId: string) => void;
    onToggleAll: (select: boolean) => void;
  };
};

const MOBILE_BREAKPOINT = 720;

/** Nota de 0 a 100 con un decimal fijo. */
export function formatScore(total: number, locale: Locale = 'es'): string {
  return formatNumber(total, locale, 1, 1);
}

/** Valor de una celda: números grandes sin decimales, el resto con hasta uno. */
export function formatValue(value: FieldValue | undefined, locale: Locale = 'es'): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'number') return formatNumber(value, locale, Math.abs(value) >= 1000 ? 0 : 1);
  return value;
}

/** Criterios primero (por importancia), después las columnas informativas. */
function orderColumns(columns: ListColumn[]) {
  const criteria = columns.filter((c) => c.rank).sort((a, b) => b.rank!.weight - a.rank!.weight);
  const info = columns.filter((c) => !c.rank && c.kind !== 'text' && c.kind !== 'image');
  return { criteria, info };
}

function ExplainButton({ name, position, onPress }: { name: string; position: number; onPress: () => void }) {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.table.whyLabel(name, position)}
      onPress={onPress}
      style={({ pressed, hovered }) => ({
        width: theme.components.touchTarget,
        height: theme.components.touchTarget,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed || hovered ? theme.colors.primaryMuted : 'transparent',
      })}
    >
      <SymbolView name={{ ios: 'info.circle', android: 'info', web: 'info' }} size={20} tintColor={theme.colors.primary} />
    </Pressable>
  );
}

function RankBadge({ position }: { position: number }) {
  const theme = useTheme();
  const top = position <= 3;
  return (
    <View
      style={[
        styles.rankBadge,
        {
          backgroundColor: position === 1 ? theme.colors.primary : top ? theme.colors.primaryMuted : 'transparent',
          borderWidth: top ? 0 : 1,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        variant="figure"
        color={position === 1 ? theme.colors.onPrimary : top ? theme.colors.primary : theme.colors.textSecondary}
      >
        {position}
      </Text>
    </View>
  );
}

export function RankingTable({ bundle, rows, showPartials, onEditItem, onExplain, selection }: Props) {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const { width } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const mobile = width < MOBILE_BREAKPOINT;

  const imageCol = bundle.columns.find((c) => c.kind === 'image');
  const { criteria, info } = orderColumns(bundle.columns);

  // Posición real por puntaje total, independiente del orden en que se esté viendo la tabla.
  const positionById = new Map([...rows].sort((a, b) => b.total - a.total).map((r, i) => [r.itemId, i + 1]));

  const selectedCount = selection ? rows.filter((r) => selection.selectedIds.has(r.itemId)).length : 0;
  const allSelected = rows.length > 0 && selectedCount === rows.length;
  const rowPress = (itemId: string) => (selection ? selection.onToggle(itemId) : onEditItem(itemId));
  const imageOf = (row: Row) =>
    imageCol && typeof row.resolvedValues[imageCol.id] === 'string' ? (row.resolvedValues[imageCol.id] as string) : null;

  if (mobile) {
    return (
      <View style={{ gap: theme.spacing[2] }}>
        {selection ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
            <Checkbox
              checked={allSelected}
              indeterminate={selectedCount > 0 && !allSelected}
              onChange={() => selection.onToggleAll(!allSelected)}
              accessibilityLabel={t.table.selectAll}
            />
            <Text variant="label">{t.table.selectAll}</Text>
          </View>
        ) : null}
        {rows.map((row) => {
          const position = positionById.get(row.itemId)!;
          const selected = selection?.selectedIds.has(row.itemId);
          const img = imageOf(row);
          return (
            <Pressable
              key={row.itemId}
              onPress={() => rowPress(row.itemId)}
              accessibilityLabel={selection ? t.table.select(row.name) : t.table.edit(row.name)}
            >
              <Surface
                padded
                elevation="none"
                style={{
                  gap: theme.spacing[3],
                  borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
                  {selection ? (
                    <Checkbox
                      checked={!!selected}
                      onChange={() => selection.onToggle(row.itemId)}
                      accessibilityLabel={t.table.select(row.name)}
                    />
                  ) : null}
                  <RankBadge position={position} />
                  {img ? (
                    <Image source={{ uri: img }} style={[styles.thumb, { borderRadius: theme.radius.sm }]} contentFit="cover" />
                  ) : null}
                  <Text variant="label" numberOfLines={2} style={{ flex: 1, fontSize: theme.typography.sizes.md }}>
                    {row.name}
                  </Text>
                  <Text variant="figure" style={{ fontSize: theme.typography.sizes.lg }}>
                    {formatScore(row.total, locale)}
                  </Text>
                </View>
                {criteria.length > 0 ? (
                  <View style={{ gap: 4 }}>
                    {criteria.map((c) => (
                      <View key={c.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing[2] }}>
                        <Text variant="caption" colorKey="textSecondary" style={{ flexShrink: 1 }}>
                          {c.name} · {t.table.importance(Math.round(c.rank!.weight))}
                        </Text>
                        <Text variant="caption" style={{ fontVariant: ['tabular-nums'] }}>
                          {formatValue(row.resolvedValues[c.id], locale)}
                          {showPartials ? ` · ${t.table.scoreShort(Math.round(row.partials[c.id] ?? 0))}` : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Surface>
            </Pressable>
          );
        })}
      </View>
    );
  }

  const colWidth = 140;
  const minWidth = (selection ? 40 : 0) + 64 + (imageCol ? 60 : 0) + 220 + 96 + 44 + (criteria.length + info.length) * colWidth;
  const tableWidth = Math.max(minWidth, containerWidth);
  const numberCell = { width: colWidth, textAlign: 'right' as const, paddingRight: theme.spacing[3] };

  return (
    <View style={{ width: '100%' }} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <ScrollView horizontal showsHorizontalScrollIndicator style={{ width: '100%' }}>
        <View style={{ width: tableWidth }}>
          <View
            style={[
              styles.row,
              {
                gap: theme.spacing[3],
                paddingHorizontal: theme.spacing[4],
                paddingBottom: theme.spacing[2],
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            {selection ? (
              <View style={styles.checkCol}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onChange={() => selection.onToggleAll(!allSelected)}
                  accessibilityLabel={t.table.selectAll}
                />
              </View>
            ) : null}
            <Text variant="overline" style={styles.rankCol}>
              {t.table.position}
            </Text>
            {imageCol ? <View style={styles.imgCol} /> : null}
            <Text variant="overline" style={styles.nameCol}>
              {t.table.option}
            </Text>
            <Text variant="overline" style={[styles.scoreCol, { textAlign: 'right' }]}>
              {t.table.finalScore}
            </Text>
            <View style={styles.explainCol} />
            {criteria.map((c) => (
              <View key={c.id} style={{ width: colWidth, alignItems: 'flex-end', paddingRight: theme.spacing[3] }}>
                <Text variant="overline" colorKey="text" numberOfLines={2} style={{ textAlign: 'right' }}>
                  {c.name}
                </Text>
                <Text variant="caption" colorKey="accentInk">
                  {t.table.importance(Math.round(c.rank!.weight))}
                </Text>
              </View>
            ))}
            {info.map((c) => (
              <Text key={c.id} variant="overline" numberOfLines={2} style={numberCell}>
                {c.name}
              </Text>
            ))}
          </View>

          {rows.map((row) => {
            const position = positionById.get(row.itemId)!;
            const selected = selection?.selectedIds.has(row.itemId);
            const img = imageOf(row);
            return (
              <Pressable
                key={row.itemId}
                accessibilityLabel={selection ? t.table.select(row.name) : t.table.edit(row.name)}
                onPress={() => rowPress(row.itemId)}
                style={({ hovered }) => [
                  styles.row,
                  {
                    gap: theme.spacing[3],
                    paddingHorizontal: theme.spacing[4],
                    paddingVertical: theme.spacing[3],
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.colors.border,
                    backgroundColor: selected ? theme.colors.primaryMuted : hovered ? theme.colors.surfaceMuted : 'transparent',
                  },
                ]}
              >
                {selection ? (
                  <View style={styles.checkCol}>
                    <Checkbox checked={!!selected} onChange={() => selection.onToggle(row.itemId)} accessibilityLabel={t.table.select(row.name)} />
                  </View>
                ) : null}
                <View style={styles.rankCol}>
                  <RankBadge position={position} />
                </View>
                {imageCol ? (
                  <View style={styles.imgCol}>
                    {img ? <Image source={{ uri: img }} style={[styles.thumb, { borderRadius: theme.radius.sm }]} contentFit="cover" /> : null}
                  </View>
                ) : null}
                <Text variant="label" numberOfLines={2} style={[styles.nameCol, { fontSize: theme.typography.sizes.md }]}>
                  {row.name}
                </Text>
                <Text variant="figure" style={[styles.scoreCol, { textAlign: 'right', fontSize: theme.typography.sizes.lg }]}>
                  {formatScore(row.total, locale)}
                </Text>
                <View style={styles.explainCol}>
                  {!selection && position <= 3 && criteria.length > 0 ? (
                    <ExplainButton name={row.name} position={position} onPress={() => onExplain(position)} />
                  ) : null}
                </View>
                {criteria.map((c) => (
                  <View key={c.id} style={{ width: colWidth, alignItems: 'flex-end', paddingRight: theme.spacing[3] }}>
                    <Text variant="figure" style={{ fontWeight: theme.typography.weights.medium }} numberOfLines={1}>
                      {formatValue(row.resolvedValues[c.id], locale)}
                    </Text>
                    {showPartials ? (
                      <Text variant="caption" colorKey="textSecondary">
                        {t.table.scoreShort(Math.round(row.partials[c.id] ?? 0))}
                      </Text>
                    ) : null}
                  </View>
                ))}
                {info.map((c) => {
                  const value = row.resolvedValues[c.id];
                  return (
                    <Text
                      key={c.id}
                      variant={typeof value === 'number' ? 'figure' : 'body'}
                      colorKey="textSecondary"
                      numberOfLines={1}
                      style={[numberCell, { fontWeight: theme.typography.weights.regular }]}
                    >
                      {formatValue(value, locale)}
                    </Text>
                  );
                })}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  checkCol: { width: 28, flexShrink: 0 },
  rankCol: { width: 64, flexShrink: 0 },
  imgCol: { width: 60, flexShrink: 0 },
  nameCol: { flex: 1, minWidth: 220 },
  scoreCol: { width: 96, flexShrink: 0 },
  explainCol: { width: 44, flexShrink: 0 },
  thumb: { width: 48, height: 48 },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
