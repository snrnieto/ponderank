import { Pressable } from 'react-native';

import { LandingText } from '@/components/landing/landing-text';
import { useTheme } from '@/hooks/use-theme';

/** Botón del mundo «Balanza»: bronce macizo (principal) o texto subrayado sobre esmalte (secundario). */
export function LandingButton({
  title,
  onPress,
  kind = 'primary',
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'link';
}) {
  const { landing } = useTheme();
  const { colors } = landing;

  if (kind === 'link') {
    return (
      <Pressable accessibilityRole="link" onPress={onPress} hitSlop={8}>
        {({ hovered }) => (
          <LandingText
            variant="label"
            color={colors.enamelText}
            style={{
              textDecorationLine: 'underline',
              textDecorationColor: hovered ? colors.brassLight : colors.enamelTextSoft,
            }}
          >
            {title}
          </LandingText>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }) => ({
        alignSelf: 'flex-start',
        paddingHorizontal: 26,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: pressed ? colors.brassDeep : hovered ? colors.brassLight : colors.brass,
      })}
    >
      <LandingText variant="button">
        {title}
      </LandingText>
    </Pressable>
  );
}
