import { useLocalSearchParams, useNavigation, type Href } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ImageFieldInput } from '@/components/list/image-field-input';
import { StoreSearchLinks } from '@/components/list/store-search-links';
import { Button } from '@/components/ui/button';
import { confirmAction } from '@/components/ui/confirm-action';
import { NumberInput } from '@/components/ui/number-input';
import { PageTitle } from '@/components/ui/page-title';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import {
  editableColumns as getEditableColumns,
  itemDisplayName,
  rankDirectionHelp,
  type ComparisonListBundle,
  type FieldValue,
  type Item,
  type ListColumn,
} from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { safeGoBack } from '@/navigation/safe-go-back';
import { setFlash } from '@/state/flash';
import { useLists } from '@/state/lists-context';

export function ItemForm({ mode }: { mode: 'new' | 'edit' }) {
  const { listId, itemId } = useLocalSearchParams<{ listId: string; itemId?: string }>();
  const { getBundle, newItemDraft } = useLists();
  const bundle = getBundle(listId);
  const theme = useTheme();
  const { t } = useI18n();

  if (!bundle) {
    return (
      <View style={{ padding: theme.spacing[5], gap: theme.spacing[3] }}>
        <Text variant="title">{t.common.listNotFound}</Text>
        <Button title={t.common.goToLists} variant="accent" onPress={() => safeGoBack('/list' as Href)} />
      </View>
    );
  }

  const existing = mode === 'edit' ? bundle.items.find((i) => i.id === itemId) : undefined;
  if (mode === 'edit' && !existing) {
    return (
      <View style={{ padding: theme.spacing[5], gap: theme.spacing[3] }}>
        <Text variant="title">{t.item.notFound}</Text>
        <Text colorKey="textSecondary">{t.item.notFoundBody}</Text>
        <Button title={t.item.backToList} variant="accent" onPress={() => safeGoBack(`/list/${listId}` as Href)} />
      </View>
    );
  }

  return <ItemEditor mode={mode} bundle={bundle} initial={existing ?? newItemDraft(listId)} />;
}

/** Nombres de los datos calculados que cuentan para decidir y usan esta columna. */
function feedsInto(column: ListColumn, columns: ListColumn[]): string[] {
  const ref = `column:${column.id}`;
  return columns
    .filter((c) => c.rank && c.calc && (c.calc.leftRef === ref || c.calc.rightRef === ref))
    .map((c) => c.name.toLowerCase());
}

function ItemEditor({ mode, bundle, initial }: { mode: 'new' | 'edit'; bundle: ComparisonListBundle; initial: Item }) {
  const listId = bundle.list.id;
  const { saveItem, removeItem } = useLists();
  const theme = useTheme();
  const { t, locale } = useI18n();
  const navigation = useNavigation();
  const listHref = `/list/${listId}` as Href;

  const [item, setItem] = useState<Item>(initial);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  // Permite salir sin preguntar justo después de guardar o eliminar.
  const leaving = useRef(false);

  const editableColumns = getEditableColumns(bundle.columns);
  const nameColumn = bundle.columns.find((c) => c.kind === 'text');
  const nameValue = nameColumn ? item.values[nameColumn.id] : 'ok';
  const nameMissing = !!nameColumn && (typeof nameValue !== 'string' || nameValue.trim() === '');
  const dirty = !busy && JSON.stringify(item.values) !== JSON.stringify(initial.values);
  const displayName = itemDisplayName(item, bundle.columns, t.common.untitled);
  const directions = rankDirectionHelp(locale);

  usePreventRemove(dirty, ({ data }) => {
    if (leaving.current) {
      navigation.dispatch(data.action);
      return;
    }
    confirmAction(t.common.discardTitle, t.item.discardBody, () => navigation.dispatch(data.action), {
      confirm: t.common.discard,
      cancel: t.common.cancel,
    });
  });

  function setValue(columnId: string, value: FieldValue) {
    setItem((prev) => ({ ...prev, values: { ...prev.values, [columnId]: value } }));
  }

  async function onSave() {
    setTouched(true);
    if (nameMissing) return;
    setBusy(true);
    try {
      await saveItem(listId, item);
      leaving.current = true;
      setFlash({ listId, itemId: item.id, message: mode === 'new' ? t.item.addedFlash(displayName) : t.item.savedFlash(displayName) });
      safeGoBack(listHref);
    } finally {
      setBusy(false);
    }
  }

  function onDelete() {
    confirmAction(
      t.item.deleteTitle(displayName),
      t.common.irreversible,
      () => {
        setBusy(true);
        void removeItem(listId, item.id).then(() => {
          leaving.current = true;
          setFlash({ listId, message: t.item.deletedFlash(displayName) });
          safeGoBack(listHref);
        });
      },
      { confirm: t.common.delete, cancel: t.common.cancel },
    );
  }

  // El nombre va primero: es lo único obligatorio.
  const ordered = nameColumn ? [nameColumn, ...editableColumns.filter((c) => c.id !== nameColumn.id)] : editableColumns;

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: theme.spacing[4], alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 640, gap: theme.spacing[4] }}>
        <PageTitle parts={[mode === 'new' ? t.titles.newOption : t.titles.editOption(displayName), bundle.list.name]} />

        <Surface padded elevation="none" style={{ gap: theme.spacing[5], borderWidth: 1, borderColor: theme.colors.border }}>
          {ordered.map((column) => {
            const value = item.values[column.id];
            const isName = column.id === nameColumn?.id;
            const showNameError = isName && nameMissing && touched;
            const feeds = feedsInto(column, bundle.columns);
            const hint = column.rank
              ? t.item.counts(Math.round(column.rank.weight), directions[column.rank.direction].label.toLowerCase())
              : feeds.length > 0
                ? t.item.feeds(feeds.join(', '))
                : null;
            return (
              <View key={column.id} style={{ gap: theme.spacing[2] }}>
                <View style={{ gap: 2 }}>
                  <Text variant="label" style={{ fontSize: theme.typography.sizes.md }}>
                    {column.name}
                    {isName ? (
                      <Text variant="label" colorKey="textSecondary">
                        {t.item.required}
                      </Text>
                    ) : null}
                  </Text>
                  {hint ? (
                    <Text variant="caption" colorKey="accentInk">
                      {hint}
                    </Text>
                  ) : null}
                </View>
                {column.kind === 'image' ? (
                  <ImageFieldInput value={typeof value === 'string' ? value : ''} onChange={(uri) => setValue(column.id, uri)} />
                ) : column.kind === 'category' ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                    {(column.options ?? []).map((option) => (
                      <Button
                        key={option}
                        title={option}
                        size="sm"
                        pill
                        variant={value === option ? 'primary' : 'secondary'}
                        accessibilityState={{ selected: value === option }}
                        onPress={() => setValue(column.id, value === option ? null : option)}
                      />
                    ))}
                  </View>
                ) : column.kind === 'number' || column.kind === 'criterion' ? (
                  <NumberInput
                    value={typeof value === 'number' ? value : null}
                    accessibilityLabel={column.name}
                    onChangeValue={(num) => setValue(column.id, num)}
                    placeholder={t.item.noValue}
                  />
                ) : (
                  <TextInput
                    value={value == null ? '' : String(value)}
                    accessibilityLabel={column.name}
                    onChangeText={(text) => setValue(column.id, text)}
                    onBlur={() => isName && setTouched(true)}
                    style={showNameError ? { borderWidth: 1, borderColor: theme.colors.danger } : undefined}
                  />
                )}
                {showNameError ? (
                  <Text variant="caption" colorKey="danger" accessibilityLiveRegion="polite">
                    {t.item.nameError}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </Surface>

        {mode === 'edit' && !nameMissing ? <StoreSearchLinks query={displayName} /> : null}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing[2] }}>
          {mode === 'edit' ? <Button title={t.item.deleteOption} variant="danger" size="sm" onPress={onDelete} /> : null}
          <View style={{ flex: 1 }} />
          <Button title={t.common.cancel} variant="ghost" onPress={() => safeGoBack(listHref)} />
          <Button title={mode === 'new' ? t.item.add : t.item.save} variant="accent" disabled={busy} onPress={() => void onSave()} />
        </View>
      </View>
    </ScrollView>
  );
}
