import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import paperTexture from '@/assets/images/T_Background_Paper.png';
import homeScreenArt from '@/assets/images/T_HomeScreen_Art.png';
import homeScreenTitleFrame from '@/assets/images/T_HomeScreen_TitleFrame.png';
import {
  ActionGroup,
  Alert,
  BackgroundArt,
  BottomSheet,
  Button,
  CodeInput,
  ContentContainer,
  FramedTitle,
  Portrait,
  Stack,
  TextField,
  TiledBackground,
  Typography,
} from '@/components';
import { colors } from '@/constants/colors';
import { roles } from '@/constants/constants';
import type { RoleId } from '@/types/player';
import { useHomeScreenLayout } from '@/utils/homeScreenLayout';
import { portraitByRole } from '@/utils/portraitByRole';

type RoomConnectionCardProps = {
  isBusy: boolean;
  errorText: string | null;
  onCreateRoom: (displayName: string, roleId: RoleId) => void;
  onJoinRoom: (code: string, displayName: string, roleId: RoleId) => void;
  onPeekRoom: (code: string) => Promise<{ takenRoles: RoleId[] } | null>;
};

type Mode = 'create' | 'join';
type Step = 'home' | 'join-code' | 'pick';

const RoomConnectionCard = ({
  isBusy,
  errorText,
  onCreateRoom,
  onJoinRoom,
  onPeekRoom,
}: RoomConnectionCardProps) => {
  const {
    minHeight,
    titleTopOffset,
    actionsBottomOffset,
    titleFrameHeight,
    titleFrameWidth,
    insets,
  } = useHomeScreenLayout();

  const [step, setStep] = useState<Step>('home');
  const [mode, setMode] = useState<Mode>('create');
  const [nameInput, setNameInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [takenRoles, setTakenRoles] = useState<RoleId[]>([]);

  const trimmedName = nameInput.replace(/\s+/g, '-').trim();
  const canConfirm = trimmedName.length > 0 && trimmedName.length <= 20 && selectedRole !== null;
  const isJoin = mode === 'join';

  const handleBack = () => {
    setStep('home');
    setNameInput('');
    setSelectedRole(null);
    setJoinCode('');
    setTakenRoles([]);
  };

  const handleCreate = () => {
    setMode('create');
    setTakenRoles([]);
    setStep('pick');
  };

  const handleJoin = () => {
    setMode('join');
    setStep('join-code');
  };

  const handlePeekAndContinue = async () => {
    const code = joinCode.trim();
    if (!code) return;
    const result = await onPeekRoom(code);
    if (result) {
      setTakenRoles(result.takenRoles);
      setStep('pick');
    }
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (isJoin) {
      onJoinRoom(joinCode, trimmedName, selectedRole);
    } else {
      onCreateRoom(trimmedName, selectedRole);
    }
  };

  const focusedRole = selectedRole ? roles.find((r) => r.id === selectedRole) : null;

  if (step === 'pick') {
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
              {isJoin ? 'Join Adventure' : 'Create Adventure'}
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
              <Button
                size="sm"
                variant="ghost"
                disabled={isBusy}
                onPress={handleBack}
                label="Back"
              />
            </Stack>
            <Stack flex={1}>
              <Button
                size="sm"
                disabled={!canConfirm || isBusy}
                onPress={handleConfirm}
                label={
                  isBusy
                    ? isJoin
                      ? 'Joining...'
                      : 'Creating...'
                    : isJoin
                      ? 'Join Room'
                      : 'Create Room'
                }
              />
            </Stack>
          </Stack>
          {errorText ? <Typography variant="error">{errorText}</Typography> : null}
        </BottomSheet>
      </Stack>
    );
  }

  return (
    <BackgroundArt
      source={homeScreenArt}
      style={{ minHeight, marginTop: -insets.top, marginBottom: -insets.bottom }}
    >
      <ContentContainer>
        <Stack gap={16} align="center" style={{ width: '100%', marginTop: titleTopOffset }}>
          <FramedTitle
            source={homeScreenTitleFrame}
            style={{ height: titleFrameHeight, width: titleFrameWidth, marginTop: 2 }}
          >
            <Stack style={{ marginBottom: -16 }}>
              <Typography variant="title">À L'AVENTURE,</Typography>
              <Typography variant="title">COMPAGNONS</Typography>
            </Stack>
          </FramedTitle>
          <Typography variant="subtitle">Multiplayer Text RPG Adventure</Typography>
        </Stack>

        <ActionGroup style={{ marginBottom: actionsBottomOffset }}>
          {step === 'home' ? (
            <>
              <Button
                size="lg"
                disabled={isBusy}
                onPress={handleCreate}
                label="Create Room"
                hint="Start a new party"
              />
              <Button
                size="lg"
                disabled={isBusy}
                onPress={handleJoin}
                label="Join Room"
                hint="Enter a room code to join your party"
              />
            </>
          ) : null}

          {step === 'join-code' ? (
            <>
              <CodeInput
                value={joinCode}
                onChangeText={(text) => setJoinCode(text.toUpperCase())}
              />
              <Button
                size="lg"
                disabled={!joinCode.trim() || isBusy}
                onPress={() => void handlePeekAndContinue()}
                label={isBusy ? 'Checking...' : 'Next'}
                hint="Check room availability"
              />
              <Button
                size="sm"
                variant="ghost"
                disabled={isBusy}
                onPress={handleBack}
                label="Back"
              />
            </>
          ) : null}

          {errorText ? <Typography variant="error">{errorText}</Typography> : null}
        </ActionGroup>
      </ContentContainer>
    </BackgroundArt>
  );
};

export default RoomConnectionCard;
