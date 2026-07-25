import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'primary';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const theme = useTheme();

  const { backgroundColor, color } = (() => {
    switch (tone) {
      case 'success':
        return { backgroundColor: theme.colors.successSoft, color: theme.colors.success };
      case 'danger':
        return { backgroundColor: theme.colors.dangerSoft, color: theme.colors.danger };
      case 'warning':
        return { backgroundColor: theme.colors.warningSoft, color: theme.colors.warning };
      case 'info':
        return { backgroundColor: theme.colors.infoSoft, color: theme.colors.info };
      case 'primary':
        return { backgroundColor: theme.colors.primaryMuted, color: theme.colors.primary };
      default:
        return { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.textSecondary };
    }
  })();

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[1],
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text variant="caption" color={color} style={{ fontWeight: theme.typography.weights.semibold }}>
        {label}
      </Text>
    </View>
  );
}
