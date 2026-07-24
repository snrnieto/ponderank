import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
};

export function PartialsToggle({ value, onChange }: Props) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text variant="label">% parciales por criterio</Text>
      <Button
        title={value ? 'Ocultar parciales' : 'Mostrar parciales'}
        variant="secondary"
        size="sm"
        onPress={() => onChange(!value)}
      />
    </View>
  );
}
