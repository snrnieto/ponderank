import { StyleSheet, TextInput as RNTextInput, type TextInputProps, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type AppTextInputProps = TextInputProps & {
  style?: StyleProp<TextStyle>;
};

export function TextInput({ style, ...rest }: AppTextInputProps) {
  const theme = useTheme();

  return (
    <RNTextInput
      placeholderTextColor={theme.colors.textSecondary}
      style={[
        styles.base,
        {
          height: theme.components.inputHeight,
          borderRadius: theme.radius.md,
          borderWidth: 0,
          backgroundColor: theme.colors.surfaceMuted,
          color: theme.colors.text,
          paddingHorizontal: theme.spacing[4],
          fontSize: theme.typography.sizes.md,
          fontFamily: theme.typography.fontFamily.sans,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
});
