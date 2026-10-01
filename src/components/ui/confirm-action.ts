import { Alert, Platform } from 'react-native';

/**
 * Diálogo de confirmación que funciona en web y nativo.
 * En web `Alert.alert` con botones no hace nada, así que se usa `window.confirm`.
 */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Eliminar',
) {
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
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
