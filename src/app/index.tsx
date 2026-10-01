import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BalanceInstrument } from '@/components/landing/balance-instrument';
import { weigh, type CriterionId, type Weights } from '@/components/landing/balance-model';
import { LandingButton } from '@/components/landing/landing-button';
import { LandingText } from '@/components/landing/landing-text';
import { WeighTicket } from '@/components/landing/weigh-ticket';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { PageTitle } from '@/components/ui/page-title';
import { APP_NAME } from '@/constants/brand';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

const APP_HREF = '/list' as Href;

export default function LandingScreen() {
  const { landing } = useTheme();
  const { t } = useI18n();
  const { colors } = landing;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const compact = width < 480;
  const gutter = wide ? 48 : 20;

  const [weights, setWeights] = useState<Weights>({ precio: 3, bateria: 2, almacenamiento: 1 });
  const ranking = weigh(weights);
  const dialSize = wide ? 300 : Math.min(width - gutter * 2, 300);

  const goToApp = () => router.push(APP_HREF);
  const column = { width: '100%' as const, maxWidth: landing.maxWidth, alignSelf: 'center' as const };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.dial }}>
      <PageTitle parts={[t.titles.landing]} />

      {/* Primera vista */}
      <View
        style={{
          backgroundColor: colors.enamel,
          paddingTop: insets.top + 20,
          paddingBottom: wide ? 72 : 48,
          paddingHorizontal: gutter,
        }}
      >
        <View
          style={[
            column,
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wide ? 48 : 32 },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={{ width: 36, height: 36 }}
              accessibilityIgnoresInvertColors
            />
            <LandingText variant="title" color={colors.enamelText}>
              {APP_NAME}
            </LandingText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {!compact && <LanguageSwitcher tone="onBrand" />}
            <LandingButton kind="link" title={t.landing.openApp} onPress={goToApp} />
          </View>
        </View>

        <View
          style={[
            column,
            {
              flexDirection: wide ? 'row' : 'column',
              alignItems: wide ? 'center' : 'stretch',
              gap: wide ? 72 : 44,
            },
          ]}
        >
          <View style={{ flex: wide ? 5 : undefined, gap: 24 }}>
            <LandingText variant="headline" compact={!wide} color={colors.enamelText}>
              {t.landing.headline}
            </LandingText>
            <LandingText variant="lead" color={colors.enamelText} style={{ maxWidth: 480 }}>
              {t.landing.lead(APP_NAME)}
            </LandingText>
            <View style={{ gap: 12 }}>
              <LandingButton title={t.landing.cta} onPress={goToApp} />
              <LandingText variant="small" color={colors.enamelTextSoft}>
                {t.landing.free}
              </LandingText>
            </View>
          </View>
          <View style={{ flex: wide ? 6 : undefined, maxWidth: wide ? 520 : undefined }}>
            <BalanceInstrument
              weights={weights}
              ranking={ranking}
              dialSize={dialSize}
              onChangeWeight={(id: CriterionId, value: number) =>
                setWeights((prev) => ({ ...prev, [id]: value }))
              }
            />
          </View>
        </View>
      </View>

      {/* Por qué gana */}
      <View style={{ paddingHorizontal: gutter, paddingVertical: wide ? 96 : 56 }}>
        <View
          style={[
            column,
            { flexDirection: wide ? 'row' : 'column', gap: wide ? 72 : 32, alignItems: wide ? 'center' : 'stretch' },
          ]}
        >
          <View style={{ flex: wide ? 1 : undefined, gap: 18, maxWidth: 460 }}>
            <LandingText variant="section" compact={!wide}>
              {t.landing.whyTitle}
            </LandingText>
            <LandingText variant="lead" color={colors.inkSoft}>
              {t.landing.whyBody}
            </LandingText>
          </View>
          <View style={{ flex: wide ? 1 : undefined, alignItems: wide ? 'flex-end' : 'stretch' }}>
            <WeighTicket option={ranking[0]} compact={compact} />
          </View>
        </View>
      </View>

      {/* Cómo se usa */}
      <View style={{ paddingHorizontal: gutter, paddingBottom: wide ? 104 : 64 }}>
        <View
          style={[
            column,
            {
              flexDirection: wide ? 'row' : 'column',
              gap: wide ? 72 : 24,
              paddingTop: wide ? 48 : 32,
              borderTopWidth: 2,
              borderTopColor: colors.ink,
            },
          ]}
        >
          <LandingText variant="section" compact={!wide} style={{ flex: wide ? 1 : undefined, maxWidth: 460 }}>
            {t.landing.stepsTitle}
          </LandingText>
          <View style={{ flex: wide ? 1 : undefined, gap: 18, maxWidth: 540 }}>
            {t.landing.steps.map((step, index) => (
              <View key={step} style={{ flexDirection: 'row', gap: 16, alignItems: 'baseline' }}>
                <LandingText variant="numeral" color={colors.brassDeep} style={{ width: 28 }}>
                  {index + 1}
                </LandingText>
                <LandingText variant="lead" style={{ flex: 1 }}>
                  {step}
                </LandingText>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Cierre */}
      <View
        style={{
          backgroundColor: colors.enamel,
          paddingHorizontal: gutter,
          paddingTop: wide ? 88 : 56,
          paddingBottom: insets.bottom + (wide ? 56 : 40),
        }}
      >
        <View style={[column, { gap: 28 }]}>
          <LandingText variant="headline" compact={!wide} color={colors.enamelText} style={{ maxWidth: 760 }}>
            {t.landing.closing}
          </LandingText>
          <LandingButton title={t.landing.cta} onPress={goToApp} />
          <View
            style={{
              marginTop: wide ? 48 : 32,
              paddingTop: 20,
              borderTopWidth: 1,
              borderTopColor: colors.enamelDeep,
              flexDirection: 'row',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <LandingText variant="small" color={colors.enamelTextSoft}>
              © {new Date().getFullYear()} {APP_NAME}
            </LandingText>
            {/* En pantallas angostas no cabe en la barra superior: vive aquí (nunca en los dos lugares). */}
            {compact && <LanguageSwitcher tone="onBrand" />}
            <LandingText variant="small" color={colors.enamelTextSoft}>
              {t.brand.tagline}
            </LandingText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
