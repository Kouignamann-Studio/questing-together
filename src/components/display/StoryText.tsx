import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, type StyleProp, Text, type TextStyle } from 'react-native';
import {
  splitIntoWordTokens,
  WORD_FADE_DURATION_MS,
  WORD_REVEAL_CADENCE_MS,
} from '@/hooks/useSceneFeedAnimation';

type StoryTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  animate: boolean;
  startDelay?: number;
};

const StoryText = ({ text, style, animate, startDelay = 0 }: StoryTextProps) => {
  const tokenMeta = useMemo(() => {
    let wordIndex = 0;

    return splitIntoWordTokens(text).map((token) => {
      if (/^\s+$/.test(token)) {
        return { token, isWhitespace: true as const, wordIndex: -1 };
      }

      const currentWordIndex = wordIndex;
      wordIndex += 1;
      return { token, isWhitespace: false as const, wordIndex: currentWordIndex };
    });
  }, [text]);

  const wordCount = useMemo(
    () => tokenMeta.reduce((count, part) => count + (part.isWhitespace ? 0 : 1), 0),
    [tokenMeta],
  );
  const revealDurationMs = useMemo(
    () => (wordCount > 0 ? (wordCount - 1) * WORD_REVEAL_CADENCE_MS + WORD_FADE_DURATION_MS : 0),
    [wordCount],
  );
  const revealClock = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (wordCount === 0) return;

    if (!animate) {
      revealClock.setValue(revealDurationMs);
      return;
    }

    revealClock.setValue(0);
    let revealAnimation: Animated.CompositeAnimation | null = null;

    const startTimer = setTimeout(() => {
      revealAnimation = Animated.timing(revealClock, {
        toValue: revealDurationMs,
        duration: revealDurationMs,
        easing: Easing.linear,
        useNativeDriver: false,
      });
      revealAnimation.start();
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      revealAnimation?.stop();
      revealClock.stopAnimation();
    };
  }, [animate, revealClock, revealDurationMs, startDelay, wordCount]);

  if (tokenMeta.length === 0 || wordCount === 0) {
    return <Text style={style}>{text}</Text>;
  }

  return (
    <Text style={style}>
      {tokenMeta.map((part, tokenIndex) => {
        if (part.isWhitespace) {
          return part.token;
        }

        const wordStartMs = part.wordIndex * WORD_REVEAL_CADENCE_MS;
        const opacity = revealClock.interpolate({
          inputRange: [wordStartMs, wordStartMs + WORD_FADE_DURATION_MS],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });

        return (
          <Animated.Text key={`${tokenIndex}-${part.token}`} style={{ opacity }}>
            {part.token}
          </Animated.Text>
        );
      })}
    </Text>
  );
};

export default StoryText;
