import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

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
import { useLists } from '@/state/lists-context';

export default function SchemaScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { getBundle, saveSchema } = useLists();
  const bundle = getBundle(listId);
  const theme = useTheme();
  const router = useRouter();

  const [globals, setGlobals] = useState<ListGlobal[]>([]);
  const [columns, setColumns] = useState<ListColumn[]>([]);

  useEffect(() => {
    if (!bundle) return;
    setGlobals(bundle.globals);
    setColumns(bundle.columns);
  }, [bundle]);

  const weightCheck = useMemo(() => canSaveSchema(columns), [columns]);

  if (!bundle) {
    return (
      <View style={{ padding: theme.spacing[4] }}>
        <Text>Lista no encontrada</Text>
      </View>
    );
  }

  function addGlobal() {
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
      base.calc = {
        op: 'div',
        leftRef: `column:${columns[0]?.id ?? id}` as ValueRef,
        rightRef: `column:${columns[1]?.id ?? id}` as ValueRef,
      };
    }
    setColumns((prev) => [...prev, base]);
  }

  function removeColumn(columnId: string) {
    Alert.alert('Eliminar columna', 'Se borrarán los datos de esa columna en todos los items.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => setColumns((prev) => prev.filter((c) => c.id !== columnId)),
      },
    ]);
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
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing[4], gap: theme.spacing[4] }}>
      <WeightSummary sum={weightCheck.sum} remaining={weightCheck.remaining} ok={weightCheck.ok} />

      <Surface padded style={{ gap: theme.spacing[2] }}>
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
        <Button title="Agregar variable" variant="secondary" onPress={addGlobal} />
      </Surface>

      <Surface padded style={{ gap: theme.spacing[3] }}>
        <Text variant="subtitle">Columnas</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          {(['text', 'number', 'image', 'category', 'calculated', 'criterion'] as const).map(
            (kind) => (
              <Button
                key={kind}
                title={`+ ${kind}`}
                size="sm"
                variant="secondary"
                onPress={() => addColumn(kind)}
              />
            ),
          )}
        </View>

        {columns.map((column) => (
          <Surface key={column.id} tone="muted" padded style={{ gap: theme.spacing[2] }}>
            <TextInput
              value={column.name}
              onChangeText={(name) =>
                setColumns((prev) => prev.map((c) => (c.id === column.id ? { ...c, name } : c)))
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
              onPress={() => removeColumn(column.id)}
            />
          </Surface>
        ))}
      </Surface>

      <Button
        title="Guardar esquema"
        onPress={() => void onSave()}
        disabled={!weightCheck.ok && columns.some((c) => c.rank)}
      />
      <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}

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
  const meta = CALC_OPS.find((o) => o.op === calc.op);

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text variant="label">Cálculo</Text>
      <ScrollView horizontal>
        <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
          {CALC_OPS.map((op) => (
            <Button
              key={op.op}
              title={op.op}
              size="sm"
              variant={calc.op === op.op ? 'primary' : 'secondary'}
              onPress={() => onChange({ ...column, calc: { ...calc, op: op.op as CalcOp } })}
            />
          ))}
        </View>
      </ScrollView>
      {meta ? (
        <Text variant="caption" colorKey="textSecondary">
          {meta.label}: {meta.example}
        </Text>
      ) : null}
      <TextInput
        value={calc.leftRef}
        onChangeText={(leftRef) =>
          onChange({ ...column, calc: { ...calc, leftRef: leftRef as ValueRef } })
        }
        placeholder="leftRef ej. column:c_precio"
      />
      <TextInput
        value={calc.rightRef}
        onChangeText={(rightRef) =>
          onChange({ ...column, calc: { ...calc, rightRef: rightRef as ValueRef } })
        }
        placeholder="rightRef"
      />
      <Text variant="caption" colorKey="textSecondary">
        Columnas: {columns.map((c) => `${c.name}=column:${c.id}`).join(' · ')}
      </Text>
      <Text variant="caption" colorKey="textSecondary">
        Globals: {globals.map((g) => `${g.label}=global:${g.id}`).join(' · ')}
      </Text>
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
