import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { ImageFieldInput } from '@/components/list/image-field-input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import type { FieldValue, Item } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useLists } from '@/state/lists-context';

export function ItemForm({ mode }: { mode: 'new' | 'edit' }) {
  const { listId, itemId } = useLocalSearchParams<{ listId: string; itemId?: string }>();
  const { getBundle, saveItem, removeItem, newItemDraft } = useLists();
  const bundle = getBundle(listId);
  const theme = useTheme();
  const router = useRouter();

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
  const editableColumns = bundle.columns.filter(
    (c) => c.kind === 'text' || c.kind === 'number' || c.kind === 'image' || c.kind === 'category',
  );

  function setValue(columnId: string, value: FieldValue) {
    setDraft({
      ...item,
      values: { ...item.values, [columnId]: value },
    });
  }

  async function onSave() {
    await saveItem(listId, draft ?? item);
    router.back();
  }

  function onDelete() {
    Alert.alert('Eliminar item', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await removeItem(listId, item.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing[4], gap: theme.spacing[3] }}>
      {editableColumns.map((column) => {
        const value = item.values[column.id];
        return (
          <View key={column.id} style={{ gap: theme.spacing[1] }}>
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
                    variant={value === option ? 'primary' : 'secondary'}
                    onPress={() => setValue(column.id, option)}
                  />
                ))}
              </View>
            ) : (
              <TextInput
                value={value == null ? '' : String(value)}
                keyboardType={column.kind === 'number' ? 'decimal-pad' : 'default'}
                onChangeText={(text) => {
                  if (column.kind === 'number') {
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

      <Button title="Guardar" onPress={() => void onSave()} />
      {mode === 'edit' ? <Button title="Eliminar" variant="danger" onPress={onDelete} /> : null}
      <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}
