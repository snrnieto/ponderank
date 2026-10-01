import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { confirmAction } from '@/components/ui/confirm-action';
import { PageShell } from '@/components/ui/page-shell';
import { PageTitle } from '@/components/ui/page-title';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import {
  buildImportTemplate,
  editableColumns,
  itemDisplayName,
  parseImportText,
  planImport,
  type ComparisonListBundle,
  type ImportMode,
  type ImportParseResult,
} from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { safeGoBack } from '@/navigation/safe-go-back';
import { setFlash } from '@/state/flash';
import { useLists } from '@/state/lists-context';

const MODES: ImportMode[] = ['upsert', 'append', 'replace'];

export default function BulkImportScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { getBundle } = useLists();
  const bundle = getBundle(listId);
  const theme = useTheme();
  const { t, locale } = useI18n();

  if (!bundle) {
    return (
      <View style={{ padding: theme.spacing[5], gap: theme.spacing[3] }}>
        <Text variant="title">{t.common.listNotFound}</Text>
        <Button title={t.common.goToLists} variant="accent" onPress={() => safeGoBack('/list' as Href)} />
      </View>
    );
  }
  // La clave regenera la plantilla solo cuando cambia la lista (p. ej. su esquema) o el idioma.
  return <BulkImport key={`${bundle.list.updatedAt}-${locale}`} bundle={bundle} />;
}

function BulkImport({ bundle }: { bundle: ComparisonListBundle }) {
  const listId = bundle.list.id;
  const { importItems } = useLists();
  const theme = useTheme();
  const { t, locale } = useI18n();
  const listHref = `/list/${listId}` as Href;

  const [input, setInput] = useState('');
  const [result, setResult] = useState<ImportParseResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [mode, setMode] = useState<ImportMode>('upsert');

  // La muestra aleatoria de la plantilla se genera una sola vez por montaje.
  const [template] = useState(() => buildImportTemplate(bundle.list.name, bundle.columns, Math.random, locale));
  const editable = editableColumns(bundle.columns);
  const card = { gap: theme.spacing[3], borderWidth: 1, borderColor: theme.colors.border };

  if (editable.length === 0) {
    return (
      <PageShell>
        <Surface padded elevation="none" style={card}>
          <Text variant="subtitle">{t.import.noColumnsTitle}</Text>
          <Text colorKey="textSecondary">{t.import.noColumnsBody}</Text>
        </Surface>
      </PageShell>
    );
  }

  const validRows = result?.ok ? result.rows.filter((r) => r.errors.length === 0) : [];
  const invalidRows = result?.ok ? result.rows.filter((r) => r.errors.length > 0) : [];
  // Vista previa de lo que hará la importación (sin guardar nada).
  const plan = result?.ok
    ? planImport(bundle.items, bundle.columns, validRows.map((r) => r.values), mode, (values) => ({
        id: '',
        listId,
        values,
        createdAt: '',
      }))
    : null;
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
      const done = await importItems(listId, validRows.map((r) => r.values), mode);
      const parts = [
        done.added ? t.import.flashAdded(done.added) : null,
        done.updated ? t.import.flashUpdated(done.updated) : null,
        done.removed ? t.import.flashRemoved(done.removed) : null,
      ].filter(Boolean);
      setFlash({ listId, message: t.import.flash(parts.join(', ')) });
      safeGoBack(listHref);
    } finally {
      setImporting(false);
    }
  }

  function onImport() {
    if (validRows.length === 0) return;
    if (mode === 'replace' && bundle.items.length > 0) {
      confirmAction(t.import.replaceTitle, t.import.replaceBody(bundle.items.length, validRows.length), () => void runImport(), {
        confirm: t.import.replaceConfirm,
        cancel: t.common.cancel,
      });
      return;
    }
    void runImport();
  }

  const importTitle = importing
    ? t.import.importing
    : mode === 'replace'
      ? t.import.replaceAll(validRows.length)
      : mode === 'upsert'
        ? t.import.apply(added, updated)
        : t.import.addN(validRows.length);

  const textAreaStyle = {
    height: undefined,
    minHeight: 200,
    paddingVertical: theme.spacing[3],
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.sizes.sm,
    textAlignVertical: 'top' as const,
  };

  return (
    <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ flexGrow: 1, width: '100%' }} keyboardShouldPersistTaps="handled">
      <PageShell maxWidth={860}>
        <PageTitle parts={[t.titles.import, bundle.list.name]} />

        <Surface padded elevation="none" style={card}>
          <Text variant="subtitle">{t.import.step1}</Text>
          <Text colorKey="textSecondary">{t.import.step1Body}</Text>
          <Text variant="caption" colorKey="accentInk">
            {t.import.columnsHint(editable.map((c) => c.name).join(' · '))}
          </Text>
          <TextInput value={template} editable={false} multiline style={[textAreaStyle, { minHeight: 140 }]} />
          <Button title={copied ? t.import.copied : t.import.copy} variant="secondary" style={{ alignSelf: 'flex-start' }} onPress={() => void onCopy()} />
        </Surface>

        <Surface padded elevation="none" style={card}>
          <Text variant="subtitle">{t.import.step2}</Text>
          <TextInput
            value={input}
            onChangeText={(text) => {
              setInput(text);
              setResult(null);
            }}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t.import.step2}
            placeholder={t.import.placeholder}
            style={textAreaStyle}
          />
          <View style={{ flexDirection: 'row', gap: theme.spacing[2], justifyContent: 'flex-end' }}>
            <Button title={t.common.cancel} variant="ghost" onPress={() => safeGoBack(listHref)} />
            <Button
              title={t.import.review}
              variant={result?.ok ? 'secondary' : 'accent'}
              disabled={input.trim() === ''}
              onPress={() => setResult(parseImportText(input, bundle.columns, locale))}
            />
          </View>
        </Surface>

        {result && !result.ok ? (
          <Surface padded elevation="none" style={[card, { borderColor: theme.colors.danger }]}>
            <Text colorKey="danger" accessibilityLiveRegion="polite">
              {result.error}
            </Text>
          </Surface>
        ) : null}

        {result?.ok ? (
          <Surface padded elevation="none" style={card}>
            <Text variant="subtitle">{t.import.step3}</Text>
            <View style={{ gap: theme.spacing[2] }}>
              <Text variant="label">{t.import.whatToDo(bundle.items.length)}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                {MODES.map((m) => (
                  <Button
                    key={m}
                    title={t.import.modes[m].label}
                    size="sm"
                    pill
                    accessibilityState={{ selected: mode === m }}
                    variant={mode === m ? 'primary' : 'secondary'}
                    onPress={() => setMode(m)}
                  />
                ))}
              </View>
              <Text variant="caption" colorKey="textSecondary">
                {t.import.modes[mode].description}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
              {added > 0 ? <Badge tone="success" label={t.import.newCount(added)} /> : null}
              {updated > 0 ? <Badge tone="info" label={t.import.updatedCount(updated)} /> : null}
              {removed > 0 ? <Badge tone="warning" label={t.import.removedCount(removed)} /> : null}
              {invalidRows.length > 0 ? <Badge tone="danger" label={t.import.errorCount(invalidRows.length)} /> : null}
            </View>

            {result.warnings.map((w) => (
              <Text key={w} variant="caption" colorKey="warning">
                {w}
              </Text>
            ))}

            {result.rows.map((row) => {
              const name = itemDisplayName({ id: '', listId, createdAt: '', values: row.values }, bundle.columns, t.common.untitled);
              const hasErrors = row.errors.length > 0;
              const action = actionByRow.get(row.index);
              return (
                <View
                  key={row.index}
                  style={{
                    gap: theme.spacing[1],
                    padding: theme.spacing[3],
                    borderRadius: theme.radius.sm,
                    backgroundColor: hasErrors ? theme.colors.dangerSoft : theme.colors.surfaceMuted,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[2] }}>
                    <Text variant="label" style={{ flexShrink: 1 }}>
                      {row.index}. {name}
                    </Text>
                    {action ? (
                      <Badge tone={action === 'update' ? 'info' : 'success'} label={action === 'update' ? t.import.updateTag : t.import.newTag} />
                    ) : null}
                  </View>
                  {row.errors.map((e) => (
                    <Text key={e} variant="caption" colorKey="danger">
                      {e}
                    </Text>
                  ))}
                  {row.warnings.map((w) => (
                    <Text key={w} variant="caption" colorKey="warning">
                      {w}
                    </Text>
                  ))}
                </View>
              );
            })}

            <Button
              title={importTitle}
              variant={mode === 'replace' ? 'danger' : 'accent'}
              style={{ alignSelf: 'flex-end' }}
              disabled={validRows.length === 0 || importing}
              onPress={onImport}
            />
          </Surface>
        ) : null}
      </PageShell>
    </ScrollView>
  );
}
