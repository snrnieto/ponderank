import { View } from 'react-native';

import type { WeighedOption } from '@/components/landing/balance-model';
import { LandingText } from '@/components/landing/landing-text';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';


/**
 * Desglose del puntaje de la opción ganadora: por cada cosa que importa, el dato, la nota que saca
 * (0–100), la importancia que le diste y lo que suma al total. Se actualiza con la balanza.
 * En pantallas angostas cada fila se parte en dos líneas.
 */
export function WeighTicket({ option, compact }: { option: WeighedOption; compact: boolean }) {
  const { landing } = useTheme();
  const { t, n, locale } = useI18n();
  const fmt = (v: number) => n(v, 1);
  const { colors } = landing;
  const cell = { flex: 1, textAlign: 'right' as const };

  return (
    <View
      accessibilityLabel={t.ticket.a11y(option.name, fmt(option.total))}
      style={{
        backgroundColor: colors.dial,
        borderRadius: 4,
        paddingHorizontal: compact ? 16 : 22,
        paddingVertical: 20,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.inkSoft,
        gap: 4,
        maxWidth: 540,
        width: '100%',
      }}
    >
      <LandingText variant="title" style={{ marginBottom: 10 }}>
        {option.name}
      </LandingText>

      {!compact ? (
        <View
          style={{ flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.dialLine }}
        >
          {[t.ticket.whatMatters, t.ticket.value, t.ticket.score, t.ticket.importance, t.ticket.adds].map((title, i) => (
            <LandingText
              key={title}
              variant="small"
              color={colors.inkSoft}
              style={i === 0 ? { flex: 1.4 } : cell}
            >
              {title}
            </LandingText>
          ))}
        </View>
      ) : null}

      {option.parts.map((part) =>
        compact ? (
          <View
            key={part.criterion.id}
            style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.dialLine, gap: 2 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <LandingText variant="label">{t.landing.criteria[part.criterion.id]}</LandingText>
              <LandingText variant="figure">{part.criterion.format(part.value, locale)}</LandingText>
            </View>
            <LandingText variant="small" color={colors.inkSoft}>
              {t.ticket.rowMobile(fmt(part.score), Math.round(part.share), fmt(part.points))}
            </LandingText>
          </View>
        ) : (
          <View key={part.criterion.id} style={{ flexDirection: 'row', paddingVertical: 6 }}>
            <LandingText variant="label" style={{ flex: 1.4 }}>
              {t.landing.criteria[part.criterion.id]}
            </LandingText>
            <LandingText variant="figure" style={cell}>
              {part.criterion.format(part.value, locale)}
            </LandingText>
            <LandingText variant="figure" style={cell}>
              {fmt(part.score)}
            </LandingText>
            <LandingText variant="figure" style={cell}>
              × {Math.round(part.share)}%
            </LandingText>
            <LandingText variant="figure" style={cell}>
              {fmt(part.points)}
            </LandingText>
          </View>
        ),
      )}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: 6,
          paddingTop: 10,
          borderTopWidth: 2,
          borderTopColor: colors.ink,
        }}
      >
        <LandingText variant="label">{t.ticket.finalScore}</LandingText>
        <LandingText variant="verdict" color={colors.needle}>
          {t.ticket.of100(fmt(option.total))}
        </LandingText>
      </View>
    </View>
  );
}
