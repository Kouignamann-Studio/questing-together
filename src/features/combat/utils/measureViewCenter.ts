import type { RefObject } from 'react';
import type { View } from 'react-native';

type Point = {
  x: number;
  y: number;
};

export function measureViewCenter(ref: RefObject<View | null>, onMeasured: (point: Point) => void) {
  ref.current?.measureInWindow((x, y, width, height) => {
    onMeasured({
      x: x + width / 2,
      y: y + height / 2,
    });
  });
}
