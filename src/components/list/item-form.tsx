import { useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { ImageFieldInput } from '@/components/list/image-field-input';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { editableColumns as getEditableColumns, type FieldValue, type Item } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { safeGoBack } from '@/navigation/safe-go-back';
import { useLists } from '@/state/lists-context';

export function ItemForm({ mode }: { mode: 'new' | 'edit' }) {
  const { listId, itemId } = useLocalSearchParams<{ listId: string; itemId?: string }>();
  const { getBundle, saveItem, removeItem, newItemDraft } = useLists();
  const bundle = getBundle(listId);
  const theme = useTheme();
  const listHref = `/lists/${listId}` as Href;

  const existing = mode === 'edit' ? bundle?.items.find((i) => i.id === itemId) : undefined;
  const [draft, setDraft] = useState<Item | null>(null);

  if (!bundle) {
    return (
      <View style={{ padding: theme.spacing[4] }}>
        <Text>Lista no encontrada</Text>
      </View>
    );
  }

  const baseItem = existing ?? (mode === 'new' ? newItemDraft(listId) : null);
  if (!baseItem) {
    return (
      <View style={{ padding: theme.spacing[4] }}>
        <Text>Item no encontrado</Text>
      </View>
    );
  }

  const item = draft ?? baseItem;
  const editableColumns = getEditableColumns(bundle.columns);

  function setValue(columnId: string, value: FieldValue) {
    setDraft({
      ...item,
      values: { ...item.values, [columnId]: value },
    });
  }

  async function onSave() {
    await saveItem(listId, draft ?? item);
    safeGoBack(listHref);
  }

  function onDelete() {
    Alert.alert('Eliminar item', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await removeItem(listId, item.id);
          safeGoBack(listHref);
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing[4], gap: theme.spacing[4] }}>
      <Surface padded elevation="sm" style={{ gap: theme.spacing[4] }}>
        <Text variant="overline">{mode === 'new' ? 'Nuevo item' : 'Editar item'}</Text>
        {editableColumns.map((column) => {
          const value = item.values[column.id];
          return (
            <View key={column.id} style={{ gap: theme.spacing[2] }}>
              <Text variant="label">{column.name}</Text>
              {column.kind === 'image' ? (
                <ImageFieldInput
                  value={typeof value === 'string' ? value : ''}
                  onChange={(uri) => setValue(column.id, uri)}
                />
              ) : column.kind === 'category' ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                  {(column.options ?? []).map((option) => (
                    <Button
                      key={option}
                      title={option}
                      size="sm"
                      pill
                      variant={value === option ? 'primary' : 'secondary'}
                      onPress={() => setValue(column.id, option)}
                    />
                  ))}
                </View>
              ) : (
                <TextInput
                  value={value == null ? '' : String(value)}
                  keyboardType={
                    column.kind === 'number' || column.kind === 'criterion'
                      ? 'decimal-pad'
                      : 'default'
                  }
                  onChangeText={(text) => {
                    if (column.kind === 'number' || column.kind === 'criterion') {
                      if (text.trim() === '') {
                        setValue(column.id, null);
                        return;
                      }
                      const num = Number(text);
                      setValue(column.id, Number.isFinite(num) ? num : null);
                    } else {
                      setValue(column.id, text);
                    }
                  }}
                />
              )}
            </View>
          );
        })}
      </Surface>

      <Button title="Guardar" pill onPress={() => void onSave()} />
      {mode === 'edit' ? <Button title="Eliminar" variant="danger" pill onPress={onDelete} /> : null}
      <Button title="Cancelar" variant="ghost" onPress={() => safeGoBack(listHref)} />
    </ScrollView>
  );
}
