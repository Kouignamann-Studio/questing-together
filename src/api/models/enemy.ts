type Enemy = {
  id: string;
  roomId: string;
  position: number;
  name: string;
  level: number;
  hp: number;
  hpMax: number;
  attack: number;
  isDead: boolean;
};

export type { Enemy };
