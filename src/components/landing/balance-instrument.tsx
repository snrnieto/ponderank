import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { BalanceDial } from '@/components/landing/balance-dial';
import {
  DEMO_CRITERIA,
  MAX_WEIGHTS,
  type CriterionId,
  type WeighedOption,
  type Weights,
} from '@/components/landing/balance-model';
import { LandingText } from '@/components/landing/landing-text';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

type Props = {
  weights: Weights;
  onChangeWeight: (id: CriterionId, value: number) => void;
  ranking: WeighedOption[];
  dialSize: number;
};


function WeightButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'add' | 'remove';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { landing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed, hovered }) => ({
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? landing.colors.brassDeep : hovered ? landing.colors.brassLight : landing.colors.brass,
        opacity: disabled ? 0.35 : 1,
      })}
    >
      <SymbolView
        name={{ ios: icon === 'add' ? 'plus' : 'minus', android: icon, web: icon }}
        size={18}
        weight="bold"
        tintColor={landing.colors.ink}
      />
    </Pressable>
  );
}

/**
 * La balanza: esfera con ventanilla del ganador, una barra de bronce donde se apilan las pesas de
 * cada criterio y la lectura con las tres opciones ordenadas.
 */
export function BalanceInstrument({ weights, onChangeWeight, ranking, dialSize }: Props) {
  const { landing } = useTheme();
  const { t, n } = useI18n();
  const fmt = (v: number) => n(v, 1);
  const { colors } = landing;
  const leader = ranking[0];
  const totalWeights = DEMO_CRITERIA.reduce((acc, c) => acc + weights[c.id], 0);

  return (
    <View style={{ gap: 22 }}>
      {/* Cuerpo de la balanza: esfera + ventanilla */}
      <View style={{ alignItems: 'center' }}>
        <BalanceDial score={leader.total} size={dialSize} />
        <View
          accessibilityLiveRegion="polite"
          style={{
            width: dialSize,
            backgroundColor: colors.enamelDeep,
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              justifyContent: 'center',
              columnGap: 10,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: colors.dial,
            }}
          >
            <LandingText variant="label">{t.landing.youShould(leader.name)}</LandingText>
            <LandingText variant="verdict" color={colors.needle}>
              {fmt(leader.total)}/100
            </LandingText>
          </View>
        </View>
      </View>

      {/* Pesas sobre una sola barra */}
      <View style={{ gap: 12 }}>
        <LandingText variant="body" color={colors.enamelText} style={{ textAlign: 'center' }}>
          {t.landing.tryIt}
        </LandingText>
        <View
          style={{ flexDirection: 'row' }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {DEMO_CRITERIA.map((criterion) => {
            const count = weights[criterion.id];
            return (
              <View
                key={criterion.id}
                style={{ flex: 1, height: MAX_WEIGHTS * 13, justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}
              >
                {Array.from({ length: count }, (_, i) => (
                  <View
                    key={i}
                    style={{
                      // El disco más grande queda abajo, como en una pila real de pesas.
                      width: 58 - (count - 1 - i) * 6,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: colors.brass,
                    }}
                  />
                ))}
              </View>
            );
          })}
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.brass, marginHorizontal: 8 }} />
        <View style={{ flexDirection: 'row' }}>
          {DEMO_CRITERIA.map((criterion) => {
            const count = weights[criterion.id];
            const share = totalWeights ? Math.round((count / totalWeights) * 100) : 0;
            return (
              <View key={criterion.id} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                <LandingText variant="label" color={colors.enamelText} style={{ textAlign: 'center' }}>
                  {t.landing.criteria[criterion.id]} · {share}%
                </LandingText>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <WeightButton
                    icon="remove"
                    label={t.landing.lessImportant(t.landing.criteria[criterion.id])}
                    disabled={count === 0 || totalWeights <= 1}
                    onPress={() => onChangeWeight(criterion.id, count - 1)}
                  />
                  <WeightButton
                    icon="add"
                    label={t.landing.moreImportant(t.landing.criteria[criterion.id])}
                    disabled={count >= MAX_WEIGHTS}
                    onPress={() => onChangeWeight(criterion.id, count + 1)}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Lectura de la balanza */}
      <View style={{ backgroundColor: colors.dial, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 16 }}>
        {ranking.map((option, index) => (
          <View
            key={option.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 9,
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: colors.dialLine,
            }}
          >
            <LandingText variant="figure" color={colors.inkSoft} style={{ width: 22 }}>
              {index + 1}.
            </LandingText>
            <LandingText variant="label" style={{ flex: 1 }} numberOfLines={1}>
              {option.name}
            </LandingText>
            <LandingText
              variant={index === 0 ? 'verdict' : 'figure'}
              color={index === 0 ? colors.needle : colors.ink}
              style={{ textAlign: 'right' }}
            >
              {fmt(option.total)}
            </LandingText>
          </View>
        ))}
      </View>

      <LandingText variant="small" color={colors.enamelTextSoft} style={{ textAlign: 'center' }}>
        {t.landing.demoNote}
      </LandingText>
    </View>
  );
}
