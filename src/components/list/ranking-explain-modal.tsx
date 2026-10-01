import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { formatValue } from '@/components/list/ranking-table';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import type { RankExplanation } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

type Props = {
  explanations: RankExplanation[];
  /** Posición abierta (1-based) o null si el modal está cerrado. */
  position: number | null;
  onChangePosition: (position: number) => void;
  onClose: () => void;
};

/**
 * Explicación de un puesto del top 3 como «tiquete de pesaje»: por cada cosa que importa, el dato,
 * la nota (0–100), la importancia y lo que suma; cierra con la nota final. Encima, la comparación
 * con el siguiente puesto.
 */
export function RankingExplainModal({ explanations, position, onChangePosition, onClose }: Props) {
  const theme = useTheme();
  const { t, n, locale } = useI18n();
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const current = explanations.find((e) => e.position === position);
  const pts = (value: number) => n(value, 1, 1);

  const diffs = (list: { name: string; diff: number }[]) =>
    list.map((d) => `${d.name} (${d.diff > 0 ? '+' : '−'}${pts(Math.abs(d.diff))})`).join(', ');
  const cell = { flex: 1, textAlign: 'right' as const };
  const top = current ? [...current.criteria].sort((a, b) => b.weight - a.weight)[0] : null;

  return (
    <Modal visible={current != null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(20,22,43,0.55)' }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.common.close} style={StyleSheet.absoluteFill} onPress={onClose} />
        {current ? (
          <Surface padded elevation="lg" style={[styles.panel, { margin: theme.spacing[4] }]}>
            <ScrollView style={styles.scroll} contentContainerStyle={{ gap: theme.spacing[4] }} showsVerticalScrollIndicator={false}>
              <View style={styles.titleRow}>
                <View style={{ gap: theme.spacing[1], flexShrink: 1 }}>
                  <Text variant="label" colorKey="textSecondary">
                    {t.explain.heading(current.position)}
                  </Text>
                  <Text variant="subtitle">{current.name}</Text>
                </View>
                <Button title={t.common.close} size="sm" variant="ghost" onPress={onClose} />
              </View>

              {explanations.length > 1 ? (
                <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
                  {explanations.map((e) => (
                    <Button
                      key={e.itemId}
                      title={`#${e.position}`}
                      size="sm"
                      pill
                      accessibilityState={{ selected: e.position === current.position }}
                      variant={e.position === current.position ? 'primary' : 'secondary'}
                      onPress={() => onChangePosition(e.position)}
                    />
                  ))}
                </View>
              ) : null}

              <Text>
                {t.explain.lead(pts(current.total))} {top ? t.explain.example(top.name.toLowerCase(), n(top.weight, 0)) : null}
              </Text>

              {current.vsNext ? (
                <View
                  style={{
                    gap: theme.spacing[1],
                    padding: theme.spacing[3],
                    borderRadius: theme.radius.sm,
                    backgroundColor: theme.colors.surfaceMuted,
                  }}
                >
                  <Text variant="label">
                    {Math.abs(current.vsNext.gap) < 0.05
                      ? t.explain.tie(current.position + 1, current.vsNext.name)
                      : t.explain.beats(pts(current.vsNext.gap), current.position + 1, current.vsNext.name)}
                  </Text>
                  {current.vsNext.wins.length > 0 ? (
                    <Text variant="caption" colorKey="success">
                      {t.explain.winsIn}: {diffs(current.vsNext.wins)}
                    </Text>
                  ) : null}
                  {current.vsNext.losses.length > 0 ? (
                    <Text variant="caption" colorKey="danger">
                      {t.explain.losesIn}: {diffs(current.vsNext.losses)}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {/* Tiquete de pesaje */}
              <View
                accessibilityLabel={t.ticket.a11y(current.name, pts(current.total))}
                style={{
                  gap: 2,
                  paddingHorizontal: compact ? theme.spacing[3] : theme.spacing[4],
                  paddingVertical: theme.spacing[4],
                  borderTopWidth: 2,
                  borderBottomWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: theme.colors.textSecondary,
                  backgroundColor: theme.colors.background,
                }}
              >
                {!compact ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingBottom: theme.spacing[2],
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    }}
                  >
                    {[t.ticket.whatMatters, t.ticket.value, t.ticket.score, t.ticket.importance, t.ticket.adds].map((title, i) => (
                      <Text key={title} variant="caption" colorKey="textSecondary" style={i === 0 ? { flex: 1.5 } : cell}>
                        {title}
                      </Text>
                    ))}
                  </View>
                ) : null}

                {current.criteria.map((c) =>
                  compact ? (
                    <View
                      key={c.columnId}
                      style={{ paddingVertical: theme.spacing[2], borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 2 }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing[2] }}>
                        <Text variant="label">{c.name}</Text>
                        <Text variant="figure">{c.value == null ? t.explain.noValue : formatValue(c.value, locale)}</Text>
                      </View>
                      <Text variant="caption" colorKey="textSecondary">
                        {t.ticket.rowMobile(n(c.score, 0), Math.round(c.weight), pts(c.points))}
                      </Text>
                    </View>
                  ) : (
                    <View key={c.columnId} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing[2] }}>
                      <Text variant="label" style={{ flex: 1.5 }} numberOfLines={2}>
                        {c.name}
                      </Text>
                      <Text variant="figure" style={[cell, { fontWeight: theme.typography.weights.medium }]}>
                        {c.value == null ? t.explain.noValue : formatValue(c.value, locale)}
                      </Text>
                      <Text variant="figure" style={[cell, { fontWeight: theme.typography.weights.medium }]}>
                        {n(c.score, 0)}
                      </Text>
                      <Text variant="figure" colorKey="accentInk" style={[cell, { fontWeight: theme.typography.weights.medium }]}>
                        × {n(c.weight, 0)}%
                      </Text>
                      <Text variant="figure" style={cell}>
                        {pts(c.points)}
                      </Text>
                    </View>
                  ),
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginTop: theme.spacing[2],
                    paddingTop: theme.spacing[3],
                    borderTopWidth: 2,
                    borderTopColor: theme.colors.text,
                  }}
                >
                  <Text variant="label" style={{ fontSize: theme.typography.sizes.md }}>
                    {t.ticket.finalScore}
                  </Text>
                  <Text
                    variant="figure"
                    color={current.position === 1 ? theme.colors.verdict : theme.colors.text}
                    style={{ fontSize: theme.typography.sizes.xl }}
                  >
                    {t.ticket.of100(pts(current.total))}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </Surface>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  panel: { width: '94%', maxWidth: 640, maxHeight: '90%' },
  scroll: { flexGrow: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
});
