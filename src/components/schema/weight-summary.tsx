import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  sum: number;
  remaining: number;
  ok: boolean;
  criteria: { id: string; name: string; weight: number }[];
  style?: StyleProp<ViewStyle>;
};

export function WeightSummary({ sum, remaining, ok, criteria, style }: Props) {
  const theme = useTheme();
  return (
    <Surface padded elevation="sm" style={[{ gap: theme.spacing[2] }, style]}>
      <Text variant="overline">Ranking</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing[2],
          flexWrap: 'wrap',
        }}
      >
        <Text variant="subtitle">Pesos de criterios</Text>
        <Badge
          label={
            ok
              ? 'Suman 100%'
              : remaining > 0
                ? `Faltan ${remaining.toFixed(1)}%`
                : `Sobran ${Math.abs(remaining).toFixed(1)}%`
          }
          tone={ok ? 'success' : 'warning'}
        />
      </View>
      <Text variant="caption" colorKey="textSecondary">
        Cada criterio le da a cada item de 0 a 100 puntos. Puntaje total = suma de (puntos × peso %).
      </Text>
      {criteria.length === 0 ? (
        <Text variant="caption" colorKey="textSecondary">
          Aún no hay criterios: activa “Usar en el ranking” en una columna numérica (ej. Precio).
        </Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          {criteria.map((c) => (
            <Badge key={c.id} label={`${c.name} · ${c.weight}%`} tone="primary" />
          ))}
          <Badge label={`Total ${sum.toFixed(1)}%`} tone={ok ? 'success' : 'warning'} />
        </View>
      )}
    </Surface>
  );
}
