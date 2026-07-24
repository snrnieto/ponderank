import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: string;
  onChange: (uri: string) => void;
};

export function ImageFieldInput({ value, onChange }: Props) {
  const theme = useTheme();

  async function pickLocal() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería para adjuntar una imagen.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="https://… o URI local"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
        <Button title="Adjuntar imagen" size="sm" variant="secondary" onPress={() => void pickLocal()} />
        <Button title="Limpiar" size="sm" variant="ghost" onPress={() => onChange('')} />
      </View>
      {Platform.OS === 'web' ? null : null}
    </View>
  );
}
