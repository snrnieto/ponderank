import { Children, isValidElement, type ReactNode } from 'react';
import { View } from 'react-native';

type Props = {
  columns: number;
  gap: number;
  children: ReactNode;
};

/**
 * Grid por filas: cada fila toma el alto de su celda más alta y las demás se estiran
 * para igualarla. Los hijos deben usar `flexGrow: 1` para ocupar todo el alto de la celda.
 * Con 1 columna es una pila normal.
 */
export function Grid({ columns, gap, children }: Props) {
  const items = Children.toArray(children).filter(isValidElement);

  if (columns <= 1) {
    return <View style={{ gap }}>{items}</View>;
  }

  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }

  return (
    <View style={{ gap }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', alignItems: 'stretch', gap }}>
          {Array.from({ length: columns }, (_, c) => (
            // Las celdas vacías de la última fila mantienen el ancho de las demás.
            <View key={c} style={{ flex: 1, minWidth: 0 }}>
              {row[c] ?? null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
