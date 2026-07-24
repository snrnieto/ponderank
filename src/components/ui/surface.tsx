import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type SurfaceTone = 'default' | 'muted' | 'transparent';

export type SurfaceProps = ViewProps & {
  tone?: SurfaceTone;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Surface({ tone = 'default', padded = false, style, children, ...rest }: SurfaceProps) {
  const theme = useTheme();
  const backgroundColor =
    tone === 'muted'
      ? theme.colors.surfaceMuted
      : tone === 'transparent'
        ? 'transparent'
        : theme.colors.surface;

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor,
          borderRadius: theme.radius.lg,
          borderWidth: tone === 'transparent' ? 0 : StyleSheetHairline,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing[4] : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const StyleSheetHairline = 1 / 2;
