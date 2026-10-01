import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

type Props = {
  sum: number;
  remaining: number;
  ok: boolean;
  criteria: { id: string; name: string; weight: number }[];
  /** Reparte las importancias para que sumen 100%. */
  onBalance: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Barra de importancia: cada criterio ocupa su porcentaje en una sola barra de bronce, como pesas
 * repartidas en la balanza. Si no suman 100% se puede ajustar con un toque.
 */
export function WeightSummary({ sum, remaining, ok, criteria, onBalance, style }: Props) {
  const theme = useTheme();
  const { t, n } = useI18n();
  const shades = [theme.colors.accent, theme.colors.accentPressed, theme.colors.accentInk];
  const fmt = (v: number) => n(v, 1);

  return (
    <View style={[{ gap: theme.spacing[2] }, style]}>
      <View
        accessibilityLabel={t.weights.total(fmt(sum))}
        style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: theme.colors.surfaceMuted }}
      >
        {criteria.map((c, i) => (
          <View
            key={c.id}
            style={{
              width: `${Math.max(0, Math.min(100, c.weight))}%`,
              backgroundColor: shades[i % shades.length],
              borderRightWidth: 2,
              borderRightColor: theme.colors.surface,
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[2] }}>
        <Text variant="label" colorKey={ok ? 'success' : 'warning'}>
          {ok
            ? t.weights.ok
            : remaining > 0
              ? t.weights.missing(fmt(sum), fmt(remaining))
              : t.weights.excess(fmt(sum), fmt(Math.abs(remaining)))}
        </Text>
        {!ok ? <Button title={t.weights.balance} size="sm" variant="accent" onPress={onBalance} /> : null}
      </View>
    </View>
  );
}
