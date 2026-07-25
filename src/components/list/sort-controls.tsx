import { ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { ComparisonListBundle } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import type { SortDir, SortKey } from '@/state/use-list-view';

type Props = {
  bundle: ComparisonListBundle;
  sortKey: SortKey;
  sortDir: SortDir;
  showPartials: boolean;
  onSortKey: (key: SortKey) => void;
  onSortDir: (dir: SortDir) => void;
};

export function SortControls({
  bundle,
  sortKey,
  sortDir,
  showPartials,
  onSortKey,
  onSortDir,
}: Props) {
  const theme = useTheme();
  const options: { key: SortKey; label: string }[] = [
    { key: 'ranking', label: 'Ranking' },
    ...bundle.columns
      .filter((c) => c.kind !== 'image')
      .map((c) => ({ key: `column:${c.id}` as SortKey, label: c.name })),
  ];

  if (showPartials) {
    for (const c of bundle.columns.filter((col) => col.rank)) {
      options.push({ key: `partial:${c.id}`, label: `% ${c.name}` });
    }
  }

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text variant="label">Ordenar por</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
          {options.map((opt) => (
            <Button
              key={opt.key}
              title={opt.label}
              size="sm"
              variant={sortKey === opt.key ? 'primary' : 'secondary'}
              onPress={() => onSortKey(opt.key)}
            />
          ))}
        </View>
      </ScrollView>
      <Button
        title={sortDir === 'desc' ? 'Descendente' : 'Ascendente'}
        size="sm"
        variant="ghost"
        onPress={() => onSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
      />
    </View>
  );
}
