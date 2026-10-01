import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import type { ComparisonListBundle } from '@/domain';
import { useTheme } from '@/hooks/use-theme';

type Row = {
  itemId: string;
  name: string;
  total: number;
  partials: Record<string, number>;
  resolvedValues: Record<string, string | number | null>;
};

type Props = {
  bundle: ComparisonListBundle;
  rows: Row[];
  showPartials: boolean;
  onEditItem: (itemId: string) => void;
  /** Modo selección: cada fila muestra un checkbox y tocarla la (de)selecciona. */
  selection?: {
    selectedIds: Set<string>;
    onToggle: (itemId: string) => void;
    onToggleAll: (select: boolean) => void;
  };
};

function formatValue(value: string | number | null | undefined): string {
  if (value == null) return '—';
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toLocaleString('es-CO')
      : value.toLocaleString('es-CO', { maximumFractionDigits: 2 });
  }
  return value;
}

function scoreTone(total: number): 'success' | 'warning' | 'danger' | 'primary' {
  if (total >= 80) return 'success';
  if (total >= 60) return 'primary';
  if (total >= 40) return 'warning';
  return 'danger';
}

export function RankingTable({ bundle, rows, showPartials, onEditItem, selection }: Props) {
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const imageCol = bundle.columns.find((c) => c.kind === 'image');
  const criteria = bundle.columns.filter((c) => c.rank);
  const visibleCols = bundle.columns.filter(
    (c) => c.kind !== 'image' && (showPartials || !c.rank || !c.calc),
  );
  const dataCols = visibleCols.filter((c) => c.kind !== 'text').slice(0, 6);
  const partialCols = showPartials ? criteria : [];

  const selectedCount = selection ? rows.filter((r) => selection.selectedIds.has(r.itemId)).length : 0;
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  const fixedMin =
    (selection ? 30 : 0) +
    40 +
    (imageCol ? 52 : 0) +
    160 +
    110 +
    partialCols.length * 110 +
    dataCols.length * 110 +
    theme.spacing[2] * (4 + partialCols.length + dataCols.length);

  const tableWidth = Math.max(fixedMin, containerWidth);

  return (
    <View
      style={{ gap: theme.spacing[3], width: '100%', alignSelf: 'stretch' }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Text variant="overline">Resultados</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
        <View style={{ gap: theme.spacing[3], width: tableWidth || fixedMin, paddingBottom: theme.spacing[2] }}>
          <View style={[styles.headerRow, { gap: theme.spacing[2], paddingHorizontal: theme.spacing[3] }]}>
            {selection ? (
              <View style={styles.checkCol}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onChange={() => selection.onToggleAll(!allSelected)}
                  accessibilityLabel="Seleccionar todos"
                />
              </View>
            ) : null}
            <Text variant="overline" style={styles.rankCol}>
              #
            </Text>
            {imageCol ? (
              <Text variant="overline" style={styles.imgCol}>
                Img
              </Text>
            ) : null}
            <Text variant="overline" style={styles.nameFlex}>
              Nombre
            </Text>
            <Text variant="overline" style={styles.numCol}>
              Ranking
            </Text>
            {partialCols.map((c) => (
              <Text key={c.id} variant="overline" style={styles.numCol}>
                % {c.name}
              </Text>
            ))}
            {dataCols.map((c) => (
              <Text key={c.id} variant="overline" style={styles.numCol}>
                {c.name}
              </Text>
            ))}
          </View>

          {rows.map((row, index) => {
            const img =
              imageCol && typeof row.resolvedValues[imageCol.id] === 'string'
                ? (row.resolvedValues[imageCol.id] as string)
                : null;
            const isTop = index < 3;

            return (
              <Pressable
                key={row.itemId}
                onPress={() =>
                  selection ? selection.onToggle(row.itemId) : onEditItem(row.itemId)
                }
              >
                <Surface
                  padded
                  elevation="sm"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing[2],
                    width: '100%',
                    borderWidth: selection?.selectedIds.has(row.itemId) ? 2 : 0,
                    borderColor: theme.colors.primary,
                  }}
                >
                  {selection ? (
                    <View style={styles.checkCol}>
                      <Checkbox
                        checked={selection.selectedIds.has(row.itemId)}
                        onChange={() => selection.onToggle(row.itemId)}
                        accessibilityLabel={`Seleccionar ${row.name}`}
                      />
                    </View>
                  ) : null}
                  {isTop ? (
                    <LinearGradient
                      colors={[...theme.gradients.brand]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.rankBadge}
                    >
                      <Text variant="label" color={theme.colors.textInverse}>
                        {index + 1}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.rankBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
                      <Text variant="label" colorKey="textSecondary">
                        {index + 1}
                      </Text>
                    </View>
                  )}
                  {imageCol ? (
                    <View style={styles.imgCol}>
                      {img ? (
                        <Image
                          source={{ uri: img }}
                          style={[styles.thumb, { borderRadius: theme.radius.md }]}
                          contentFit="cover"
                        />
                      ) : (
                        <Text variant="caption">—</Text>
                      )}
                    </View>
                  ) : null}
                  <Text style={styles.nameFlex} numberOfLines={2} variant="label">
                    {row.name}
                  </Text>
                  <View style={styles.numCol}>
                    <Badge label={`${row.total.toFixed(1)}%`} tone={scoreTone(row.total)} />
                  </View>
                  {partialCols.map((c) => (
                    <Text key={c.id} style={styles.numCol} variant="caption">
                      {(row.partials[c.id] ?? 0).toFixed(1)}%
                    </Text>
                  ))}
                  {dataCols.map((c) => (
                    <Text key={c.id} style={styles.numCol} numberOfLines={1} variant="caption">
                      {formatValue(row.resolvedValues[c.id])}
                    </Text>
                  ))}
                </Surface>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  checkCol: { width: 30, flexShrink: 0, alignItems: 'flex-start' },
  rankCol: { width: 40, flexShrink: 0 },
  imgCol: { width: 52, flexShrink: 0 },
  nameFlex: { flex: 1, minWidth: 160 },
  numCol: { width: 110, flexShrink: 0 },
  thumb: { width: 44, height: 44 },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
