import { Image } from 'expo-image';
import { View, useWindowDimensions } from 'react-native';

import { formatScore } from '@/components/list/ranking-table';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { RankExplanation } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import type { Messages } from '@/i18n/messages/es';

type Props = {
  winner: RankExplanation;
  image?: string | null;
  optionCount: number;
  onExplain: () => void;
};

/** Una frase que explica por qué gana el primero frente al segundo (y avisa los casi empates). */
function verdictSentence(winner: RankExplanation, t: Messages, score: (n: number) => string): string | null {
  const next = winner.vsNext;
  if (!next) return null;
  if (Math.abs(next.gap) < 0.05) return t.verdict.tie(next.name);
  const gap = score(next.gap);
  if (next.gap < 1) {
    const where = next.wins[0] ? t.verdict.nearTieWhere(next.wins[0].name.toLowerCase()) : '';
    return t.verdict.nearTie(next.name, gap) + where;
  }
  const reasons = next.wins.slice(0, 2).map((w) => w.name.toLowerCase());
  if (reasons.length === 0) return t.verdict.winsBy(next.name, gap);
  return t.verdict.winsByIn(next.name, gap, reasons.join(t.verdict.and));
}

/**
 * Veredicto de la lista: la opción que más te conviene según lo que te importa, con su nota y una
 * explicación corta. Es el único lugar de la pantalla que usa el rojo del ganador.
 */
export function VerdictBlock({ winner, image, optionCount, onExplain }: Props) {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const score = (n: number) => formatScore(n, locale);
  const sentence = verdictSentence(winner, t, score);
  const onBrand = theme.colors.textInverse;

  return (
    <View
      style={{
        backgroundColor: theme.colors.brandSurface,
        borderRadius: theme.radius.lg,
        padding: compact ? theme.spacing[4] : theme.spacing[6],
        flexDirection: compact ? 'column' : 'row',
        alignItems: compact ? 'stretch' : 'center',
        gap: compact ? theme.spacing[3] : theme.spacing[6],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4], flex: compact ? undefined : 1 }}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: compact ? 64 : 120, height: compact ? 64 : 120, borderRadius: theme.radius.md }}
            contentFit="cover"
            accessibilityLabel={winner.name}
          />
        ) : null}
        <View style={{ flex: 1, gap: theme.spacing[1] }}>
          <Text variant="label" color={onBrand} style={{ opacity: 0.85 }}>
            {t.verdict.youShould}
          </Text>
          <Text variant={compact ? 'subtitle' : 'display'} color={onBrand}>
            {winner.name}
          </Text>
          {sentence ? (
            <Text color={onBrand} style={{ opacity: 0.9, maxWidth: 560 }}>
              {sentence}
            </Text>
          ) : null}
          <Text variant="caption" color={onBrand} style={{ opacity: 0.8 }}>
            {t.verdict.among(t.common.options(optionCount))}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: compact ? 'row' : 'column',
          alignItems: compact ? 'center' : 'flex-end',
          justifyContent: 'space-between',
          gap: theme.spacing[3],
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[2],
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: theme.spacing[2],
          }}
        >
          <Text variant="title" color={theme.colors.verdict} style={{ fontVariant: ['tabular-nums'] }}>
            {score(winner.total)}
          </Text>
          <Text variant="label" colorKey="textSecondary">
            {t.verdict.of100}
          </Text>
        </View>
        <Button title={t.verdict.why} variant="accent" onPress={onExplain} />
      </View>
    </View>
  );
}
