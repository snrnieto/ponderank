import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useNavigation, type Href } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OperandPicker } from '@/components/schema/operand-picker';
import { WeightSummary } from '@/components/schema/weight-summary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { confirmAction } from '@/components/ui/confirm-action';
import { NumberInput } from '@/components/ui/number-input';
import { PageTitle } from '@/components/ui/page-title';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { createId } from '@/data/lists-repository';
import {
  buildRankExample,
  buildTargetPreview,
  canSaveSchema,
  collectColumnValues,
  columnKindHelp,
  getCalcOps,
  formatCalcFormula,
  normalizeWeights,
  rankDirectionHelp,
  RECOMMENDED_TARGET,
  targetModeHelp,
  type CalcOp,
  type ComparisonListBundle,
  type Item,
  type ListColumn,
  type ListGlobal,
  type RankDirection,
  type TargetMode,
  type ValueRef,
} from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { safeGoBack } from '@/navigation/safe-go-back';
import { setFlash } from '@/state/flash';
import { useLists } from '@/state/lists-context';

const MAX_WIDTH = 960;
const WIDE_BREAKPOINT = 720;

const ADDABLE_KINDS = ['number', 'text', 'category', 'calculated', 'image'] as const;

function Chevron({ open }: { open: boolean }) {
  const theme = useTheme();
  return (
    <SymbolView
      name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
      size={18}
      tintColor={theme.colors.textSecondary}
      style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}
    />
  );
}

/** Encabezado plegable accesible (fila completa tocable, mínimo 44 px). */
function Disclosure({
  open,
  onToggle,
  children,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  label: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded: open }}
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onToggle();
      }}
      style={({ hovered }) => ({
        minHeight: theme.components.touchTarget,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[3],
        paddingVertical: theme.spacing[2],
        borderRadius: theme.radius.sm,
        backgroundColor: hovered ? theme.colors.surfaceMuted : 'transparent',
      })}
    >
      <Chevron open={open} />
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing[2] }}>
        {children}
      </View>
    </Pressable>
  );
}

export default function SchemaScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { getBundle } = useLists();
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
  // La clave reinicia el editor si la lista guardada cambia (p. ej. después de guardar).
  return <SchemaEditor key={bundle.list.updatedAt} bundle={bundle} />;
}

function SchemaEditor({ bundle }: { bundle: ComparisonListBundle }) {
  const listId = bundle.list.id;
  const { saveSchema } = useLists();
  const theme = useTheme();
  const { t, locale } = useI18n();
  const kindHelp = columnKindHelp(locale);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;

  const scrollRef = useRef<ScrollView>(null);
  const [globals, setGlobals] = useState<ListGlobal[]>(bundle.globals);
  const [columns, setColumns] = useState<ListColumn[]>(bundle.columns);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [globalsOpen, setGlobalsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Permite salir sin preguntar justo después de guardar.
  const leaving = useRef(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const weightCheck = useMemo(() => canSaveSchema(columns), [columns]);
  const dirty =
    !saving &&
    (JSON.stringify(columns) !== JSON.stringify(bundle.columns) ||
      JSON.stringify(globals) !== JSON.stringify(bundle.globals));

  // Avisa antes de salir (flecha, gesto o «Cancelar») si hay cambios sin guardar.
  usePreventRemove(dirty, ({ data }) => {
    if (leaving.current) {
      navigation.dispatch(data.action);
      return;
    }
    confirmAction(t.common.discardTitle, t.schema.discardBody, () => navigation.dispatch(data.action), {
      confirm: t.common.discard,
      cancel: t.common.cancel,
    });
  });

  const listHref = `/list/${listId}` as Href;
  const criteria = columns.filter((c) => c.rank).sort((a, b) => b.rank!.weight - a.rank!.weight);
  const candidates = columns.filter(
    (c) => !c.rank && (c.kind === 'number' || c.kind === 'calculated' || c.kind === 'criterion'),
  );
  const items = bundle.items;

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateColumn(next: ListColumn) {
    setColumns((prev) => prev.map((c) => (c.id === next.id ? next : c)));
  }

  function addGlobal() {
    setGlobals((prev) => [
      ...prev,
      { id: createId('g'), listId, key: `var_${prev.length + 1}`, label: t.schema.newFixed(prev.length + 1), value: 0 },
    ]);
  }

  function addColumn(kind: (typeof ADDABLE_KINDS)[number]) {
    const id = createId('c');
    const base: ListColumn = {
      id,
      listId,
      name: kind === 'text' ? t.schema.defaultName : t.schema.newValue(columns.length + 1),
      kind,
      order: columns.length,
    };
    if (kind === 'category') base.options = [...t.schema.defaultOptions];
    if (kind === 'calculated') {
      const numeric = columns.filter((c) => c.kind === 'number' || c.kind === 'calculated' || c.kind === 'criterion');
      const left = numeric[0]?.id ?? id;
      const right = numeric[1]?.id ?? numeric[0]?.id ?? id;
      base.calc = { op: 'div', leftRef: `column:${left}` as ValueRef, rightRef: `column:${right}` as ValueRef };
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setColumns((prev) => [...prev, base]);
    setExpanded((prev) => new Set(prev).add(id));
    setToast(t.schema.added(kindHelp[kind].label));
  }

  function removeColumn(column: ListColumn) {
    confirmAction(
      t.schema.deleteTitle(column.name),
      t.schema.deleteBody,
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setColumns((prev) => prev.filter((c) => c.id !== column.id));
        setToast(t.schema.deleted(column.name));
      },
      { confirm: t.common.delete, cancel: t.common.cancel },
    );
  }

  function setCounts(column: ListColumn, counts: boolean) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateColumn({
      ...column,
      rank: counts
        ? {
            // El primer criterio arranca con el 100%; los siguientes en 0 hasta que ajustes.
            weight: criteria.length === 0 ? 100 : 0,
            direction: 'lowerBetter',
            target: { mode: 'min' },
          }
        : undefined,
    });
  }

  function balanceWeights() {
    const next = normalizeWeights(criteria.map((c) => ({ id: c.id, weight: c.rank!.weight })));
    const byId = new Map(next.map((n) => [n.id, n.weight]));
    setColumns((prev) =>
      prev.map((c) => (c.rank && byId.has(c.id) ? { ...c, rank: { ...c.rank, weight: byId.get(c.id)! } } : c)),
    );
  }

  async function onSave() {
    setSaving(true);
    try {
      await saveSchema(listId, { globals, columns });
      leaving.current = true;
      setFlash({ listId, message: t.schema.savedFlash });
      safeGoBack(listHref);
    } finally {
      setSaving(false);
    }
  }

  const canSave = weightCheck.ok || criteria.length === 0;
  const footerHeight = theme.components.buttonHeight + theme.spacing[4] * 2 + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <PageTitle parts={[t.titles.schema, bundle.list.name]} />
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: theme.spacing[4], paddingBottom: footerHeight + theme.spacing[5], alignItems: 'center' }}
      >
        <View style={{ width: '100%', maxWidth: MAX_WIDTH, gap: theme.spacing[5] }}>
          <Text colorKey="textSecondary" style={{ maxWidth: 640 }}>
            {t.schema.intro}
          </Text>

          {/* 1. Qué importa */}
          <Surface padded elevation="none" style={[styles.section, { borderColor: theme.colors.border, gap: theme.spacing[4] }]}>
            <View style={{ gap: theme.spacing[1] }}>
              <Text variant="subtitle">{t.schema.step1}</Text>
              <Text colorKey="textSecondary">{t.schema.step1Body}</Text>
            </View>

            {criteria.length > 0 ? (
              <WeightSummary
                sum={weightCheck.sum}
                remaining={weightCheck.remaining}
                ok={weightCheck.ok}
                criteria={criteria.map((c) => ({ id: c.id, name: c.name, weight: c.rank!.weight }))}
                onBalance={balanceWeights}
              />
            ) : (
              <Text colorKey="textSecondary">{t.schema.nothingCounts}</Text>
            )}

            {criteria.map((column) => (
              <CriterionEditor
                key={column.id}
                column={column}
                columns={columns}
                globals={globals}
                items={items}
                onChange={updateColumn}
                onRemove={() => setCounts(column, false)}
              />
            ))}

            {candidates.length > 0 ? (
              <View style={{ gap: theme.spacing[2], borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing[3] }}>
                <Text variant="label">{t.schema.alsoCounts}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                  {candidates.map((c) => (
                    <Button key={c.id} title={`+ ${c.name}`} size="sm" variant="secondary" onPress={() => setCounts(c, true)} />
                  ))}
                </View>
              </View>
            ) : null}
          </Surface>

          {/* 2. Datos de cada opción */}
          <Surface padded elevation="none" style={[styles.section, { borderColor: theme.colors.border, gap: theme.spacing[3] }]}>
            <View style={{ gap: theme.spacing[1] }}>
              <Text variant="subtitle">{t.schema.step2}</Text>
              <Text colorKey="textSecondary">{t.schema.step2Body}</Text>
            </View>

            {columns.map((column) => {
              const open = expanded.has(column.id);
              const canCount = column.kind === 'number' || column.kind === 'calculated' || column.kind === 'criterion';
              // Las columnas «criterio» antiguas se muestran como lo que son: número o dato calculado.
              const kindLabel = kindHelp[column.calc ? 'calculated' : column.kind === 'criterion' ? 'number' : column.kind];
              // La etiqueta de tipo sobra cuando repite el nombre (p. ej. «Imagen · Imagen»).
              const showKind = kindLabel.label.toLowerCase() !== column.name.trim().toLowerCase();
              return (
                <View key={column.id} style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing[1] }}>
                  <Disclosure open={open} onToggle={() => toggleExpanded(column.id)} label={t.schema.edit(column.name)}>
                    <Text variant="label" style={{ fontSize: theme.typography.sizes.md }}>
                      {column.name || t.common.untitled}
                    </Text>
                    {showKind ? <Badge label={kindLabel.label} /> : null}
                    {column.rank ? <Badge tone="warning" label={t.schema.counts(Math.round(column.rank.weight))} /> : null}
                    {column.calc ? (
                      <Text variant="caption" colorKey="textSecondary">
                        = {formatCalcFormula(
                          column.calc.op,
                          refName(column.calc.leftRef, columns, globals),
                          refName(column.calc.rightRef, columns, globals),
                        )}
                      </Text>
                    ) : null}
                  </Disclosure>

                  {open ? (
                    <View style={{ gap: theme.spacing[3], paddingLeft: wide ? theme.spacing[6] : 0, paddingBottom: theme.spacing[3] }}>
                      <View style={{ gap: theme.spacing[1] }}>
                        <Text variant="label">{t.schema.nameLabel}</Text>
                        <TextInput value={column.name} onChangeText={(name) => updateColumn({ ...column, name })} />
                        <Text variant="caption" colorKey="textSecondary">
                          {kindLabel.description}
                        </Text>
                      </View>

                      {column.kind === 'category' ? (
                        <View style={{ gap: theme.spacing[1] }}>
                          <Text variant="label">{t.schema.optionsLabel}</Text>
                          <TextInput
                            value={(column.options ?? []).join(', ')}
                            onChangeText={(text) =>
                              updateColumn({
                                ...column,
                                options: text.split(',').map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            placeholder={t.schema.optionsPlaceholder}
                          />
                          <Text variant="caption" colorKey="textSecondary">{t.schema.optionsHint}</Text>
                        </View>
                      ) : null}

                      {column.calc ? (
                        <CalcEditor column={column} columns={columns} globals={globals} defaultOpen onChange={updateColumn} />
                      ) : null}

                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                        {canCount ? (
                          <Button
                            title={column.rank ? t.schema.alreadyCounts : t.schema.useForDecision}
                            size="sm"
                            variant={column.rank ? 'secondary' : 'primary'}
                            onPress={() => setCounts(column, !column.rank)}
                          />
                        ) : null}
                        <Button title={t.schema.deleteValue} size="sm" variant="danger" onPress={() => removeColumn(column)} />
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}

            <View style={{ gap: theme.spacing[2], borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing[3] }}>
              <Text variant="label">{t.schema.addValue}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                {ADDABLE_KINDS.map((kind) => (
                  <Button key={kind} title={`+ ${kindHelp[kind].label}`} size="sm" variant="secondary" onPress={() => addColumn(kind)} />
                ))}
              </View>
            </View>
          </Surface>

          {/* 3. Datos fijos (avanzado) */}
          <Surface padded elevation="none" style={[styles.section, { borderColor: theme.colors.border, gap: theme.spacing[2] }]}>
            <Disclosure open={globalsOpen} onToggle={() => setGlobalsOpen((v) => !v)} label={t.schema.fixedTitle}>
              <Text variant="subtitle">{t.schema.fixedTitle}</Text>
              <Badge label={globals.length ? String(globals.length) : t.schema.optional} />
            </Disclosure>
            {globalsOpen ? (
              <View style={{ gap: theme.spacing[2] }}>
                <Text colorKey="textSecondary">{t.schema.fixedBody}</Text>
                {globals.map((g, index) => (
                  <View key={g.id} style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
                    <TextInput
                      style={{ flex: 2, minWidth: 0 }}
                      value={g.label}
                      accessibilityLabel={t.schema.fixedName}
                      onChangeText={(label) => setGlobals((prev) => prev.map((x, i) => (i === index ? { ...x, label } : x)))}
                      placeholder={t.schema.fixedNamePlaceholder}
                    />
                    <NumberInput
                      style={{ flex: 1, minWidth: 0 }}
                      value={g.value}
                      emptyValue={0}
                      accessibilityLabel={t.schema.fixedValue(g.label)}
                      onChangeValue={(v) => setGlobals((prev) => prev.map((x, i) => (i === index ? { ...x, value: v ?? 0 } : x)))}
                      placeholder={t.schema.fixedValuePlaceholder}
                    />
                  </View>
                ))}
                <Button title={t.schema.addFixed} variant="secondary" size="sm" style={{ alignSelf: 'flex-start' }} onPress={addGlobal} />
              </View>
            ) : null}
          </Surface>
        </View>
      </ScrollView>

      {toast ? (
        <View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,
            {
              bottom: footerHeight + theme.spacing[3],
              backgroundColor: theme.colors.text,
              borderRadius: theme.radius.sm,
              paddingHorizontal: theme.spacing[4],
              paddingVertical: theme.spacing[2],
            },
          ]}
        >
          <Text color={theme.colors.background} variant="label">
            {toast}
          </Text>
        </View>
      ) : null}

      <View
        style={{
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing[4],
          paddingTop: theme.spacing[3],
          paddingBottom: theme.spacing[3] + insets.bottom,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: MAX_WIDTH,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: theme.spacing[2],
          }}
        >
          {!canSave ? (
            <Text variant="caption" colorKey="warning" style={{ flex: 1, minWidth: 180 }}>
              {t.schema.mustSum}
            </Text>
          ) : null}
          <Button title={t.common.cancel} variant="ghost" onPress={() => safeGoBack(listHref)} />
          <Button title={t.schema.save} variant="accent" disabled={!canSave || saving} onPress={() => void onSave()} />
        </View>
      </View>
    </View>
  );
}

function refName(ref: ValueRef, columns: ListColumn[], globals: ListGlobal[]): string {
  const [kind, id] = ref.split(':');
  if (kind === 'global') return globals.find((g) => g.id === id)?.label ?? '?';
  return columns.find((c) => c.id === id)?.name ?? '?';
}

const styles = StyleSheet.create({
  section: { borderWidth: 1 },
  toast: { position: 'absolute', alignSelf: 'center', zIndex: 20 },
});

function CalcEditor({
  column,
  columns,
  globals,
  defaultOpen,
  onChange,
}: {
  column: ListColumn;
  columns: ListColumn[];
  globals: ListGlobal[];
  defaultOpen: boolean;
  onChange: (c: ListColumn) => void;
}) {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const ops = getCalcOps(locale);
  const [open, setOpen] = useState(defaultOpen);
  const calc = column.calc!;
  const meta = ops.find((o) => o.op === calc.op) ?? ops[0];

  const columnOptions = columns
    .filter((c) => c.id !== column.id)
    .filter((c) => c.kind === 'number' || c.kind === 'calculated' || c.kind === 'criterion' || c.calc)
    .map((c) => ({
      ref: `column:${c.id}` as ValueRef,
      label: c.name,
    }));

  const globalOptions = globals.map((g) => ({
    ref: `global:${g.id}` as ValueRef,
    label: g.label,
  }));

  const leftOptions = meta.left === 'global' ? globalOptions : columnOptions;
  const rightOptions = meta.right === 'global' ? globalOptions : columnOptions;

  function changeOp(op: CalcOp) {
    const nextMeta = ops.find((o) => o.op === op) ?? meta;
    const nextLeftPool = nextMeta.left === 'global' ? globalOptions : columnOptions;
    const nextRightPool = nextMeta.right === 'global' ? globalOptions : columnOptions;
    const leftRef =
      nextLeftPool.find((o) => o.ref === calc.leftRef)?.ref ??
      nextLeftPool[0]?.ref ??
      calc.leftRef;
    const rightRef =
      nextRightPool.find((o) => o.ref === calc.rightRef)?.ref ??
      nextRightPool[0]?.ref ??
      calc.rightRef;
    onChange({ ...column, calc: { op, leftRef, rightRef } });
  }

  const refLabel = (ref: ValueRef) =>
    [...columnOptions, ...globalOptions].find((o) => o.ref === ref)?.label ?? '?';

  const summary = (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing[2],
        padding: theme.spacing[3],
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      <View style={{ flexShrink: 1, gap: theme.spacing[1] }}>
        <Text variant="caption" colorKey="textSecondary">{t.schema.calc.howCalculated}</Text>
        <Text variant="label">= {formatCalcFormula(calc.op, refLabel(calc.leftRef), refLabel(calc.rightRef))}</Text>
      </View>
      <Button
        title={open ? t.schema.calc.done : t.schema.calc.edit}
        size="sm"
        pill
        variant={open ? 'primary' : 'secondary'}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setOpen((v) => !v);
        }}
      />
    </View>
  );

  if (!open) return summary;

  return (
    <View style={{ gap: theme.spacing[3] }}>
      {summary}
      <View style={{ gap: theme.spacing[2] }}>
        <Text variant="label">{t.schema.calc.operation}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          {ops.map((op) => (
            <Button
              key={op.op}
              title={op.label}
              size="sm"
              pill
              variant={calc.op === op.op ? 'primary' : 'secondary'}
              onPress={() => changeOp(op.op)}
            />
          ))}
        </View>
        <Text variant="caption" colorKey="textSecondary">
          {meta.description} {t.schema.calc.example} {meta.example}
        </Text>
      </View>

      <View style={{ gap: theme.spacing[4] }}>
        <View>
          <OperandPicker
            label={meta.leftLabel}
            value={calc.leftRef}
            options={leftOptions}
            emptyMessage={
              meta.left === 'global'
                ? t.schema.calc.needFixed
                : t.schema.calc.needNumber
            }
            onChange={(leftRef) => onChange({ ...column, calc: { ...calc, leftRef } })}
          />
        </View>
        <View>
          <OperandPicker
            label={meta.rightLabel}
            value={calc.rightRef}
            options={rightOptions}
            emptyMessage={
              meta.right === 'global'
                ? t.schema.calc.needFixed
                : t.schema.calc.needNumber
            }
            onChange={(rightRef) => onChange({ ...column, calc: { ...calc, rightRef } })}
          />
        </View>
      </View>
    </View>
  );
}


/**
 * Un criterio («algo que importa»): cuánto importa y si es mejor más alto o más bajo. El objetivo
 * («¿con qué lo comparo?») y el ejemplo con tus datos quedan en «Ajustes avanzados».
 */
function CriterionEditor({
  column,
  columns,
  globals,
  items,
  onChange,
  onRemove,
}: {
  column: ListColumn;
  columns: ListColumn[];
  globals: ListGlobal[];
  items: Item[];
  onChange: (c: ListColumn) => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const { t, n, locale } = useI18n();
  const targets = targetModeHelp(locale);
  const directions = rankDirectionHelp(locale);
  const formatNumber = (value: number) => n(value, Math.abs(value) >= 1000 ? 0 : 2);
  const [advanced, setAdvanced] = useState(false);
  const rank = column.rank!;
  const example = buildRankExample(rank.direction, rank.target.mode, locale);
  // Objetivos calculados con los datos reales de la lista (incluye cambios sin guardar).
  const preview = buildTargetPreview(collectColumnValues(items, columns, globals, column.id), rank.direction, rank.target);
  const recommended = RECOMMENDED_TARGET[rank.direction];

  function targetButtonLabel(mode: TargetMode): string {
    const base = targets[mode].label;
    const value =
      !preview || mode === 'custom' ? null : mode === 'min' ? preview.min.value : mode === 'max' ? preview.max.value : preview.avg;
    const withValue = value == null ? base : `${base} · ${formatNumber(value)}`;
    return mode === recommended ? `${withValue}${t.schema.criterion.recommended}` : withValue;
  }

  const targetDetail = !preview
    ? targets[rank.target.mode].description
    : rank.target.mode === 'min'
      ? t.schema.criterion.bestGets100(preview.min.name, formatNumber(preview.min.value))
      : rank.target.mode === 'max'
        ? t.schema.criterion.bestGets100(preview.max.name, formatNumber(preview.max.value))
        : rank.target.mode === 'avg'
          ? t.schema.criterion.avgGets100(preview.count, formatNumber(preview.avg))
          : targets.custom.description;

  const allMax = preview ? preview.rows.length > 1 && preview.rows.every((row) => row.score === 100) : false;
  const warning = preview
    ? allMax
      ? (example.warning ?? t.schema.criterion.allMax)
      : undefined
    : example.warning;

  return (
    <View style={{ gap: theme.spacing[3], borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing[3] }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: theme.spacing[4] }}>
        <View style={{ flexGrow: 1, flexBasis: 180, gap: theme.spacing[1] }}>
          <Text variant="label" style={{ fontSize: theme.typography.sizes.md }}>
            {column.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
            <NumberInput
              style={{ width: 88 }}
              value={rank.weight}
              emptyValue={0}
              accessibilityLabel={t.schema.criterion.importanceLabel(column.name)}
              onChangeValue={(v) => onChange({ ...column, rank: { ...rank, weight: v ?? 0 } })}
              placeholder="0"
            />
            <Text colorKey="textSecondary">{t.schema.criterion.importanceSuffix}</Text>
          </View>
        </View>

        <View style={{ gap: theme.spacing[1] }}>
          <Text variant="label">{t.schema.criterion.whichBetter}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
            {(['lowerBetter', 'higherBetter'] as RankDirection[]).map((direction) => (
              <Button
                key={direction}
                title={directions[direction].label}
                size="sm"
                pill
                variant={rank.direction === direction ? 'primary' : 'secondary'}
                onPress={() =>
                  onChange({
                    ...column,
                    rank: {
                      ...rank,
                      direction,
                      // Si estaba en el recomendado, pasa al recomendado del nuevo sentido.
                      target:
                        rank.target.mode === RECOMMENDED_TARGET[rank.direction]
                          ? { ...rank.target, mode: RECOMMENDED_TARGET[direction] }
                          : rank.target,
                    },
                  })
                }
              />
            ))}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[2] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: advanced }}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setAdvanced((v) => !v);
          }}
          style={{ minHeight: theme.components.touchTarget, flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}
        >
          <Chevron open={advanced} />
          <Text variant="label" colorKey="primary">
            {t.schema.criterion.advanced}
          </Text>
          {rank.target.mode !== recommended ? (
            <Text variant="caption" colorKey="textSecondary">
              · {targets[rank.target.mode].label.toLowerCase()}
            </Text>
          ) : null}
        </Pressable>
        <Button title={t.schema.criterion.remove} size="sm" variant="ghost" onPress={onRemove} />
      </View>

      {advanced ? (
        <View style={{ gap: theme.spacing[3], paddingLeft: theme.spacing[2] }}>
          <View style={{ gap: theme.spacing[1] }}>
            <Text variant="label">{t.schema.criterion.againstWhat}</Text>
            <Text variant="caption" colorKey="textSecondary">
              {t.schema.criterion.againstWhatBody}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing[2], marginTop: theme.spacing[1] }}>
              {(['min', 'max', 'avg', 'custom'] as TargetMode[]).map((mode) => (
                <Button
                  key={mode}
                  title={targetButtonLabel(mode)}
                  size="sm"
                  pill
                  variant={rank.target.mode === mode ? 'primary' : 'secondary'}
                  onPress={() => onChange({ ...column, rank: { ...rank, target: { mode, customValue: rank.target.customValue ?? 0 } } })}
                />
              ))}
              {rank.target.mode === 'custom' ? (
                <NumberInput
                  style={{ width: 160 }}
                  value={rank.target.customValue ?? 0}
                  emptyValue={0}
                  accessibilityLabel={t.schema.criterion.valueThatScores100}
                  onChangeValue={(v) => onChange({ ...column, rank: { ...rank, target: { mode: 'custom', customValue: v ?? 0 } } })}
                  placeholder={t.schema.criterion.valuePlaceholder}
                />
              ) : null}
            </View>
            <Text variant="caption" colorKey="textSecondary">
              {targetDetail}
            </Text>
          </View>

          <View style={{ gap: theme.spacing[1], padding: theme.spacing[3], borderRadius: theme.radius.sm, backgroundColor: theme.colors.surfaceMuted }}>
            <Text variant="label">
              {preview ? t.schema.criterion.previewTitle(preview.count) : t.schema.criterion.exampleTitle}
            </Text>
            {!preview ? (
              <Text variant="caption" colorKey="textSecondary">
                {example.summary}
              </Text>
            ) : null}
            {(preview ? preview.rows.map((row) => ({ ...row, value: formatNumber(row.value) })) : example.rows).map((row, i) => (
              <View key={`${row.name}-${i}`} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing[2] }}>
                <Text variant="caption" colorKey="textSecondary" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {row.name} · {row.value}
                </Text>
                <Text variant="caption">{t.schema.criterion.score(row.score)}</Text>
              </View>
            ))}
            {warning ? (
              <Text
                variant="caption"
                colorKey="warning"
                style={{ marginTop: theme.spacing[1], padding: theme.spacing[2], borderRadius: theme.radius.sm, backgroundColor: theme.colors.warningSoft }}
              >
                {warning}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
