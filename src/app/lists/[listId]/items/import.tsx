import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { confirmAction } from '@/components/ui/confirm-action';
import { PageShell } from '@/components/ui/page-shell';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import {
  buildImportTemplate,
  editableColumns,
  parseImportText,
  planImport,
  type ImportMode,
  type ImportParseResult,
} from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { safeGoBack } from '@/navigation/safe-go-back';
import { useLists } from '@/state/lists-context';

export default function BulkImportScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { getBundle, importItems } = useLists();
  const bundle = getBundle(listId);
  const theme = useTheme();
  const listHref = `/lists/${listId}` as Href;

  const [input, setInput] = useState('');
  const [result, setResult] = useState<ImportParseResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [mode, setMode] = useState<ImportMode>('upsert');

  const listName = bundle?.list.name;
  const columns = bundle?.columns;
  // Regenerate the random sample only when the schema changes, not on every render.
  const template = useMemo(
    () => (listName && columns ? buildImportTemplate(listName, columns) : ''),
    [listName, columns],
  );

  const items = bundle?.items;
  // Vista previa de lo que hará la importación (sin guardar nada).
  const plan = useMemo(() => {
    if (!items || !columns || !result?.ok) return null;
    const rows = result.rows.filter((r) => r.errors.length === 0).map((r) => r.values);
    return planImport(items, columns, rows, mode, (values) => ({ id: '', listId, values, createdAt: '' }));
  }, [items, columns, result, mode, listId]);

  if (!bundle) {
    return (
      <View style={{ padding: theme.spacing[4] }}>
        <Text>Lista no encontrada</Text>
      </View>
    );
  }

  if (editableColumns(bundle.columns).length === 0) {
    return (
      <PageShell>
        <Surface padded elevation="sm" style={{ gap: theme.spacing[3] }}>
          <Text variant="subtitle">Primero define el esquema</Text>
          <Text colorKey="textSecondary">
            La lista no tiene columnas para llenar. Agrega columnas en el esquema y vuelve aquí.
          </Text>
        </Surface>
      </PageShell>
    );
  }

  const validRows = result?.ok ? result.rows.filter((r) => r.errors.length === 0) : [];
  const invalidRows = result?.ok ? result.rows.filter((r) => r.errors.length > 0) : [];
  const actionByRow = new Map(validRows.map((row, i) => [row.index, plan?.actions[i]]));
  const added = plan?.added ?? 0;
  const updated = plan?.updated ?? 0;
  const removed = plan?.removed ?? 0;

  async function onCopy() {
    await Clipboard.setStringAsync(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function runImport() {
    setImporting(true);
    try {
      await importItems(
        listId,
        validRows.map((r) => r.values),
        mode,
      );
      safeGoBack(listHref);
    } finally {
      setImporting(false);
    }
  }

  function onImport() {
    if (validRows.length === 0) return;
    if (mode === 'replace' && bundle!.items.length > 0) {
      confirmAction(
        'Reemplazar todos los items',
        `Se borrarán los ${bundle!.items.length} items actuales y quedarán solo los ${validRows.length} importados.`,
        () => void runImport(),
        'Reemplazar',
      );
      return;
    }
    void runImport();
  }

  const importTitle = importing
    ? 'Importando…'
    : mode === 'replace'
      ? `Reemplazar todo con ${validRows.length} item${validRows.length === 1 ? '' : 's'}`
      : mode === 'upsert'
        ? `Aplicar: ${added} nuevo${added === 1 ? '' : 's'}, ${updated} actualizado${updated === 1 ? '' : 's'}`
        : `Importar ${validRows.length} item${validRows.length === 1 ? '' : 's'}`;

  const textAreaStyle = {
    height: undefined,
    minHeight: 220,
    paddingVertical: theme.spacing[3],
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.sizes.sm,
    textAlignVertical: 'top' as const,
  };

  return (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      contentContainerStyle={{ flexGrow: 1, width: '100%' }}
      keyboardShouldPersistTaps="handled"
    >
      <PageShell>
        <Surface padded elevation="sm" style={{ gap: theme.spacing[3] }}>
          <Text variant="overline">1 · Plantilla para la IA</Text>
          <Text colorKey="textSecondary">
            Copia esta plantilla, pégala en tu IA y agrega al final el listado de items que quieres
            importar. Las columnas calculadas no se incluyen: la app las calcula sola.
          </Text>
          <TextInput value={template} editable={false} multiline style={textAreaStyle} />
          <Button
            title={copied ? 'Copiada ✓' : 'Copiar plantilla'}
            variant="secondary"
            pill
            onPress={() => void onCopy()}
          />
        </Surface>

        <Surface padded elevation="sm" style={{ gap: theme.spacing[3] }}>
          <Text variant="overline">2 · Pega el JSON de la IA</Text>
          <TextInput
            value={input}
            onChangeText={(text) => {
              setInput(text);
              setResult(null);
            }}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            placeholder='[ { "Nombre": "...", ... } ]'
            style={textAreaStyle}
          />
          <Button
            title="Revisar"
            pill
            disabled={input.trim() === ''}
            onPress={() => setResult(parseImportText(input, bundle.columns))}
          />
        </Surface>

        {result && !result.ok ? (
          <Surface padded elevation="sm">
            <Text colorKey="danger">{result.error}</Text>
          </Surface>
        ) : null}

        {result?.ok ? (
          <Surface padded elevation="sm" style={{ gap: theme.spacing[3] }}>
            <Text variant="overline">3 · Vista previa</Text>
            <View style={{ gap: theme.spacing[2] }}>
              <Text variant="label">¿Qué hacer con los items que ya tiene la lista ({bundle.items.length})?</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                {IMPORT_MODES.map((m) => (
                  <Button
                    key={m.mode}
                    title={m.label}
                    size="sm"
                    pill
                    variant={mode === m.mode ? 'primary' : 'secondary'}
                    onPress={() => setMode(m.mode)}
                  />
                ))}
              </View>
              <Text variant="caption" colorKey="textSecondary">
                {IMPORT_MODES.find((m) => m.mode === mode)!.description}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
              {added > 0 ? (
                <Badge tone="success" label={`${added} nuevo${added === 1 ? '' : 's'}`} />
              ) : null}
              {updated > 0 ? (
                <Badge tone="info" label={`${updated} se actualiza${updated === 1 ? '' : 'n'}`} />
              ) : null}
              {removed > 0 ? (
                <Badge tone="warning" label={`${removed} se borra${removed === 1 ? '' : 'n'}`} />
              ) : null}
              {invalidRows.length > 0 ? (
                <Badge tone="danger" label={`${invalidRows.length} con errores (se omiten)`} />
              ) : null}
            </View>

            {result.warnings.map((w) => (
              <Text key={w} variant="caption" colorKey="warning">
                ⚠ {w}
              </Text>
            ))}

            {result.rows.map((row) => {
              const name = displayName(row.values, bundle.columns);
              const hasErrors = row.errors.length > 0;
              return (
                <View
                  key={row.index}
                  style={{
                    gap: theme.spacing[1],
                    padding: theme.spacing[3],
                    borderRadius: theme.radius.md,
                    backgroundColor: hasErrors ? theme.colors.dangerSoft : theme.colors.surfaceMuted,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: theme.spacing[2],
                    }}
                  >
                    <Text variant="label" style={{ flexShrink: 1 }}>
                      {row.index}. {name ?? 'Sin nombre'}
                    </Text>
                    {actionByRow.get(row.index) ? (
                      <Badge
                        tone={actionByRow.get(row.index) === 'update' ? 'info' : 'success'}
                        label={actionByRow.get(row.index) === 'update' ? 'Actualiza' : 'Nuevo'}
                      />
                    ) : null}
                  </View>
                  {row.errors.map((e) => (
                    <Text key={e} variant="caption" colorKey="danger">
                      ✕ {e}
                    </Text>
                  ))}
                  {row.warnings.map((w) => (
                    <Text key={w} variant="caption" colorKey="warning">
                      ⚠ {w}
                    </Text>
                  ))}
                </View>
              );
            })}

            <Button
              title={importTitle}
              pill
              variant={mode === 'replace' ? 'danger' : 'primary'}
              disabled={validRows.length === 0 || importing}
              onPress={onImport}
            />
          </Surface>
        ) : null}

        <Button title="Cancelar" variant="ghost" onPress={() => safeGoBack(listHref)} />
      </PageShell>
    </ScrollView>
  );
}

const IMPORT_MODES: { mode: ImportMode; label: string; description: string }[] = [
  {
    mode: 'upsert',
    label: 'Actualizar por nombre',
    description:
      'Si el Nombre coincide con un item existente se actualizan sus valores (los vacíos se conservan); si no existe, se agrega.',
  },
  {
    mode: 'append',
    label: 'Agregar',
    description: 'Todos se agregan como items nuevos, aunque se repitan nombres.',
  },
  {
    mode: 'replace',
    label: 'Reemplazar todo',
    description: 'Se borran todos los items actuales y quedan solo los importados.',
  },
];

function displayName(
  values: Record<string, unknown>,
  columns: { id: string; kind: string }[],
): string | null {
  const textColumn = columns.find((c) => c.kind === 'text');
  const value = textColumn ? values[textColumn.id] : null;
  return typeof value === 'string' && value !== '' ? value : null;
}
