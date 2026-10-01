import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
};

export function PartialsToggle({ value, onChange }: Props) {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text variant="label">{t.sort.partialsTitle}</Text>
      <Button
        title={value ? t.sort.hidePartials : t.sort.showPartials}
        variant="secondary"
        size="sm"
        style={{ alignSelf: 'flex-start' }}
        onPress={() => onChange(!value)}
      />
    </View>
  );
}
