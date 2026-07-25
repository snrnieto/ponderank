import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: string;
  onChange: (uri: string) => void;
};

export function ImageFieldInput({ value, onChange }: Props) {
  const theme = useTheme();
  const [loadFailed, setLoadFailed] = useState(false);
  const uri = value.trim();
  const showPreview = uri.length > 0;

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
      setLoadFailed(false);
      onChange(result.assets[0].uri);
    }
  }

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <TextInput
        value={value}
        onChangeText={(text) => {
          setLoadFailed(false);
          onChange(text);
        }}
        placeholder="https://… o URI local"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {showPreview ? (
        <View
          style={{
            width: '100%',
            aspectRatio: 16 / 10,
            maxHeight: 220,
            borderRadius: theme.radius.md,
            overflow: 'hidden',
            backgroundColor: theme.colors.surfaceMuted,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loadFailed ? (
            <Text variant="caption" colorKey="textSecondary">
              No se pudo cargar la imagen
            </Text>
          ) : (
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              onError={() => setLoadFailed(true)}
            />
          )}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
        <Button
          title="Adjuntar imagen"
          size="sm"
          pill
          variant="secondary"
          onPress={() => void pickLocal()}
        />
        <Button
          title="Limpiar"
          size="sm"
          variant="ghost"
          onPress={() => {
            setLoadFailed(false);
            onChange('');
          }}
        />
      </View>
    </View>
  );
}
