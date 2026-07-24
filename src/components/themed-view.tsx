import { View, type ViewProps } from 'react-native';

import { type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

/** @deprecated Prefer `@/components/ui/surface`. */
export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return (
    <View style={[{ backgroundColor: theme.colors[type ?? 'background'] }, style]} {...otherProps} />
  );
}
