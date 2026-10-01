import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OperandPicker } from '@/components/schema/operand-picker';
import { WeightSummary } from '@/components/schema/weight-summary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { createId } from '@/data/lists-repository';
import {
  buildRankExample,
  CALC_OPS,
  canSaveSchema,
  formatCalcFormula,
  COLUMN_KIND_HELP,
  RANK_DIRECTION_HELP,
  RECOMMENDED_TARGET,
  TARGET_MODE_HELP,
  type CalcOp,
  type ListColumn,
  type ListGlobal,
  type RankDirection,
  type TargetMode,
  type ValueRef,
} from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { safeGoBack } from '@/navigation/safe-go-back';
import { useLists } from '@/state/lists-context';

/** A partir de este ancho la pantalla usa el layout de escritorio. */
const WIDE_BREAKPOINT = 900;
/** A partir de este ancho las columnas se muestran en 3 columnas de grid. */
const XL_BREAKPOINT = 1280;
const SCHEMA_MAX_WIDTH = 1400;

const KIND_LABELS: Record<ListColumn['kind'], string> = {
  text: 'texto',
  number: 'número',
  image: 'imagen',
  category: 'categoría',
  calculated: 'cálculo',
  criterion: 'criterio',
};

function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    const ok =
      typeof globalThis !== 'undefined' &&
      'confirm' in globalThis &&
      (globalThis as { confirm: (m: string) => boolean }).confirm(`${title}\n\n${message}`);
    if (ok) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function SchemaScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { getBundle, saveSchema } = useLists();
  const bundle = getBundle(listId);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const gridColumns = width >= XL_BREAKPOINT ? 3 : wide ? 2 : 1;

  const scrollRef = useRef<ScrollView>(null);

  const [globals, setGlobals] = useState<ListGlobal[]>([]);
  const [columns, setColumns] = useState<ListColumn[]>([]);
  const [focusedColumnId, setFocusedColumnId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!bundle) return;
    setGlobals(bundle.globals);
    setColumns(bundle.columns);
  }, [bundle]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!focusedColumnId) return;
    const timer = setTimeout(() => setFocusedColumnId(null), 2500);
    return () => clearTimeout(timer);
  }, [focusedColumnId]);

  const weightCheck = useMemo(() => canSaveSchema(columns), [columns]);

  function flashToast(message: string) {
    setToast(message);
  }

  function scrollToNewestColumn() {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 120);
    });
  }

  if (!bundle) {
    return (
      <View style={{ padding: theme.spacing[4] }}>
        <Text>Lista no encontrada</Text>
      </View>
    );
  }

  function addGlobal() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGlobals((prev) => [
      ...prev,
      {
        id: createId('g'),
        listId,
        key: `var_${prev.length + 1}`,
        label: `Variable ${prev.length + 1}`,
        value: 0,
      },
    ]);
    flashToast('Variable agregada');
  }

  function addColumn(kind: ListColumn['kind']) {
    const id = createId('c');
    const base: ListColumn = {
      id,
      listId,
      name: `Columna ${columns.length + 1}`,
      kind,
      order: columns.length,
    };
    if (kind === 'category') base.options = ['Opción A', 'Opción B'];
    if (kind === 'criterion') {
      base.rank = {
        weight: 0,
        direction: 'lowerBetter',
        target: { mode: 'min' },
      };
    }
    if (kind === 'calculated') {
      const numericSources = columns.filter(
        (c) => c.kind === 'number' || c.kind === 'calculated' || c.kind === 'criterion' || c.calc,
      );
      const left = numericSources[0]?.id ?? id;
      const right = numericSources[1]?.id ?? numericSources[0]?.id ?? id;
      base.calc = {
        op: 'div',
        leftRef: `column:${left}` as ValueRef,
        rightRef: `column:${right}` as ValueRef,
      };
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setColumns((prev) => [...prev, base]);
    setFocusedColumnId(id);
    flashToast(`Columna ${KIND_LABELS[kind]} agregada`);
    scrollToNewestColumn();
  }

  function removeColumn(columnId: string) {
    confirmAction(
      'Eliminar columna',
      'Se borrarán los datos de esa columna en todos los items.',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setColumns((prev) => prev.filter((c) => c.id !== columnId));
        flashToast('Columna eliminada');
      },
    );
  }

  async function onSave() {
    if (!weightCheck.ok && columns.some((c) => c.rank)) {
      Alert.alert(
        'Pesos incompletos',
        `Los pesos deben sumar 100%. Faltan ${weightCheck.remaining.toFixed(1)}.`,
      );
      return;
    }
    await saveSchema(listId, { globals, columns });
    safeGoBack(`/lists/${listId}` as Href);
  }

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setShowScrollTop(event.nativeEvent.contentOffset.y > 240);
  }

  function toggleRank(columnId: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId
          ? {
              ...c,
              rank: c.rank
                ? undefined
                : { weight: 0, direction: 'lowerBetter', target: { mode: 'min' } },
            }
          : c,
      ),
    );
  }

  function updateColumn(next: ListColumn) {
    setColumns((prev) => prev.map((c) => (c.id === next.id ? next : c)));
  }

  const footerPadding = theme.spacing[4] + insets.bottom;
  const footerApproxHeight = wide
    ? theme.components.buttonHeight + footerPadding + theme.spacing[3]
    : theme.components.buttonHeight * 2 + footerPadding + theme.spacing[3];
  const criteria = columns
    .filter((c) => c.rank)
    .map((c) => ({ id: c.id, name: c.name, weight: c.rank!.weight }));
  const rankedColumns = columns.filter((c) => c.rank);
  const dataColumns = columns.filter((c) => !c.rank);

  function renderColumnCard(column: ListColumn) {
    const focused = focusedColumnId === column.id;
    const canToggleRank = column.kind === 'number' || column.kind === 'calculated';
    return (
      <View
        key={column.id}
        style={{
          flexGrow: 1,
          gap: theme.spacing[3],
          padding: theme.spacing[3],
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          borderWidth: focused ? 2 : StyleSheet.hairlineWidth,
          borderColor: focused ? theme.colors.primary : theme.colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
          <TextInput
            style={{ flex: 1, minWidth: 0 }}
            value={column.name}
            onChangeText={(name) => updateColumn({ ...column, name })}
          />
          <Button
            title="Eliminar"
            size="sm"
            pill
            variant="ghost"
            onPress={() => removeColumn(column.id)}
          />
        </View>
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing[2] }}
        >
          <Badge label={COLUMN_KIND_HELP[column.kind].label} style={{ alignSelf: 'center' }} />
          {canToggleRank ? (
            <Button
              title={column.rank ? 'En el ranking ✓' : 'Usar en el ranking'}
              size="sm"
              pill
              variant={column.rank ? 'primary' : 'secondary'}
              onPress={() => toggleRank(column.id)}
            />
          ) : null}
        </View>

        {focused ? (
          <Text variant="caption" colorKey="primary">
            Nueva columna — personalízala aquí. {COLUMN_KIND_HELP[column.kind].description}
          </Text>
        ) : null}

        {column.kind === 'category' ? (
          <TextInput
            value={(column.options ?? []).join(', ')}
            onChangeText={(text) =>
              updateColumn({
                ...column,
                options: text
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Opciones separadas por coma"
          />
        ) : null}

        {column.calc ? (
          <CalcEditor
            column={column}
            columns={columns}
            globals={globals}
            defaultOpen={focused}
            onChange={updateColumn}
          />
        ) : null}

        {column.rank ? <RankEditor column={column} onChange={updateColumn} /> : null}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          padding: theme.spacing[4],
          paddingBottom: theme.spacing[4] + footerApproxHeight,
          alignItems: 'center',
        }}
      >
        <View style={{ width: '100%', maxWidth: SCHEMA_MAX_WIDTH, gap: theme.spacing[4] }}>
          <View
            style={{
              flexDirection: wide ? 'row' : 'column',
              gap: theme.spacing[4],
            }}
          >
            <View style={{ gap: theme.spacing[4], flex: wide ? 3 : undefined }}>
              <WeightSummary
                sum={weightCheck.sum}
                remaining={weightCheck.remaining}
                ok={weightCheck.ok}
                criteria={criteria}
              />
              <Surface padded elevation="sm" style={{ gap: theme.spacing[3] }}>
                <Text variant="overline">Agregar columna</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                  {(['text', 'number', 'image', 'category', 'calculated', 'criterion'] as const).map(
                    (kind) => (
                      <Button
                        key={kind}
                        title={`+ ${COLUMN_KIND_HELP[kind].label}`}
                        size="sm"
                        pill
                        variant="secondary"
                        onPress={() => addColumn(kind)}
                      />
                    ),
                  )}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    columnGap: theme.spacing[4],
                    rowGap: theme.spacing[1],
                  }}
                >
                  {(['number', 'category', 'calculated', 'text'] as const).map((kind) => (
                    <Text
                      key={kind}
                      variant="caption"
                      colorKey="textSecondary"
                      style={{ flexBasis: wide ? '45%' : '100%', flexGrow: 1 }}
                    >
                      <Text variant="caption">{COLUMN_KIND_HELP[kind].label}:</Text>{' '}
                      {COLUMN_KIND_HELP[kind].description}
                    </Text>
                  ))}
                </View>
              </Surface>
            </View>

            <Surface padded elevation="sm" style={{ gap: theme.spacing[2], flex: wide ? 2 : undefined }}>
              <Text variant="overline">Variables globales</Text>
              <Text variant="caption" colorKey="textSecondary">
                Valores fijos de la lista que usan las columnas de cálculo (ej. precio del kWh).
              </Text>
              {globals.map((g, index) => (
                <View key={g.id} style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
                  <TextInput
                    style={{ flex: 2, minWidth: 0 }}
                    value={g.label}
                    onChangeText={(label) =>
                      setGlobals((prev) => prev.map((x, i) => (i === index ? { ...x, label } : x)))
                    }
                    placeholder="Nombre"
                  />
                  <TextInput
                    style={{ flex: 1, minWidth: 0 }}
                    value={String(g.value)}
                    keyboardType="decimal-pad"
                    onChangeText={(text) =>
                      setGlobals((prev) =>
                        prev.map((x, i) => (i === index ? { ...x, value: Number(text) || 0 } : x)),
                      )
                    }
                    placeholder="Valor"
                  />
                </View>
              ))}
              <Button
                title="+ Agregar variable"
                variant="secondary"
                size="sm"
                pill
                style={{ alignSelf: 'flex-start' }}
                onPress={addGlobal}
              />
            </Surface>
          </View>

          <View style={{ gap: theme.spacing[3] }}>
            <SectionHeader
              title="Criterios del ranking"
              count={rankedColumns.length}
              hint="Columnas que suman puntos. Activa “Usar en el ranking” en una columna numérica para que aparezca aquí."
            />
            <Grid
              columns={Math.min(gridColumns, 2)}
              gap={theme.spacing[3]}
            >
              {rankedColumns.map(renderColumnCard)}
            </Grid>
          </View>

          <View style={{ gap: theme.spacing[3] }}>
            <SectionHeader
              title="Datos y cálculos"
              count={dataColumns.length}
              hint="Columnas informativas: se muestran en la tabla y alimentan los cálculos, pero no suman puntos."
            />
            <Grid
              columns={gridColumns}
              gap={theme.spacing[3]}
            >
              {dataColumns.map(renderColumnCard)}
            </Grid>
          </View>
        </View>
      </ScrollView>

      {toast ? (
        <View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              top: insets.top + theme.spacing[3],
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing[4],
              paddingVertical: theme.spacing[2],
            },
          ]}
        >
          <Text color={theme.colors.textInverse} variant="label">
            {toast}
          </Text>
        </View>
      ) : null}

      {showScrollTop ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver arriba"
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          style={[
            styles.scrollTop,
            {
              right: theme.spacing[4],
              bottom: footerApproxHeight + theme.spacing[3],
              width: theme.components.buttonHeight,
              height: theme.components.buttonHeight,
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <SymbolView
            name={{ ios: 'chevron.up', android: 'keyboard_arrow_up', web: 'keyboard_arrow_up' }}
            size={22}
            tintColor={theme.colors.textInverse}
          />
        </Pressable>
      ) : null}

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: theme.spacing[4],
            paddingTop: theme.spacing[3],
            paddingBottom: footerPadding,
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            alignItems: 'center',
          },
        ]}
      >
        <View
          style={{
            width: '100%',
            maxWidth: SCHEMA_MAX_WIDTH,
            flexDirection: wide ? 'row-reverse' : 'column',
            gap: theme.spacing[2],
          }}
        >
          <Button
            title="Guardar esquema"
            pill
            style={wide ? { minWidth: 220 } : undefined}
            onPress={() => void onSave()}
            disabled={!weightCheck.ok && columns.some((c) => c.rank)}
          />
          <Button
            title="Cancelar"
            variant="ghost"
            pill={wide}
            onPress={() => safeGoBack(`/lists/${listId}` as Href)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 20,
  },
  scrollTop: {
    position: 'absolute',
    zIndex: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  const [open, setOpen] = useState(defaultOpen);
  const calc = column.calc!;
  const meta = CALC_OPS.find((o) => o.op === calc.op) ?? CALC_OPS[0];

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
    const nextMeta = CALC_OPS.find((o) => o.op === op) ?? meta;
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
        <Text variant="overline">Fórmula</Text>
        <Text variant="label">= {formatCalcFormula(calc.op, refLabel(calc.leftRef), refLabel(calc.rightRef))}</Text>
      </View>
      <Button
        title={open ? 'Listo' : 'Editar cálculo'}
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
        <Text variant="label">Tipo de cálculo</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          {CALC_OPS.map((op) => (
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
          {meta.description} Ej.: {meta.example}
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
                ? 'Agrega una variable global arriba para usarla aquí.'
                : 'Agrega otra columna numérica/calculada para operar.'
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
                ? 'Agrega una variable global arriba para usarla aquí.'
                : 'Agrega otra columna numérica/calculada para operar.'
            }
            onChange={(rightRef) => onChange({ ...column, calc: { ...calc, rightRef } })}
          />
        </View>
      </View>
    </View>
  );
}

function RankEditor({
  column,
  onChange,
}: {
  column: ListColumn;
  onChange: (c: ListColumn) => void;
}) {
  const theme = useTheme();
  const rank = column.rank!;
  const example = buildRankExample(rank.direction, rank.target.mode);

  const controls = (
    <View style={{ gap: theme.spacing[3] }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[4] }}>
        <View style={{ gap: theme.spacing[1] }}>
          <Text variant="label">Peso</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
            <TextInput
              style={{ width: 88 }}
              value={String(rank.weight)}
              keyboardType="decimal-pad"
              onChangeText={(text) =>
                onChange({
                  ...column,
                  rank: { ...rank, weight: Number(text) || 0 },
                })
              }
              placeholder="0"
            />
            <Text colorKey="textSecondary">%</Text>
          </View>
        </View>

        <View style={{ gap: theme.spacing[1], flexShrink: 1 }}>
          <Text variant="label">¿Qué es mejor?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
            {(['lowerBetter', 'higherBetter'] as RankDirection[]).map((direction) => (
              <Button
                key={direction}
                title={RANK_DIRECTION_HELP[direction].label}
                size="sm"
                pill
                variant={rank.direction === direction ? 'primary' : 'secondary'}
                onPress={() =>
                  onChange({
                    ...column,
                    rank: {
                      ...rank,
                      direction,
                      // Si el objetivo era el recomendado, se mueve al recomendado del nuevo sentido.
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

      <View style={{ gap: theme.spacing[1] }}>
        <Text variant="label">Objetivo — el valor que saca 100 puntos</Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}
        >
          {(['min', 'max', 'avg', 'custom'] as TargetMode[]).map((mode) => (
            <Button
              key={mode}
              title={
                mode === RECOMMENDED_TARGET[rank.direction]
                  ? `${TARGET_MODE_HELP[mode].label} ★`
                  : TARGET_MODE_HELP[mode].label
              }
              size="sm"
              pill
              variant={rank.target.mode === mode ? 'primary' : 'secondary'}
              onPress={() =>
                onChange({
                  ...column,
                  rank: {
                    ...rank,
                    target: { mode, customValue: rank.target.customValue ?? 0 },
                  },
                })
              }
            />
          ))}
          {rank.target.mode === 'custom' ? (
            <TextInput
              style={{ width: 160 }}
              value={String(rank.target.customValue ?? 0)}
              keyboardType="decimal-pad"
              onChangeText={(text) =>
                onChange({
                  ...column,
                  rank: {
                    ...rank,
                    target: { mode: 'custom', customValue: Number(text) || 0 },
                  },
                })
              }
              placeholder="Valor objetivo"
            />
          ) : null}
        </View>
        <Text variant="caption" colorKey="textSecondary">
          {TARGET_MODE_HELP[rank.target.mode].description} ★ = recomendado para “
          {RANK_DIRECTION_HELP[rank.direction].label.toLowerCase()}”.
        </Text>
      </View>
    </View>
  );

  const exampleBox = (
    <View
      style={{
        gap: theme.spacing[1],
        padding: theme.spacing[3],
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      <Text variant="overline">Ejemplo con esta configuración</Text>
      <Text variant="caption">{example.summary}</Text>
      {example.rows.map((row) => (
        <View key={row.name} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="caption" colorKey="textSecondary">
            {row.name} · {row.value}
          </Text>
          <Text variant="caption">{row.score} pts</Text>
        </View>
      ))}
      {example.warning ? (
        <Text
          variant="caption"
          style={{
            marginTop: theme.spacing[1],
            padding: theme.spacing[2],
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.warningSoft,
          }}
        >
          ⚠ {example.warning}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View
      style={{
        gap: theme.spacing[4],
        paddingTop: theme.spacing[3],
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.border,
      }}
    >
      {controls}
      {exampleBox}
    </View>
  );
}

function SectionHeader({ title, count, hint }: { title: string; count: number; hint: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing[1], paddingHorizontal: theme.spacing[1] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
        <Text variant="subtitle">{title}</Text>
        <Badge label={String(count)} style={{ alignSelf: 'center' }} />
      </View>
      <Text variant="caption" colorKey="textSecondary">
        {hint}
      </Text>
    </View>
  );
}
