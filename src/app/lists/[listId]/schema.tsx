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
  UIManager,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OperandPicker } from '@/components/schema/operand-picker';
import { WeightSummary } from '@/components/schema/weight-summary';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { createId } from '@/data/lists-repository';
import {
  CALC_OPS,
  canSaveSchema,
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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
        target: { mode: 'custom', customValue: 0 },
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

  const footerPadding = theme.spacing[4] + insets.bottom;
  const footerApproxHeight = theme.components.buttonHeight * 2 + footerPadding + theme.spacing[3];

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
          gap: theme.spacing[4],
        }}
      >
        <WeightSummary sum={weightCheck.sum} remaining={weightCheck.remaining} ok={weightCheck.ok} />

        <Surface padded elevation="sm" style={{ gap: theme.spacing[2] }}>
          <Text variant="overline">Variables</Text>
          <Text variant="subtitle">Variables globales</Text>
          {globals.map((g, index) => (
            <View key={g.id} style={{ gap: theme.spacing[1] }}>
              <TextInput
                value={g.label}
                onChangeText={(label) =>
                  setGlobals((prev) => prev.map((x, i) => (i === index ? { ...x, label } : x)))
                }
                placeholder="Etiqueta"
              />
              <TextInput
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
          <Button title="Agregar variable" variant="secondary" pill onPress={addGlobal} />
        </Surface>

        <Surface padded elevation="sm" style={{ gap: theme.spacing[3] }}>
          <Text variant="overline">Esquema</Text>
          <Text variant="subtitle">Columnas</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
            {(['text', 'number', 'image', 'category', 'calculated', 'criterion'] as const).map(
              (kind) => (
                <Button
                  key={kind}
                  title={`+ ${kind}`}
                  size="sm"
                  pill
                  variant="secondary"
                  onPress={() => addColumn(kind)}
                />
              ),
            )}
          </View>

          {columns.map((column) => {
            const focused = focusedColumnId === column.id;
            return (
              <Surface
                key={column.id}
                tone="muted"
                padded
                elevation="none"
                style={{
                  gap: theme.spacing[2],
                  borderWidth: focused ? 2 : StyleSheet.hairlineWidth,
                  borderColor: focused ? theme.colors.primary : theme.colors.border,
                }}
              >
                {focused ? (
                  <Text variant="caption" colorKey="primary">
                    Nueva columna — personalízala aquí
                  </Text>
                ) : null}
                <TextInput
                  value={column.name}
                  onChangeText={(name) =>
                    setColumns((prev) =>
                      prev.map((c) => (c.id === column.id ? { ...c, name } : c)),
                    )
                  }
                />
                <Text variant="caption" colorKey="textSecondary">
                  Tipo: {column.kind}
                </Text>

                {column.kind === 'category' ? (
                  <TextInput
                    value={(column.options ?? []).join(', ')}
                    onChangeText={(text) =>
                      setColumns((prev) =>
                        prev.map((c) =>
                          c.id === column.id
                            ? {
                                ...c,
                                options: text
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              }
                            : c,
                        ),
                      )
                    }
                    placeholder="Opciones separadas por coma"
                  />
                ) : null}

                {column.calc ? (
                  <CalcEditor
                    column={column}
                    columns={columns}
                    globals={globals}
                    onChange={(next) =>
                      setColumns((prev) => prev.map((c) => (c.id === column.id ? next : c)))
                    }
                  />
                ) : null}

                {column.rank ? (
                  <RankEditor
                    column={column}
                    onChange={(next) =>
                      setColumns((prev) => prev.map((c) => (c.id === column.id ? next : c)))
                    }
                  />
                ) : null}

                <Button
                  title="Eliminar columna"
                  variant="danger"
                  size="sm"
                  pill
                  onPress={() => removeColumn(column.id)}
                />
              </Surface>
            );
          })}
        </Surface>
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
            gap: theme.spacing[2],
          },
        ]}
      >
        <Button
          title="Guardar esquema"
          pill
          onPress={() => void onSave()}
          disabled={!weightCheck.ok && columns.some((c) => c.rank)}
        />
        <Button title="Cancelar" variant="ghost" onPress={() => safeGoBack(`/lists/${listId}` as Href)} />
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
  onChange,
}: {
  column: ListColumn;
  columns: ListColumn[];
  globals: ListGlobal[];
  onChange: (c: ListColumn) => void;
}) {
  const theme = useTheme();
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

  return (
    <View style={{ gap: theme.spacing[3] }}>
      <Text variant="label">Tipo de cálculo</Text>
      <View style={{ gap: theme.spacing[2] }}>
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
        Ej.: {meta.example}
      </Text>

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

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text variant="label">Criterio de ranking</Text>
      <TextInput
        value={String(rank.weight)}
        keyboardType="decimal-pad"
        onChangeText={(text) =>
          onChange({
            ...column,
            rank: { ...rank, weight: Number(text) || 0 },
          })
        }
        placeholder="Peso %"
      />
      <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
        {(['lowerBetter', 'higherBetter'] as RankDirection[]).map((direction) => (
          <Button
            key={direction}
            title={direction === 'lowerBetter' ? 'Menor mejor' : 'Mayor mejor'}
            size="sm"
            pill
            variant={rank.direction === direction ? 'primary' : 'secondary'}
            onPress={() => onChange({ ...column, rank: { ...rank, direction } })}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
        {(['min', 'max', 'avg', 'custom'] as TargetMode[]).map((mode) => (
          <Button
            key={mode}
            title={mode}
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
      </View>
      {rank.target.mode === 'custom' ? (
        <TextInput
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
  );
}
