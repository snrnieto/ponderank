import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { ValueRef } from '@/domain';
import { useTheme } from '@/hooks/use-theme';

export type RefOption = {
  ref: ValueRef;
  label: string;
};

type Props = {
  label: string;
  value: ValueRef;
  options: RefOption[];
  emptyMessage: string;
  onChange: (ref: ValueRef) => void;
};

export function OperandPicker({ label, value, options, emptyMessage, onChange }: Props) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text variant="label">{label}</Text>
      {options.length === 0 ? (
        <Text variant="caption" colorKey="textSecondary">
          {emptyMessage}
        </Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          {options.map((option) => (
            <Button
              key={option.ref}
              title={option.label}
              size="sm"
              pill
              variant={value === option.ref ? 'primary' : 'secondary'}
              onPress={() => onChange(option.ref)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
