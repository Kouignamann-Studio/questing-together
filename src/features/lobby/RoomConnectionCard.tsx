import { useState } from 'react';
import { Image, ImageBackground, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import homeScreenArt from '@/assets/images/T_HomeScreen_Art.png';
import homeScreenTitleFrame from '@/assets/images/T_HomeScreen_TitleFrame.png';
import { CodeInput } from '@/components/ui/CodeInput';
import { TexturedButton } from '@/components/ui/TexturedButton';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/colors';

type RoomConnectionCardProps = {
  isBusy: boolean;
  errorText: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
};

const RoomConnectionCard = ({
  isBusy,
  errorText,
  onCreateRoom,
  onJoinRoom,
}: RoomConnectionCardProps) => {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const canJoin = Boolean(joinCode.trim()) && !isBusy;
  const minHeight = Math.max(560, height + insets.top + insets.bottom);
  const titleTopOffset = Math.max(52, Math.round(height * 0.16));
  const actionsBottomOffset = Math.max(90, Math.round(height * 0.16));
  const titleFrameHeight = Math.max(106, Math.round(height * 0.15));
  const titleFrameWidth = width + 32;

  return (
    <ImageBackground
      source={homeScreenArt}
      resizeMode="cover"
      imageStyle={styles.screenArt}
      style={[styles.screen, { minHeight, marginTop: -insets.top, marginBottom: -insets.bottom }]}
    >
      <View style={styles.overlayTint} />
      <View style={styles.content}>
        <View style={[styles.topBlock, { marginTop: titleTopOffset }]}>
          <View
            style={[styles.titleFrameWrap, { height: titleFrameHeight, width: titleFrameWidth }]}
          >
            <Image source={homeScreenTitleFrame} style={styles.titleFrame} resizeMode="stretch" />
            <Typography variant="title">À L'AVENTURE, COMPAGNONS</Typography>
          </View>
          <Typography variant="subtitle">Multiplayer Text RPG Adventure</Typography>
        </View>

        <View style={[styles.bottomBlock, { marginBottom: actionsBottomOffset }]}>
          <TexturedButton
            disabled={isBusy}
            onPress={onCreateRoom}
            label={isBusy ? 'Working...' : 'Create Room'}
            hint="Start a new party"
          />

          <TexturedButton
            disabled={showJoinInput && !canJoin}
            onPress={() => {
              if (!showJoinInput) {
                setShowJoinInput(true);
                return;
              }
              if (!canJoin) return;
              onJoinRoom(joinCode);
            }}
            label={showJoinInput ? 'Join With Code' : 'Join Room'}
            hint={
              showJoinInput
                ? 'Confirm to enter the selected room'
                : 'Enter a room code to join your party'
            }
          />

          {showJoinInput ? (
            <CodeInput value={joinCode} onChangeText={(text) => setJoinCode(text.toUpperCase())} />
          ) : null}

          {errorText ? <Typography variant="error">{errorText}</Typography> : null}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  screenArt: {
    opacity: 1,
  },
  overlayTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backgroundOverlay,
  },
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    alignItems: 'center',
  },
  topBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  titleFrameWrap: {
    alignSelf: 'center',
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleFrame: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  bottomBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginTop: 'auto',
  },
});

export { RoomConnectionCard };
