import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

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

export function RankingTable({ bundle, rows, showPartials, onEditItem }: Props) {
  const theme = useTheme();
  const imageCol = bundle.columns.find((c) => c.kind === 'image');
  const criteria = bundle.columns.filter((c) => c.rank);
  const visibleCols = bundle.columns.filter(
    (c) => c.kind !== 'image' && (showPartials || !c.rank || c.kind === 'criterion'),
  );

  return (
    <ScrollView horizontal>
      <View style={{ gap: theme.spacing[2], minWidth: 720 }}>
        <View style={[styles.headerRow, { gap: theme.spacing[2] }]}>
          <Text variant="label" style={styles.rankCol}>
            #
          </Text>
          {imageCol ? <Text variant="label" style={styles.imgCol}>Img</Text> : null}
          <Text variant="label" style={styles.nameCol}>
            Nombre
          </Text>
          <Text variant="label" style={styles.numCol}>
            Ranking
          </Text>
          {showPartials
            ? criteria.map((c) => (
                <Text key={c.id} variant="label" style={styles.numCol}>
                  % {c.name}
                </Text>
              ))
            : null}
          {visibleCols
            .filter((c) => c.kind !== 'text')
            .slice(0, 6)
            .map((c) => (
              <Text key={c.id} variant="label" style={styles.numCol}>
                {c.name}
              </Text>
            ))}
        </View>

        {rows.map((row, index) => {
          const img =
            imageCol && typeof row.resolvedValues[imageCol.id] === 'string'
              ? (row.resolvedValues[imageCol.id] as string)
              : null;
          return (
            <Pressable key={row.itemId} onPress={() => onEditItem(row.itemId)}>
              <Surface
                padded
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                }}
              >
                <Text style={styles.rankCol}>{index + 1}</Text>
                {imageCol ? (
                  <View style={styles.imgCol}>
                    {img ? (
                      <Image source={{ uri: img }} style={styles.thumb} contentFit="cover" />
                    ) : (
                      <Text variant="caption">—</Text>
                    )}
                  </View>
                ) : null}
                <Text style={styles.nameCol} numberOfLines={2}>
                  {row.name}
                </Text>
                <Text style={styles.numCol}>{row.total.toFixed(1)}%</Text>
                {showPartials
                  ? criteria.map((c) => (
                      <Text key={c.id} style={styles.numCol}>
                        {(row.partials[c.id] ?? 0).toFixed(1)}%
                      </Text>
                    ))
                  : null}
                {visibleCols
                  .filter((c) => c.kind !== 'text')
                  .slice(0, 6)
                  .map((c) => (
                    <Text key={c.id} style={styles.numCol} numberOfLines={1}>
                      {formatValue(row.resolvedValues[c.id])}
                    </Text>
                  ))}
              </Surface>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  rankCol: { width: 36 },
  imgCol: { width: 48 },
  nameCol: { width: 180 },
  numCol: { width: 110 },
  thumb: { width: 40, height: 40, borderRadius: 8 },
});
