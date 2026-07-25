import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type GradientCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: readonly [string, string, ...string[]];
};

export function GradientCard({ children, style, colors }: GradientCardProps) {
  const theme = useTheme();
  const elev = theme.elevation.md;
  const shadowStyle: ViewStyle = Platform.select({
    web: {
      boxShadow: `0 ${elev.shadowOffset.height}px ${elev.shadowRadius}px rgba(108, 92, 231, ${elev.shadowOpacity})`,
    } as ViewStyle,
    default: {
      shadowColor: elev.shadowColor,
      shadowOpacity: elev.shadowOpacity,
      shadowRadius: elev.shadowRadius,
      shadowOffset: elev.shadowOffset,
      elevation: elev.elevation,
    },
  })!;

  return (
    <View style={[{ borderRadius: theme.radius.xl, overflow: 'hidden' }, shadowStyle, style]}>
      <LinearGradient
        colors={colors ? [...colors] : [...theme.gradients.brand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: theme.spacing[5],
          borderRadius: theme.radius.xl,
        }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
