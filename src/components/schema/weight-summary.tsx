import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  sum: number;
  remaining: number;
  ok: boolean;
};

export function WeightSummary({ sum, remaining, ok }: Props) {
  const theme = useTheme();
  return (
    <Surface padded elevation="sm" style={{ gap: theme.spacing[2] }}>
      <Text variant="overline">Pesos</Text>
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
              ? 'OK 100%'
              : remaining > 0
                ? `Faltan ${remaining.toFixed(1)}%`
                : `Sobran ${Math.abs(remaining).toFixed(1)}%`
          }
          tone={ok ? 'success' : 'warning'}
        />
      </View>
      <Text colorKey="textSecondary">Suma actual: {sum.toFixed(1)}%</Text>
    </Surface>
  );
}
