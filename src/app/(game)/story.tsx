import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import paperTexture from '@/assets/images/T_Background_Paper.png';
import { Stack, TiledBackground } from '@/components';
import { colors } from '@/constants/colors';
import { DecisionProvider } from '@/contexts/DecisionContext';
import { useGame } from '@/contexts/GameContext';
import { PartyEmoteOverlay } from '@/features/emote/PartyEmoteOverlay';
import { StatusOverlay } from '@/features/party/StatusOverlay';
import StoryHeader from '@/features/story/components/header/StoryHeader';
import SceneFeedCard from '@/features/story/components/scene/SceneFeedCard';

export default function StoryScreen() {
  const game = useGame();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [resolvedHeaderHeight, setResolvedHeaderHeight] = useState(0);
  const roomStory = game.roomStory;

  if (!game.room || !game.isStoryView) {
    return <Redirect href="/(game)/lobby" />;
  }

  const headerHeight = Math.round(Math.min(160, Math.max(90, windowWidth * (100 / 420))));
  const headerVerticalPadding = 10;
  const headerMinHeight = headerHeight + insets.top;
  const storyHeaderInsetTop = Math.max(headerMinHeight, resolvedHeaderHeight) + 16;

  return (
    <DecisionProvider
      roomStory={roomStory}
      onResetStory={roomStory.resetStory}
      canResetStory={game.isHost}
      embedded
    >
      <Stack flex={1} style={{ backgroundColor: colors.backgroundPaper }}>
        <TiledBackground source={paperTexture} />
        <StoryHeader
          headerMinHeight={headerMinHeight}
          headerVerticalPadding={headerVerticalPadding}
          onLayout={(event) => {
            const measured = Math.ceil(event.nativeEvent.layout.height);
            setResolvedHeaderHeight((prev) => (Math.abs(prev - measured) > 1 ? measured : prev));
          }}
        />
        <ScrollView
          contentContainerStyle={{
            paddingTop: storyHeaderInsetTop,
            paddingBottom: 140 + insets.bottom,
            flexGrow: 1,
          }}
        >
          <Stack flex={1} style={{ width: '100%' }}>
            <SceneFeedCard />
          </Stack>
        </ScrollView>

        {game.showStatusPanel ? <StatusOverlay /> : null}
        {game.localPlayerId && game.localRole ? <PartyEmoteOverlay /> : null}
      </Stack>
    </DecisionProvider>
  );
}
