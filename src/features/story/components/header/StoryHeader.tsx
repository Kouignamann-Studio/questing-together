import { Image, type LayoutChangeEvent, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import headerTexture from '@/assets/images/T_Background_Header.png';
import headerBorderTexture from '@/assets/images/T_HeaderBorder.png';
import { Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import PartyTopBar from '@/features/party/PartyTopBar';

type StoryHeaderProps = {
  headerMinHeight: number;
  headerVerticalPadding: number;
  onLayout: (event: LayoutChangeEvent) => void;
};

const StoryHeader = ({ headerMinHeight, headerVerticalPadding, onLayout }: StoryHeaderProps) => {
  const insets = useSafeAreaInsets();
  const game = useGame();
  const roomStory = game.roomStory;

  return (
    <Stack
      onLayout={onLayout}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'visible',
        backgroundColor: colors.backgroundCombatCard,
        zIndex: 5,
        minHeight: headerMinHeight,
      }}
    >
      <Image
        source={headerTexture}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 1,
        }}
        resizeMode="stretch"
      />
      <Image
        source={headerBorderTexture}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -16,
          height: 18,
        }}
        resizeMode="stretch"
      />
      <Stack
        flex={1}
        justify="center"
        style={{
          paddingHorizontal: 18,
          paddingTop: headerVerticalPadding + insets.top,
          paddingBottom: headerVerticalPadding,
        }}
      >
        <Stack
          direction="row"
          justify="flex-end"
          style={{
            position: 'absolute',
            top: Math.max(4, insets.top),
            left: 0,
            right: 0,
            paddingLeft: 18 + insets.left,
            paddingRight: 18 + insets.right,
            zIndex: 2,
          }}
        >
          <Pressable
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.dotsButtonBg,
            }}
            onPress={() => game.setShowStatusPanel((v) => !v)}
          >
            <Typography
              variant="body"
              style={{
                color: colors.textParchment,
                fontWeight: '700',
                letterSpacing: 2,
                marginTop: -1,
              }}
            >
              ...
            </Typography>
            {game.hasTechAlert ? (
              <Stack
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: colors.errorDark,
                }}
              />
            ) : null}
          </Pressable>
        </Stack>
        <PartyTopBar
          partyHp={roomStory.partyHp}
          partyHpMax={roomStory.partyHpMax}
          rows={game.partyStatusRows}
          variant="overlay"
        />
      </Stack>
    </Stack>
  );
};

export default StoryHeader;
