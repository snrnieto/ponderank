import { SymbolView } from 'expo-symbols';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/ui/page-shell';
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
    <PageShell maxWidth={720} style={{ gap: theme.spacing[5] }}>
      <Surface padded elevation="md">
        <Text variant="overline">Nueva lista</Text>
        <View style={{ height: theme.spacing[2] }} />
        <Text variant="subtitle">Crear comparación</Text>
        <View style={{ height: theme.spacing[3] }} />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Computadores"
          onSubmitEditing={() => void onCreate()}
        />
        <View style={{ height: theme.spacing[3] }} />
        <Button title="Crear lista" pill onPress={() => void onCreate()} />
      </Surface>

      <View style={{ gap: theme.spacing[3], flex: 1 }}>
        <Text variant="overline">Tus listas</Text>
        {loading ? (
          <Text colorKey="textSecondary">Cargando…</Text>
        ) : (
          <FlatList
            data={bundles}
            keyExtractor={(item) => item.list.id}
            contentContainerStyle={{ gap: theme.spacing[3], paddingBottom: theme.spacing[6] }}
            ListEmptyComponent={
              <Surface padded elevation="sm">
                <Text colorKey="textSecondary">No hay listas todavía.</Text>
              </Surface>
            }
            renderItem={({ item }) => (
              <Surface padded elevation="sm">
                <View style={styles.row}>
                  <Pressable
                    style={{ flex: 1, gap: theme.spacing[1] }}
                    onPress={() => router.push(`/lists/${item.list.id}` as Href)}
                  >
                    <Text variant="label">{item.list.name}</Text>
                    <View style={{ flexDirection: 'row', gap: theme.spacing[2], flexWrap: 'wrap' }}>
                      <Badge label={`${item.items.length} items`} tone="primary" />
                      <Badge label={`${item.columns.length} columnas`} tone="info" />
                    </View>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar ${item.list.name}`}
                    hitSlop={theme.components.hitSlop}
                    onPress={() => onDelete(item.list.id, item.list.name)}
                    style={[
                      styles.iconBtn,
                      { backgroundColor: theme.colors.dangerSoft, borderRadius: theme.radius.md },
                    ]}
                  >
                    <SymbolView
                      name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                      size={18}
                      tintColor={theme.colors.danger}
                    />
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

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
