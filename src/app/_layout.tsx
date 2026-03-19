import '../../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { queryClient } from '@/api/queryClient';
import AppLoader from '@/components/utils/AppLoader';
import { GameProvider } from '@/contexts/GameContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const RootLayout = () => {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AppLoader>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <GameProvider>
            <Slot />
            <StatusBar style="auto" />
          </GameProvider>
        </ThemeProvider>
      </AppLoader>
    </QueryClientProvider>
  );
};

export default RootLayout;
