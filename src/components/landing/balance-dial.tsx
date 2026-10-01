import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { LandingText } from '@/components/landing/landing-text';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

const TICKS = Array.from({ length: 21 }, (_, i) => i * 5);
const NUMERALS = [0, 25, 50, 75, 100];

function angleFor(score: number) {
  return -90 + Math.max(0, Math.min(100, score)) * 1.8;
}

/**
 * Esfera de balanza de reloj (0–100). La aguja roja marca el puntaje del ganador y gira con
 * ease-out cada vez que cambia; con movimiento reducido salta directo.
 */
export function BalanceDial({ score, size }: { score: number; size: number }) {
  const { landing } = useTheme();
  const { t } = useI18n();
  const { colors } = landing;
  const radius = size / 2;
  const angle = useSharedValue(-90);

  useEffect(() => {
    angle.value = withTiming(angleFor(score), {
      duration: 900,
      easing: Easing.out(Easing.exp),
      reduceMotion: ReduceMotion.System,
    });
  }, [angle, score]);

  const needleStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={t.landing.needle(Math.round(score))}
      style={{ width: size, height: radius + 26, overflow: 'hidden' }}
    >
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: colors.dial,
          borderWidth: 6,
          borderColor: colors.brass,
        }}
      />

      {TICKS.map((tick) => {
        const major = tick % 25 === 0;
        return (
          <View
            key={tick}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: radius - 1,
              top: 0,
              width: 2,
              height: size,
              transform: [{ rotate: `${angleFor(tick)}deg` }],
            }}
          >
            <View
              style={{
                marginTop: 12,
                height: major ? 16 : 8,
                width: 2,
                backgroundColor: major ? colors.ink : colors.inkSoft,
              }}
            />
          </View>
        );
      })}

      {NUMERALS.map((n) => (
        <View
          key={n}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: radius - 20,
            top: 0,
            width: 40,
            height: size,
            alignItems: 'center',
            transform: [{ rotate: `${angleFor(n)}deg` }],
          }}
        >
          <LandingText
            variant="figure"
            style={{
              marginTop: 32,
              fontSize: landing.sizes.dialNumeral,
              transform: [{ rotate: `${-angleFor(n)}deg` }],
            }}
          >
            {n}
          </LandingText>
        </View>
      ))}

      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', left: radius - 2, top: 0, width: 4, height: size, alignItems: 'center' },
          needleStyle,
        ]}
      >
        <View
          style={{
            marginTop: 54,
            width: 4,
            height: radius - 54,
            borderRadius: 2,
            backgroundColor: colors.needle,
          }}
        />
      </Animated.View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: radius + 16,
          height: 10,
          backgroundColor: colors.brass,
        }}
      />

      <View
        style={{
          position: 'absolute',
          left: radius - 14,
          top: radius - 14,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.ink,
          borderWidth: 4,
          borderColor: colors.brass,
        }}
      />
    </View>
  );
}
