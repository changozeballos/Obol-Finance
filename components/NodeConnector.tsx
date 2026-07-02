import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { View } from 'react-native';

const W = 390;
const H = 42;

interface Props {
  fromOffset: number;
  toOffset: number;
  done: boolean;
  color: string;
  deep: string;
}

export function NodeConnector({ fromOffset, toOffset, done, color, deep }: Props) {
  const cx = W / 2;
  const x1 = cx + fromOffset;
  const x2 = cx + toOffset;
  const d = `M ${x1} 4 C ${x1} ${H * 0.55}, ${x2} ${H * 0.45}, ${x2} ${H - 4}`;
  const mx = (x1 + x2) / 2;
  const my = H / 2;

  return (
    <View style={{ marginVertical: -6 }}>
      <Svg width={W} height={H} style={{ overflow: 'visible' }}>
        {/* Cartoon outline */}
        <Path d={d} stroke="rgba(0,0,0,0.55)" strokeWidth={12} fill="none" strokeLinecap="round" />
        {/* Color fill */}
        <Path d={d} stroke={done ? color : `${color}55`} strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* Center dashes */}
        <Path
          d={d}
          stroke={done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)'}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 5"
        />
        {/* Midpoint star when done */}
        {done && (
          <>
            <Circle cx={mx} cy={my} r={7} fill={color} stroke="rgba(0,0,0,0.55)" strokeWidth={2.5} />
            <SvgText
              x={mx}
              y={my + 4}
              fontSize={9}
              fontWeight="900"
              textAnchor="middle"
              fill="#fff"
            >
              ★
            </SvgText>
          </>
        )}
      </Svg>
    </View>
  );
}
