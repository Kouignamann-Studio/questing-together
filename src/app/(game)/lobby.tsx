import { Redirect } from 'expo-router';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import paperTexture from '@/assets/images/T_Background_Paper.png';
import { Stack, TiledBackground, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import LobbyContent from '@/features/lobby/LobbyContent';
import LobbyErrors from '@/features/lobby/LobbyErrors';

const LobbyScreen = () => {
  const { room, isStoryView, roomStory } = useGame();
  const insets = useSafeAreaInsets();

  if (!room) return null;

  if (isStoryView) {
    return <Redirect href="/(game)/story" />;
  }

  if (!roomStory.isReady) {
    return (
      <Stack
        flex={1}
        align="center"
        justify="center"
        style={{ backgroundColor: colors.backgroundPaper }}
      >
        <TiledBackground source={paperTexture} />
        <Typography variant="body" style={{ color: colors.textSecondary }}>
          Syncing room state...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack flex={1} style={{ backgroundColor: colors.backgroundPaper }}>
      <TiledBackground source={paperTexture} />
      <ScrollView
        contentContainerStyle={{
          padding: 12,
          gap: 14,
          paddingTop: 12 + insets.top,
          paddingBottom: 96 + insets.bottom,
          flexGrow: 1,
        }}
      >
        <LobbyErrors />
        <LobbyContent />
      </ScrollView>
    </Stack>
  );
};

export default LobbyScreen;
