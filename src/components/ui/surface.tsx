import { Platform, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { ElevationLevel } from '@/theme';

type SurfaceTone = 'default' | 'muted' | 'transparent';

export type SurfaceProps = ViewProps & {
  tone?: SurfaceTone;
  padded?: boolean;
  elevation?: ElevationLevel | 'none';
  style?: StyleProp<ViewStyle>;
};

export function Surface({
  tone = 'default',
  padded = false,
  elevation = 'sm',
  style,
  children,
  ...rest
}: SurfaceProps) {
  const theme = useTheme();
  const backgroundColor =
    tone === 'muted'
      ? theme.colors.surfaceMuted
      : tone === 'transparent'
        ? 'transparent'
        : theme.colors.surface;

  const elev = elevation === 'none' ? null : theme.elevation[elevation];
  const shadowStyle: ViewStyle = elev
    ? Platform.select({
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
      })!
    : {};

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor,
          borderRadius: theme.radius.lg,
          borderWidth: tone === 'transparent' || elevation !== 'none' ? 0 : StyleSheetHairline,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing[4] : 0,
          overflow: 'hidden',
        },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const StyleSheetHairline = 1 / 2;
