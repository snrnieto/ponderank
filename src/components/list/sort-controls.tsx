import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { ComparisonListBundle } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import type { SortDir, SortKey } from '@/state/use-list-view';

type Props = {
  bundle: ComparisonListBundle;
  sortKey: SortKey;
  sortDir: SortDir;
  showPartials: boolean;
  onSortKey: (key: SortKey) => void;
  onSortDir: (dir: SortDir) => void;
};

/** Opciones de orden: nota final y nombre primero, luego lo que importa, luego el resto. */
export function SortControls({ bundle, sortKey, sortDir, showPartials, onSortKey, onSortDir }: Props) {
  const theme = useTheme();
  const { t } = useI18n();
  const nameColumn = bundle.columns.find((c) => c.kind === 'text');
  const criteria = bundle.columns.filter((c) => c.rank).sort((a, b) => b.rank!.weight - a.rank!.weight);
  const others = bundle.columns.filter((c) => !c.rank && c.kind !== 'image' && c.id !== nameColumn?.id);

  const options: { key: SortKey; label: string }[] = [
    { key: 'ranking', label: t.sort.finalScore },
    ...(nameColumn ? [{ key: 'name' as SortKey, label: t.sort.name }] : []),
    ...criteria.map((c) =>
      showPartials
        ? { key: `partial:${c.id}` as SortKey, label: t.sort.scoreOf(c.name) }
        : { key: `column:${c.id}` as SortKey, label: c.name },
    ),
    ...others.map((c) => ({ key: `column:${c.id}` as SortKey, label: c.name })),
  ];

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text variant="label">{t.sort.sortBy}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
        {options.map((opt) => (
          <Button
            key={opt.key}
            title={opt.label}
            size="sm"
            pill
            accessibilityState={{ selected: sortKey === opt.key }}
            variant={sortKey === opt.key ? 'primary' : 'secondary'}
            onPress={() => onSortKey(opt.key)}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
        {(['desc', 'asc'] as SortDir[]).map((dir) => (
          <Button
            key={dir}
            title={dir === 'desc' ? t.sort.desc : t.sort.asc}
            size="sm"
            variant={sortDir === dir ? 'primary' : 'ghost'}
            accessibilityState={{ selected: sortDir === dir }}
            onPress={() => onSortDir(dir)}
          />
        ))}
      </View>
    </View>
  );
}
