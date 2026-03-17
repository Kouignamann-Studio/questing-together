import { useState } from 'react';
import {
  Button,
  Divider,
  ParchmentInput,
  SectionLabel,
  Select,
  Stack,
  Typography,
} from '@/components';
import { colors } from '@/constants/colors';
import { playerNameById, roles } from '@/constants/constants';
import { useGame } from '@/contexts/GameContext';
import { getNameError } from '@/features/lobby/utils/getNameError';
import { getReadyText } from '@/features/lobby/utils/getReadyText';
import {
  getRoleOpacity,
  getRoleStatusText,
  getRoleTextureVariant,
} from '@/features/lobby/utils/getRoleDisplayProps';

const RoleOnboardingCard = () => {
  // Hooks
  const { roomConnection, localPlayerId, isHost, room } = useGame();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);

  // Derived state
  const { players, isBusy } = roomConnection;
  const targetPlayerCount = room?.target_player_count ?? 1;
  const localPlayer = players.find((p) => p.player_id === localPlayerId);
  const existingName = localPlayer?.display_name ?? '';
  const selectedRoleId = localPlayer?.role_id ?? null;
  const assignedCount = players.filter((p) => p.role_id).length;
  const allPicked =
    players.length === targetPlayerCount && players.every((p) => Boolean(p.role_id));
  const nameInput = draftName ?? existingName;
  const normalizedName = nameInput.trim();
  const nameError = localPlayerId ? getNameError(normalizedName, players, localPlayerId) : null;
  const isNameValid = nameError === null;
  const localNameSaved = Boolean(existingName);

  if (!localPlayerId) return null;

  // Handlers
  const handleNameChange = (text: string) => {
    setNameTouched(true);
    setDraftName(text);
  };

  const handleSaveName = () => {
    setNameTouched(true);
    if (!isNameValid) return;
    roomConnection.setDisplayName(normalizedName);
    setDraftName(null);
    setNameTouched(false);
  };

  const handleNameSubmit = () => {
    setNameTouched(true);
    if (!isNameValid || isBusy) return;
    roomConnection.setDisplayName(normalizedName);
    setDraftName(null);
    setNameTouched(false);
  };

  // Render
  return (
    <Stack gap={12} style={{ width: '100%', alignSelf: 'stretch' }}>
      <Typography variant="subheading">Pick Your Role</Typography>
      <Typography
        variant="bodySm"
        style={{ lineHeight: 18, textAlign: 'center', color: colors.textOverlayAccent }}
      >
        First come, first serve. Each role can be taken by one player only.
      </Typography>
      <Divider />

      {/* Name section */}
      <Stack gap={8}>
        <SectionLabel style={{ color: colors.textOverlayAccent }}>Choose your name</SectionLabel>
        <ParchmentInput
          value={nameInput}
          onChangeText={handleNameChange}
          onSubmitEditing={handleNameSubmit}
          autoCorrect={false}
          autoCapitalize="words"
          maxLength={20}
          editable={!isBusy}
          placeholder="No spaces (e.g. Arin)"
          selectTextOnFocus
        />
        {nameTouched && nameError ? (
          <Typography variant="captionSm" style={{ color: colors.errorInline }}>
            {nameError}
          </Typography>
        ) : null}
        <Button
          label={localNameSaved ? 'Update Name' : 'Save Name'}
          disabled={!isNameValid || isBusy}
          onPress={handleSaveName}
        />
        {localNameSaved ? (
          <Typography variant="captionSm" style={{ color: colors.success }}>
            Saved as {existingName}.
          </Typography>
        ) : null}
      </Stack>

      {/* Party size section */}
      <Stack gap={3}>
        <SectionLabel style={{ marginBottom: 2 }}>Party Size</SectionLabel>
        {isHost ? (
          <Select
            value={targetPlayerCount}
            options={[1, 2, 3].map((value) => ({
              value,
              label: `${value} ${value === 1 ? 'player' : 'players'}`,
              disabled: value < players.length || isBusy,
            }))}
            disabled={isBusy}
            onSelect={(c: number) => roomConnection.setTargetPlayerCount(c)}
          />
        ) : (
          <Typography variant="caption" style={{ color: colors.textAvatarNameParchment }}>
            Host selected {targetPlayerCount} {targetPlayerCount === 1 ? 'player' : 'players'}.
          </Typography>
        )}
      </Stack>

      {/* Role list */}
      <Stack gap={8}>
        {roles.map((role) => {
          const owner = players.find((p) => p.role_id === role.id);
          const isTakenByOther = Boolean(owner && owner.player_id !== localPlayerId);
          const isSelectedByLocal = selectedRoleId === role.id;
          const isDisabled = isTakenByOther || isBusy || !localNameSaved;

          return (
            <Button
              key={role.id}
              variant={getRoleTextureVariant(isSelectedByLocal)}
              disabled={isDisabled}
              onPress={() => roomConnection.selectRole(role.id)}
              style={{ opacity: getRoleOpacity(isTakenByOther, isDisabled) }}
            >
              <Stack direction="row" justify="space-between" align="center" gap={8}>
                <Typography variant="body" bold style={{ color: colors.textPrimary }}>
                  {role.label}
                </Typography>
                <Typography
                  variant="fine"
                  bold
                  uppercase
                  style={{ color: colors.textOnTextureSubtle }}
                >
                  {getRoleStatusText(isSelectedByLocal, owner)}
                </Typography>
              </Stack>
              <Typography variant="caption" style={{ color: colors.textOnTexture, lineHeight: 17 }}>
                {role.summary}
              </Typography>
            </Button>
          );
        })}
      </Stack>

      {/* Party assignment */}
      <Stack gap={3}>
        <SectionLabel style={{ marginBottom: 2 }}>Party Assignment</SectionLabel>
        {players.map((p) => (
          <Typography
            key={p.player_id}
            variant="caption"
            style={{ color: colors.textAvatarNameParchment }}
          >
            {p.display_name ?? playerNameById[p.player_id]}:{' '}
            {p.role_id ? p.role_id.toUpperCase() : 'waiting...'}
          </Typography>
        ))}
      </Stack>

      {/* Ready status */}
      <Typography
        variant="caption"
        style={{ textAlign: 'center', color: colors.textOverlayAccent }}
      >
        {getReadyText(
          localNameSaved,
          players.length < targetPlayerCount,
          allPicked,
          players.length,
          targetPlayerCount,
          assignedCount,
        )}
      </Typography>

      {/* Start / host hint */}
      {isHost ? (
        <Button
          label={isBusy ? 'Starting...' : 'Start Adventure'}
          variant="selected"
          disabled={!allPicked || isBusy}
          onPress={() => roomConnection.startAdventure()}
        />
      ) : (
        <Typography
          variant="caption"
          style={{ textAlign: 'center', color: colors.textOverlayAccent }}
        >
          Waiting for host to start once the party is ready.
        </Typography>
      )}
    </Stack>
  );
};

export default RoleOnboardingCard;
