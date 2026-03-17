import { Image } from 'react-native';
import dividerLarge from '@/assets/images/T_Divider_L.png';

const Divider = () => (
  <Image
    source={dividerLarge}
    style={{ width: '72%', aspectRatio: 400 / 22, alignSelf: 'center' }}
    resizeMode="contain"
  />
);

export default Divider;
