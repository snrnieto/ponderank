import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth } from '@/theme';

type Props = ViewProps & {
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** Override default max width (e.g. narrower for forms). */
  maxWidth?: number;
};

/** Centers content and caps width on large screens; full bleed on small ones. */
export function PageShell({
  padded = true,
  maxWidth = MaxContentWidth,
  style,
  children,
  ...rest
}: Props) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, width: '100%', alignItems: 'center' }} {...rest}>
      <View
        style={[
          {
            width: '100%',
            maxWidth,
            flex: 1,
            alignSelf: 'center',
            padding: padded ? theme.spacing[5] : 0,
            gap: theme.spacing[4],
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
