import { useState } from 'react';

import { TextInput, type AppTextInputProps } from '@/components/ui/text-input';
import { parseDecimalText, sanitizeDecimalText } from '@/domain';

type Props = Omit<AppTextInputProps, 'value' | 'onChangeText' | 'keyboardType'> & {
  value: number | null;
  onChangeValue: (value: number | null) => void;
  /** Valor que representa el campo vacío (p. ej. 0 para pesos). Por defecto null. */
  emptyValue?: number | null;
};

/**
 * Campo numérico que acepta decimales con punto o coma. Guarda el texto que se está escribiendo
 * (p. ej. "7." o "-") para no perder el separador, y solo emite números válidos.
 */
export function NumberInput({ value, onChangeValue, emptyValue = null, ...rest }: Props) {
  const [text, setText] = useState(() => (value == null ? '' : String(value)));
  // Si el valor cambió desde afuera (p. ej. al cargar el item), se muestra ese valor.
  const shown =
    (parseDecimalText(text) ?? emptyValue) === value ? text : value == null ? '' : String(value);

  return (
    <TextInput
      {...rest}
      value={shown}
      keyboardType="decimal-pad"
      inputMode="decimal"
      onChangeText={(raw) => {
        const next = sanitizeDecimalText(raw);
        setText(next);
        onChangeValue(parseDecimalText(next) ?? emptyValue);
      }}
    />
  );
}
