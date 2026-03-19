import type { RealtimeChannel } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Character } from '@/api/models/character';
import type { Enemy } from '@/api/models/enemy';
import { supabase } from '@/api/supabaseClient';
import type { PlayerId, RoleId } from '@/types/player';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { STORY_CONFIG } from '@/utils/storyConfig';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RoomRecord = {
  id: string;
  code: string;
  host_user_id: string;
  status: 'lobby' | 'in_progress' | 'finished';
  target_player_count: number;
};

type RoomPlayerRecord = {
  id: string;
  room_id: string;
  player_id: PlayerId;
  user_id: string;
  role_id: RoleId | null;
  display_name: string | null;
  is_connected: boolean;
};

type RoomPeek = {
  roomId: string;
  status: string;
  playerCount: number;
  takenRoles: RoleId[];
};

type RoomState = {
  room: RoomRecord;
  players: RoomPlayerRecord[];
  characters: Character[];
  enemies: Enemy[];
};

type UseRoomConnectionResult = {
  room: RoomRecord | null;
  players: RoomPlayerRecord[];
  characters: Character[];
  enemies: Enemy[];
  isBusy: boolean;
  roomError: string | null;
  createRoom: (displayName: string, roleId: RoleId) => Promise<void>;
  joinRoom: (code: string, displayName: string, roleId: RoleId) => Promise<void>;
  peekRoom: (code: string) => Promise<RoomPeek | null>;
  startAdventure: () => Promise<void>;
  cancelAdventure: () => Promise<void>;
  leaveRoom: () => Promise<void>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function withSchemaHint(message: string) {
  if (
    message.includes('create_room') ||
    message.includes('function') ||
    message.includes('permission')
  ) {
    return `${message}. Verify Supabase SQL was applied.`;
  }
  return message;
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

async function fetchRoomSnapshot(roomId: string): Promise<RoomRecord | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, code, host_user_id, status, target_player_count')
    .eq('id', roomId)
    .maybeSingle();

  if (error) throw error;
  return (data as RoomRecord | null) ?? null;
}

async function fetchRoomPlayers(roomId: string): Promise<RoomPlayerRecord[]> {
  const { data, error } = await supabase
    .from('room_players')
    .select('id, room_id, player_id, user_id, role_id, display_name, is_connected')
    .eq('room_id', roomId)
    .order('player_id', { ascending: true });

  if (error) throw error;
  return (data ?? []) as RoomPlayerRecord[];
}

async function fetchCharacters(roomId: string): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('id, room_id, player_id, name, level, gold, exp')
    .eq('room_id', roomId)
    .order('player_id', { ascending: true });

  if (error) return [];
  return (
    (data ?? []) as {
      id: string;
      room_id: string;
      player_id: PlayerId;
      name: string;
      level: number;
      gold: number;
      exp: number;
    }[]
  ).map((row) => ({
    id: row.id,
    roomId: row.room_id,
    playerId: row.player_id,
    name: row.name,
    level: row.level,
    gold: row.gold,
    exp: row.exp,
  }));
}

async function fetchEnemies(roomId: string): Promise<Enemy[]> {
  const { data, error } = await supabase
    .from('enemies')
    .select('id, room_id, position, name, level, hp, hp_max, attack, is_dead')
    .eq('room_id', roomId)
    .order('position', { ascending: true });

  if (error) return [];
  return (
    (data ?? []) as {
      id: string;
      room_id: string;
      position: number;
      name: string;
      level: number;
      hp: number;
      hp_max: number;
      attack: number;
      is_dead: boolean;
    }[]
  ).map((row) => ({
    id: row.id,
    roomId: row.room_id,
    position: row.position,
    name: row.name,
    level: row.level,
    hp: row.hp,
    hpMax: row.hp_max,
    attack: row.attack,
    isDead: row.is_dead,
  }));
}

async function fetchRoomState(roomId: string): Promise<RoomState | null> {
  const [room, players, characters, enemies] = await Promise.all([
    fetchRoomSnapshot(roomId),
    fetchRoomPlayers(roomId),
    fetchCharacters(roomId),
    fetchEnemies(roomId),
  ]);
  if (!room) return null;
  return { room, players, characters, enemies };
}

async function loadJoinedRoomIdForCurrentUser(): Promise<string | null> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('room_players')
    .select('room_id, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  const rows = (data ?? []) as { room_id: string | null }[];

  for (const row of rows) {
    const roomId = row.room_id;
    if (!roomId) continue;
    const room = await fetchRoomSnapshot(roomId);
    if (!room || room.status === 'finished') continue;
    return roomId;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const roomKeys = {
  currentRoomId: ['currentRoomId'] as const,
  roomState: (roomId: string | null) => ['roomState', roomId] as const,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRoomConnection(): UseRoomConnectionResult {
  const qc = useQueryClient();
  const [roomError, setRoomError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Step 1: Resolve current room ID for this user
  const { data: currentRoomId = null } = useQuery({
    queryKey: roomKeys.currentRoomId,
    queryFn: loadJoinedRoomIdForCurrentUser,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Step 2: Fetch full room state when we have a roomId
  const { data: roomState = null, isFetching: isRoomFetching } = useQuery({
    queryKey: roomKeys.roomState(currentRoomId),
    queryFn: () => (currentRoomId ? fetchRoomState(currentRoomId) : null),
    enabled: currentRoomId !== null,
    staleTime: 1000 * 10,
  });

  const room = roomState?.room ?? null;
  const players = roomState?.players ?? [];
  const characters = roomState?.characters ?? [];
  const enemies = roomState?.enemies ?? [];

  // Re-bootstrap on auth state change
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void qc.invalidateQueries({ queryKey: roomKeys.currentRoomId });
    });
    return () => subscription.unsubscribe();
  }, [qc]);

  // Realtime: invalidate room state on DB changes
  useEffect(() => {
    if (channelRef.current) {
      void supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!room?.id) return;

    const invalidate = () => {
      void qc.invalidateQueries({ queryKey: roomKeys.roomState(room.id) });
    };

    channelRef.current = supabase
      .channel(`room-sync-${room.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
        invalidate,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${room.id}` },
        invalidate,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'characters', filter: `room_id=eq.${room.id}` },
        invalidate,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enemies', filter: `room_id=eq.${room.id}` },
        invalidate,
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [qc, room?.id]);

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  const setRoomId = useCallback(
    (newRoomId: string) => {
      qc.setQueryData(roomKeys.currentRoomId, newRoomId);
      void qc.invalidateQueries({ queryKey: roomKeys.roomState(newRoomId) });
    },
    [qc],
  );

  const clearRoom = useCallback(() => {
    qc.setQueryData(roomKeys.currentRoomId, null);
    qc.removeQueries({ queryKey: roomKeys.roomState(currentRoomId) });
  }, [qc, currentRoomId]);

  const createRoomMutation = useMutation({
    mutationFn: async ({ displayName, roleId }: { displayName: string; roleId: RoleId }) => {
      const { data, error } = await supabase.rpc('create_room', {
        p_display_name: displayName,
        p_role_id: roleId,
      });
      if (error) throw error;
      const created = Array.isArray(data) ? data[0] : null;
      if (!created?.room_id) throw new Error('Room was not created');
      return created.room_id as string;
    },
    onSuccess: (roomId) => setRoomId(roomId),
    onError: (error) =>
      setRoomError(withSchemaHint(getErrorMessage(error, 'Failed to create room'))),
  });

  const joinRoomMutation = useMutation({
    mutationFn: async ({
      code,
      displayName,
      roleId,
    }: {
      code: string;
      displayName: string;
      roleId: RoleId;
    }) => {
      const normalizedCode = code.trim().toUpperCase();
      if (!normalizedCode) throw new Error('Enter a room code');
      const { data, error } = await supabase.rpc('join_room', {
        p_code: normalizedCode,
        p_display_name: displayName,
        p_role_id: roleId,
      });
      if (error) throw error;
      if (!data) throw new Error('Could not join room');
      return data as string;
    },
    onSuccess: (roomId) => setRoomId(roomId),
    onError: (error) => setRoomError(getErrorMessage(error, 'Failed to join room')),
  });

  const leaveRoomMutation = useMutation({
    mutationFn: async () => {
      if (!room?.id) return;
      const { error } = await supabase.rpc('leave_room', { p_room_id: room.id });
      if (error) throw error;
    },
    onSuccess: () => clearRoom(),
    onError: (error) => setRoomError(getErrorMessage(error, 'Failed to leave room')),
  });

  const startAdventureMutation = useMutation({
    mutationFn: async () => {
      if (!room?.id) throw new Error('No room');
      const { error } = await supabase.rpc('story_start_adventure', {
        p_room_id: room.id,
        p_start_scene_id: STORY_CONFIG.startSceneId,
      });
      if (error) throw error;
      // Seed enemies for this room
      await supabase.rpc('seed_enemies', { p_room_id: room.id });
    },
    onSuccess: () => {
      if (room?.id) {
        void qc.invalidateQueries({ queryKey: roomKeys.roomState(room.id) });
      }
    },
    onError: (error) => setRoomError(getErrorMessage(error, 'Failed to start adventure')),
  });

  const cancelAdventureMutation = useMutation({
    mutationFn: async () => {
      if (!room?.id) throw new Error('No room');
      const { error } = await supabase.rpc('cancel_adventure', {
        p_room_id: room.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      if (room?.id) {
        void qc.invalidateQueries({ queryKey: roomKeys.roomState(room.id) });
      }
    },
    onError: (error) => setRoomError(getErrorMessage(error, 'Failed to cancel adventure')),
  });

  // ---------------------------------------------------------------------------
  // peekRoom (standalone, no cache)
  // ---------------------------------------------------------------------------

  const peekRoom = useCallback(async (code: string): Promise<RoomPeek | null> => {
    setRoomError(null);
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setRoomError('Enter a room code');
      return null;
    }
    const { data, error } = await supabase.rpc('peek_room', { p_code: normalizedCode });
    if (error) {
      setRoomError(getErrorMessage(error, 'Failed to peek room'));
      return null;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      setRoomError('Room not found');
      return null;
    }
    return {
      roomId: row.room_id as string,
      status: row.room_status as string,
      playerCount: row.player_count as number,
      takenRoles: (row.taken_roles ?? []) as RoleId[],
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Stable wrappers
  // ---------------------------------------------------------------------------

  const createRoom = useCallback(
    async (displayName: string, roleId: RoleId) => {
      setRoomError(null);
      await createRoomMutation.mutateAsync({ displayName, roleId });
    },
    [createRoomMutation],
  );

  const joinRoom = useCallback(
    async (code: string, displayName: string, roleId: RoleId) => {
      setRoomError(null);
      await joinRoomMutation.mutateAsync({ code, displayName, roleId });
    },
    [joinRoomMutation],
  );

  const leaveRoom = useCallback(async () => {
    setRoomError(null);
    await leaveRoomMutation.mutateAsync();
  }, [leaveRoomMutation]);

  const startAdventure = useCallback(async () => {
    setRoomError(null);
    await startAdventureMutation.mutateAsync();
  }, [startAdventureMutation]);

  const cancelAdventure = useCallback(async () => {
    setRoomError(null);
    await cancelAdventureMutation.mutateAsync();
  }, [cancelAdventureMutation]);

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const isBusy =
    isRoomFetching ||
    createRoomMutation.isPending ||
    joinRoomMutation.isPending ||
    leaveRoomMutation.isPending ||
    startAdventureMutation.isPending ||
    cancelAdventureMutation.isPending;

  return useMemo(
    () => ({
      room,
      players,
      characters,
      enemies,
      isBusy,
      roomError,
      createRoom,
      joinRoom,
      peekRoom,
      startAdventure,
      cancelAdventure,
      leaveRoom,
    }),
    [
      room,
      players,
      characters,
      enemies,
      isBusy,
      roomError,
      createRoom,
      joinRoom,
      peekRoom,
      startAdventure,
      cancelAdventure,
      leaveRoom,
    ],
  );
}
