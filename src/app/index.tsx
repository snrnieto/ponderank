import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useTheme } from '@/hooks/use-theme';
import { useLists } from '@/state/lists-context';

export default function ListsIndexScreen() {
  const { bundles, loading, createList, deleteList } = useLists();
  const [name, setName] = useState('');
  const router = useRouter();
  const theme = useTheme();

  async function onCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const bundle = await createList(trimmed);
    setName('');
    router.push(`/lists/${bundle.list.id}` as Href);
  }

  function onDelete(listId: string, listName: string) {
    Alert.alert('Eliminar lista', `¿Eliminar “${listName}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void deleteList(listId);
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { padding: theme.spacing[4], gap: theme.spacing[4] }]}>
      <Surface padded>
        <Text variant="subtitle">Nueva lista</Text>
        <View style={{ height: theme.spacing[3] }} />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Computadores"
          onSubmitEditing={() => void onCreate()}
        />
        <View style={{ height: theme.spacing[3] }} />
        <Button title="Crear" onPress={() => void onCreate()} />
      </Surface>

      {loading ? (
        <Text colorKey="textSecondary">Cargando…</Text>
      ) : (
        <FlatList
          data={bundles}
          keyExtractor={(item) => item.list.id}
          contentContainerStyle={{ gap: theme.spacing[3] }}
          ListEmptyComponent={<Text colorKey="textSecondary">No hay listas todavía.</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/lists/${item.list.id}` as Href)}>
              <Surface padded>
                <Text variant="label">{item.list.name}</Text>
                <Text colorKey="textSecondary" variant="caption">
                  {item.items.length} items · {item.columns.length} columnas
                </Text>
                <View style={{ height: theme.spacing[2] }} />
                <Button
                  title="Eliminar"
                  variant="danger"
                  size="sm"
                  onPress={() => onDelete(item.list.id, item.list.name)}
                />
              </Surface>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
