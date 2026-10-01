import { SymbolView } from 'expo-symbols';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { formatScore } from '@/components/list/ranking-table';
import { Button } from '@/components/ui/button';
import { confirmAction } from '@/components/ui/confirm-action';
import { PageShell } from '@/components/ui/page-shell';
import { PageTitle } from '@/components/ui/page-title';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { computeRanking, itemDisplayName, type ComparisonListBundle, type Locale } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import type { Messages } from '@/i18n/messages/es';
import { useLists } from '@/state/lists-context';

/** Resumen de una lista: cuántas opciones tiene y cuál va ganando. */
function listSummary(bundle: ComparisonListBundle, t: Messages, locale: Locale): string {
  const count = bundle.items.length;
  if (count === 0) return t.lists.noOptions;
  const options = t.common.options(count);
  if (!bundle.columns.some((c) => c.rank)) return t.lists.needsCriteria(options);
  try {
    const ranked = computeRanking(bundle.items, bundle.columns, bundle.globals);
    const best = ranked.reduce((a, b) => (b.total > a.total ? b : a));
    const item = bundle.items.find((i) => i.id === best.itemId)!;
    return t.lists.leading(options, itemDisplayName(item, bundle.columns), formatScore(best.total, locale));
  } catch {
    return options;
  }
}

export default function ListsIndexScreen() {
  const { bundles, loading, createList, deleteList } = useLists();
  const [name, setName] = useState('');
  const router = useRouter();
  const theme = useTheme();
  const { t, locale } = useI18n();

  async function onCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const bundle = await createList(trimmed);
    setName('');
    router.push(`/list/${bundle.list.id}` as Href);
  }

  function onDelete(listId: string, listName: string) {
    confirmAction(t.lists.deleteTitle(listName), t.lists.deleteBody, () => void deleteList(listId), {
      confirm: t.common.delete,
      cancel: t.common.cancel,
    });
  }

  return (
    <PageShell maxWidth={720} style={{ gap: theme.spacing[6] }}>
      <PageTitle parts={[t.titles.lists]} />

      <View style={{ gap: theme.spacing[3] }}>
        <Text variant="title">{t.lists.question}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          <TextInput
            value={name}
            onChangeText={setName}
            accessibilityLabel={t.lists.nameLabel}
            placeholder={t.lists.placeholder}
            onSubmitEditing={() => void onCreate()}
            style={{ flexGrow: 1, flexBasis: 260, minWidth: 0 }}
          />
          <Button title={t.lists.create} variant="accent" disabled={!name.trim()} onPress={() => void onCreate()} />
        </View>
      </View>

      <View style={{ gap: theme.spacing[3], flex: 1 }}>
        <Text variant="subtitle">{t.lists.yours}</Text>
        {loading ? (
          <Text colorKey="textSecondary">{t.lists.loading}</Text>
        ) : (
          <FlatList
            data={bundles}
            keyExtractor={(item) => item.list.id}
            contentContainerStyle={{ gap: theme.spacing[2], paddingBottom: theme.spacing[6] }}
            ListEmptyComponent={<Text colorKey="textSecondary">{t.lists.empty}</Text>}
            renderItem={({ item }) => (
              <Surface padded elevation="none" style={{ borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={t.lists.open(item.list.name)}
                    onPress={() => router.push(`/list/${item.list.id}` as Href)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], minHeight: theme.components.touchTarget }}
                  >
                    <View style={{ flex: 1, gap: theme.spacing[1] }}>
                      <Text variant="label" style={{ fontSize: theme.typography.sizes.lg }}>
                        {item.list.name}
                      </Text>
                      <Text variant="caption" colorKey="textSecondary" numberOfLines={1}>
                        {listSummary(item, t, locale)}
                      </Text>
                    </View>
                    <SymbolView
                      name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                      size={20}
                      tintColor={theme.colors.textSecondary}
                    />
                  </Pressable>
                  <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: theme.colors.border, marginHorizontal: theme.spacing[1] }} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t.lists.deleteLabel(item.list.name)}
                    onPress={() => onDelete(item.list.id, item.list.name)}
                    style={({ hovered, pressed }) => ({
                      width: theme.components.touchTarget,
                      height: theme.components.touchTarget,
                      borderRadius: theme.radius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: hovered || pressed ? theme.colors.dangerSoft : 'transparent',
                    })}
                  >
                    {({ hovered }) => (
                      <SymbolView
                        name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                        size={18}
                        tintColor={hovered ? theme.colors.danger : theme.colors.textSecondary}
                      />
                    )}
                  </Pressable>
                </View>
              </Surface>
            )}
          />
        )}
      </View>
    </PageShell>
  );
}
