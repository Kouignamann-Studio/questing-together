import { Image, type ImageSourcePropType, View, type ViewStyle } from 'react-native';
import portraitFrame from '@/assets/images/T_PortraitFrame.png';
import Typography from '@/components/display/Typography';

type PortraitProps = {
  source: ImageSourcePropType;
  name?: string;
  size?: number;
  nameColor?: string;
  nameFontSize?: number;
  style?: ViewStyle;
};

const Portrait = ({
  source,
  name,
  size = 84,
  nameColor,
  nameFontSize = 16,
  style,
}: PortraitProps) => {
  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={portraitFrame} style={{ width: '100%', height: '100%' }} />
        <Image
          source={source}
          resizeMode="contain"
          style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2 }}
        />
      </View>
      {name ? (
        <Typography
          variant="body"
          style={{ marginTop: 4, fontSize: nameFontSize, fontWeight: '600', color: nameColor }}
        >
          {name}
        </Typography>
      ) : null}
    </View>
  );
};

export default Portrait;
