import { Pressable } from 'react-native';
import Typography from '@/components/display/Typography';
import Stack from '@/components/layout/Stack';
import { colors } from '@/constants/colors';

type Tab<T extends string> = {
  id: T;
  label: string;
};

type TabBarProps<T extends string> = {
  tabs: Tab<T>[];
  activeTab: T;
  onChangeTab: (tab: T) => void;
};

function TabBar<T extends string>({ tabs, activeTab, onChangeTab }: TabBarProps<T>) {
  return (
    <Stack direction="row" gap={8}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChangeTab(tab.id)}
            style={{
              flex: 1,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isActive ? colors.tabActiveBorder : colors.tabBorder,
              backgroundColor: isActive ? colors.tabActiveBg : colors.tabBg,
              paddingVertical: 8,
              alignItems: 'center',
            }}
          >
            <Typography
              variant="caption"
              style={{
                fontWeight: '700',
                textTransform: 'uppercase',
                color: isActive ? colors.tabActiveText : colors.tabText,
              }}
            >
              {tab.label}
            </Typography>
          </Pressable>
        );
      })}
    </Stack>
  );
}

export default TabBar;
