import { View, type ViewProps, type ViewStyle } from 'react-native';

type RowProps = ViewProps & {
  gap?: number;
  align?: ViewStyle['alignItems'];
};

const Row = ({ gap = 0, align = 'center', style, ...props }: RowProps) => {
  return <View style={[{ flexDirection: 'row', alignItems: align, gap }, style]} {...props} />;
};

export default Row;
