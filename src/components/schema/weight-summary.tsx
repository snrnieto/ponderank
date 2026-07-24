import { View } from 'react-native';

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
    <Surface
      padded
      style={{
        borderColor: ok ? theme.colors.success : theme.colors.warning,
        borderWidth: 1,
        gap: theme.spacing[1],
      }}
    >
      <Text variant="label">Pesos de criterios</Text>
      <Text>
        Suma actual: {sum.toFixed(1)}% ·{' '}
        {ok ? 'OK (100%)' : remaining > 0 ? `Faltan ${remaining.toFixed(1)}%` : `Sobran ${Math.abs(remaining).toFixed(1)}%`}
      </Text>
    </Surface>
  );
}
