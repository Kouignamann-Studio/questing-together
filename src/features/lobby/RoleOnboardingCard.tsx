import { useEffect, useMemo, useState } from 'react';
import {
  Divider,
  ParchmentInput,
  SectionLabel,
  Select,
  Stack,
  TexturedButton,
  Typography,
} from '@/components';
import { colors } from '@/constants/colors';
import { playerNameById, roles } from '@/constants/constants';
import { getNameError } from '@/features/lobby/utils/getNameError';
import { getReadyText } from '@/features/lobby/utils/getReadyText';
import {
  getRoleOpacity,
  getRoleStatusText,
  getRoleTextureVariant,
} from '@/features/lobby/utils/getRoleDisplayProps';
import type { PlayerId, RoleId } from '@/types/player';

type LobbyPlayer = {
  playerId: PlayerId;
  roleId: RoleId | null;
  displayName: string | null;
};

type RoleOnboardingCardProps = {
  localPlayerId: PlayerId;
  players: LobbyPlayer[];
  targetPlayerCount: number;
  isHost: boolean;
  isBusy: boolean;
  onSetDisplayName: (name: string) => void;
  onSelectRole: (roleId: RoleId) => void;
  onSetTargetPlayerCount: (targetPlayerCount: number) => void;
  onStartAdventure: () => void;
};

export function RoleOnboardingCard({
  localPlayerId,
  players,
  targetPlayerCount,
  isHost,
  isBusy,
  onSetDisplayName,
  onSelectRole,
  onSetTargetPlayerCount,
  onStartAdventure,
}: RoleOnboardingCardProps) {
  // --- Name state ---
  const existingName = players.find((p) => p.playerId === localPlayerId)?.displayName ?? '';
  const [nameInput, setNameInput] = useState(existingName || '');
  const [nameTouched, setNameTouched] = useState(false);
  useEffect(() => {
    setNameInput(existingName);
    setNameTouched(false);
  }, [existingName]);

  const normalizedName = useMemo(() => nameInput.trim(), [nameInput]);
  const nameError = useMemo(
    () => getNameError(normalizedName, players, localPlayerId),
    [normalizedName, players, localPlayerId],
  );
  const isNameValid = nameError === null;
  const localNameSaved = Boolean(existingName);

  // --- Role state ---
  const canPickRole = localNameSaved;
  const selectedRoleId = players.find((p) => p.playerId === localPlayerId)?.roleId ?? null;
  const assignedRoleIds = new Set(players.map((p) => p.roleId).filter(Boolean) as RoleId[]);
  const joinedPlayerCount = players.length;
  const waitingForPlayers = joinedPlayerCount < targetPlayerCount;
  const allPicked =
    joinedPlayerCount === targetPlayerCount && players.every((p) => Boolean(p.roleId));
  const partySizeOptions = [1, 2, 3].map((value) => ({
    value,
    label: `${value} ${value === 1 ? 'player' : 'players'}`,
    disabled: value < joinedPlayerCount || isBusy,
  }));

  const handleSaveName = () => {
    setNameTouched(true);
    if (!isNameValid) return;
    onSetDisplayName(normalizedName);
  };

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
          onChangeText={(text) => {
            setNameTouched(true);
            setNameInput(text);
          }}
          onSubmitEditing={() => {
            setNameTouched(true);
            if (!isNameValid || isBusy) return;
            onSetDisplayName(normalizedName);
          }}
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
        <TexturedButton
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
            options={partySizeOptions}
            disabled={isBusy}
            onSelect={onSetTargetPlayerCount}
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
          const owner = players.find((p) => p.roleId === role.id);
          const isTakenByOther = Boolean(owner && owner.playerId !== localPlayerId);
          const isSelectedByLocal = selectedRoleId === role.id;
          const isDisabled = isTakenByOther || isBusy || !canPickRole;

          return (
            <TexturedButton
              key={role.id}
              variant={getRoleTextureVariant(isSelectedByLocal)}
              disabled={isDisabled}
              onPress={() => onSelectRole(role.id)}
              style={{ opacity: getRoleOpacity(isTakenByOther, isDisabled) }}
            >
              <Stack direction="row" justify="space-between" align="center" gap={8}>
                <Typography variant="body" style={{ fontWeight: '700', color: colors.textPrimary }}>
                  {role.label}
                </Typography>
                <Typography
                  variant="fine"
                  style={{
                    color: colors.textOnTextureSubtle,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                >
                  {getRoleStatusText(isSelectedByLocal, owner)}
                </Typography>
              </Stack>
              <Typography variant="caption" style={{ color: colors.textOnTexture, lineHeight: 17 }}>
                {role.summary}
              </Typography>
            </TexturedButton>
          );
        })}
      </Stack>

      {/* Party assignment */}
      <Stack gap={3}>
        <SectionLabel style={{ marginBottom: 2 }}>Party Assignment</SectionLabel>
        {players.map((player) => (
          <Typography
            key={player.playerId}
            variant="caption"
            style={{ color: colors.textAvatarNameParchment }}
          >
            {player.displayName ?? playerNameById[player.playerId]}:{' '}
            {player.roleId ? player.roleId.toUpperCase() : 'waiting...'}
          </Typography>
        ))}
      </Stack>

      {/* Ready status */}
      <Typography
        variant="caption"
        style={{ textAlign: 'center', color: colors.textOverlayAccent }}
      >
        {getReadyText(
          canPickRole,
          waitingForPlayers,
          allPicked,
          joinedPlayerCount,
          targetPlayerCount,
          assignedRoleIds.size,
        )}
      </Typography>

      {/* Start / host hint */}
      {isHost ? (
        <TexturedButton
          label={isBusy ? 'Starting...' : 'Start Adventure'}
          variant="selected"
          disabled={!allPicked || isBusy}
          onPress={onStartAdventure}
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
}
