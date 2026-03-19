import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import paperTexture from '@/assets/images/T_Background_Paper.png';
import {
  Alert,
  BottomSheet,
  Button,
  Portrait,
  Stack,
  TextField,
  TiledBackground,
  Typography,
} from '@/components';
import { colors } from '@/constants/colors';
import { roles } from '@/constants/constants';
import { useGame } from '@/contexts/GameContext';
import type { RoleId } from '@/types/player';
import { portraitByRole } from '@/utils/portraitByRole';

type CharacterPickerProps = {
  mode: 'create' | 'join';
  takenRoles: RoleId[];
  onConfirm: (name: string, roleId: RoleId) => void;
  onBack: () => void;
};

const CharacterPicker = ({ mode, takenRoles, onConfirm, onBack }: CharacterPickerProps) => {
  const insets = useSafeAreaInsets();
  const { roomConnection } = useGame();
  const { isBusy, roomError } = roomConnection;

  const [nameInput, setNameInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);

  const trimmedName = nameInput.replace(/\s+/g, '-').trim();
  const canConfirm = trimmedName.length > 0 && trimmedName.length <= 20 && selectedRole !== null;
  const focusedRole = selectedRole ? roles.find((r) => r.id === selectedRole) : null;
  const title = mode === 'create' ? 'Create Adventure' : 'Join Adventure';

  const getConfirmLabel = () => {
    if (isBusy) return mode === 'create' ? 'Creating...' : 'Joining...';
    return mode === 'create' ? 'Create Room' : 'Join Room';
  };

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm(trimmedName, selectedRole);
    }
  };

  return (
    <Stack flex={1} style={{ backgroundColor: colors.backgroundPaper }}>
      <TiledBackground source={paperTexture} />
      <ScrollView
        contentContainerStyle={{
          padding: 12,
          gap: 14,
          paddingTop: 12 + insets.top,
          paddingBottom: 120 + insets.bottom,
          flexGrow: 1,
        }}
      >
        <Stack
          gap={12}
          style={{
            paddingVertical: 14,
            backgroundColor: colors.backgroundCardTransparent,
          }}
        >
          <Typography variant="heading" style={{ color: colors.textOverlayHeading }}>
            {title}
          </Typography>

          <Typography variant="caption" bold style={{ color: colors.textAvatarNameParchment }}>
            Your Name
          </Typography>
          <TextField
            value={nameInput}
            onChangeText={(text) => setNameInput(text.replace(/\s+/g, '-'))}
            autoCorrect={false}
            autoCapitalize="words"
            maxLength={20}
            editable={!isBusy}
            placeholder="Your adventurer name"
          />

          <Typography variant="caption" bold style={{ color: colors.textAvatarNameParchment }}>
            Pick Your Class
          </Typography>
          <Stack direction="row" justify="space-evenly">
            {roles.map((role) => {
              const isTaken = takenRoles.includes(role.id);
              const isSelected = selectedRole === role.id;

              return (
                <Pressable
                  key={role.id}
                  disabled={isTaken || isBusy}
                  onPress={() => setSelectedRole(role.id)}
                  style={{ alignItems: 'center', opacity: isTaken ? 0.35 : 1 }}
                >
                  <Portrait
                    source={portraitByRole(role.id)}
                    size={80}
                    highlighted={isSelected || isTaken}
                    highlightColor={
                      isSelected
                        ? colors.success
                        : isTaken
                          ? colors.errorDark
                          : colors.textInputDark
                    }
                    name={role.label}
                    nameColor={
                      isSelected
                        ? colors.success
                        : isTaken
                          ? colors.errorDark
                          : colors.textInputDark
                    }
                    nameFontSize={12}
                  />
                  {isTaken ? (
                    <Typography
                      variant="fine"
                      bold
                      style={{ color: colors.errorDark, marginTop: 2 }}
                    >
                      Taken
                    </Typography>
                  ) : null}
                </Pressable>
              );
            })}
          </Stack>

          {focusedRole ? (
            <Alert variant="warning" title={focusedRole.label}>
              {focusedRole.summary}
            </Alert>
          ) : null}
        </Stack>
      </ScrollView>

      <BottomSheet size="xs">
        <Stack direction="row" gap={10}>
          <Stack flex={1}>
            <Button size="sm" variant="ghost" disabled={isBusy} onPress={onBack} label="Back" />
          </Stack>
          <Stack flex={1}>
            <Button
              size="sm"
              disabled={!canConfirm || isBusy}
              onPress={handleConfirm}
              label={getConfirmLabel()}
            />
          </Stack>
        </Stack>
        {roomError ? <Typography variant="error">{roomError}</Typography> : null}
      </BottomSheet>
    </Stack>
  );
};

export default CharacterPicker;
