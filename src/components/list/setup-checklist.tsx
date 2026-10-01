import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

type Step = {
  title: string;
  description: string;
  done: boolean;
  action?: { title: string; onPress: () => void };
  secondary?: { title: string; onPress: () => void };
};

/**
 * Guía de primer uso de una lista: muestra los pasos que faltan para ver un ganador, con la acción
 * de cada uno. El primer paso pendiente lleva la acción principal (bronce).
 */
export function SetupChecklist({ steps }: { steps: Step[] }) {
  const theme = useTheme();
  const { t } = useI18n();
  const nextIndex = steps.findIndex((s) => !s.done);

  return (
    <Surface padded elevation="none" style={{ gap: theme.spacing[4], borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ gap: theme.spacing[1] }}>
        <Text variant="title">{t.checklist.title}</Text>
        <Text colorKey="textSecondary">{t.checklist.body}</Text>
      </View>
      {steps.map((step, index) => {
        const isNext = index === nextIndex;
        return (
          <View
            key={step.title}
            style={{
              flexDirection: 'row',
              gap: theme.spacing[3],
              paddingTop: theme.spacing[3],
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              opacity: step.done || isNext ? 1 : 0.6,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: step.done ? theme.colors.successSoft : isNext ? theme.colors.primary : theme.colors.surfaceMuted,
              }}
            >
              {step.done ? (
                <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={18} weight="bold" tintColor={theme.colors.success} />
              ) : (
                <Text variant="figure" color={isNext ? theme.colors.onPrimary : theme.colors.textSecondary}>
                  {index + 1}
                </Text>
              )}
            </View>
            <View style={{ flex: 1, gap: theme.spacing[2] }}>
              <Text variant="label" style={{ fontSize: theme.typography.sizes.md }}>
                {step.title}
                {step.done ? t.checklist.done : ''}
              </Text>
              <Text colorKey="textSecondary">{step.description}</Text>
              {isNext && (step.action || step.secondary) ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                  {step.action ? <Button title={step.action.title} variant="accent" onPress={step.action.onPress} /> : null}
                  {step.secondary ? <Button title={step.secondary.title} variant="secondary" onPress={step.secondary.onPress} /> : null}
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </Surface>
  );
}
