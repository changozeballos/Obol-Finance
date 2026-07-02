import { View, Text } from 'react-native';
import Svg, {
  Path, Circle, Rect, Ellipse, Defs, RadialGradient, Stop, LinearGradient as SvgLinearGradient,
} from 'react-native-svg';

type PathId = 'fundamentos' | 'economia' | 'finanzas' | 'desmitificando';

const W = 390;

// ─── Fundamentos: sunrise money meadow ───────────────────────────────────────
function FundamentosScene() {
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Svg width={W} height={220} style={{ position: 'absolute', top: 0 }}>
        <Defs>
          <RadialGradient id="sun" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFBEB" />
            <Stop offset="100%" stopColor="#FCD34D" />
          </RadialGradient>
        </Defs>
        {/* Sun */}
        <Circle cx={60} cy={48} r={32} fill="url(#sun)" opacity={0.9} />
        <Circle cx={60} cy={48} r={40} fill="#FCD34D" opacity={0.15} />
        {/* Distant hills */}
        <Path d="M 0 180 Q 80 140 160 165 Q 230 150 300 168 Q 350 160 390 170 L 390 220 L 0 220 Z" fill="#BBF7D0" opacity={0.6} />
        <Path d="M 0 195 Q 100 175 200 185 Q 280 178 390 188 L 390 220 L 0 220 Z" fill="#86EFAC" opacity={0.7} />
        {/* Ground */}
        <Rect x={0} y={205} width={W} height={15} fill="#4ADE80" opacity={0.6} />
        {/* Clouds */}
        <Ellipse cx={280} cy={55} rx={45} ry={16} fill="white" opacity={0.75} />
        <Ellipse cx={300} cy={45} rx={32} ry={14} fill="white" opacity={0.75} />
        <Ellipse cx={320} cy={52} rx={38} ry={13} fill="white" opacity={0.6} />
        <Ellipse cx={140} cy={80} rx={36} ry={13} fill="white" opacity={0.55} />
        <Ellipse cx={158} cy={72} rx={24} ry={11} fill="white" opacity={0.55} />
      </Svg>
      {/* Floating coins */}
      <Text style={{ position: 'absolute', top: 90, left: 28, fontSize: 20, opacity: 0.35 }}>💰</Text>
      <Text style={{ position: 'absolute', top: 130, right: 30, fontSize: 16, opacity: 0.28 }}>🪙</Text>
      <Text style={{ position: 'absolute', top: 70, right: 60, fontSize: 18, opacity: 0.25 }}>💵</Text>
    </View>
  );
}

// ─── Economía: city market ────────────────────────────────────────────────────
function EconomiaScene() {
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Svg width={W} height={220} style={{ position: 'absolute', top: 0 }}>
        <Defs>
          <RadialGradient id="sunE" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#E0F2FE" />
            <Stop offset="100%" stopColor="#7DD3FC" />
          </RadialGradient>
        </Defs>
        {/* Sun */}
        <Circle cx={330} cy={44} r={26} fill="url(#sunE)" opacity={0.8} />
        {/* City skyline silhouette */}
        <Rect x={20}  y={155} width={28} height={65} rx={3} fill="#BFDBFE" opacity={0.55} />
        <Rect x={52}  y={135} width={22} height={85} rx={3} fill="#93C5FD" opacity={0.55} />
        <Rect x={78}  y={148} width={30} height={72} rx={3} fill="#BFDBFE" opacity={0.55} />
        <Rect x={112} y={125} width={18} height={95} rx={3} fill="#7DD3FC" opacity={0.6} />
        <Rect x={134} y={140} width={26} height={80} rx={3} fill="#BFDBFE" opacity={0.5} />
        <Rect x={260} y={130} width={24} height={90} rx={3} fill="#93C5FD" opacity={0.55} />
        <Rect x={288} y={150} width={32} height={70} rx={3} fill="#BFDBFE" opacity={0.5} />
        <Rect x={324} y={138} width={20} height={82} rx={3} fill="#7DD3FC" opacity={0.55} />
        <Rect x={348} y={155} width={28} height={65} rx={3} fill="#BFDBFE" opacity={0.45} />
        {/* Clouds */}
        <Ellipse cx={170} cy={55} rx={42} ry={15} fill="white" opacity={0.7} />
        <Ellipse cx={188} cy={46} rx={30} ry={13} fill="white" opacity={0.7} />
        {/* Ground */}
        <Rect x={0} y={208} width={W} height={12} fill="#93C5FD" opacity={0.5} />
      </Svg>
      <Text style={{ position: 'absolute', top: 100, left: 170, fontSize: 18, opacity: 0.3 }}>📈</Text>
      <Text style={{ position: 'absolute', top: 140, right: 50, fontSize: 16, opacity: 0.25 }}>⚖️</Text>
    </View>
  );
}

// ─── Finanzas: green savings valley ──────────────────────────────────────────
function FinanzasScene() {
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Svg width={W} height={220} style={{ position: 'absolute', top: 0 }}>
        <Defs>
          <RadialGradient id="sunF" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFBEB" />
            <Stop offset="100%" stopColor="#FCD34D" />
          </RadialGradient>
        </Defs>
        {/* Sun */}
        <Circle cx={58} cy={52} r={30} fill="url(#sunF)" opacity={0.9} />
        {/* Mountains back */}
        <Path d="M 0 170 L 70 95 L 140 170 Z"  fill="#5EEAD4" opacity={0.55} />
        <Path d="M 100 170 L 185 80 L 270 170 Z" fill="#2DD4BF" opacity={0.6} />
        <Path d="M 240 170 L 320 100 L 390 170 Z" fill="#5EEAD4" opacity={0.5} />
        {/* Snow caps */}
        <Path d="M 70 95 L 58 115 L 82 115 Z"  fill="white" opacity={0.75} />
        <Path d="M 185 80 L 170 105 L 200 105 Z" fill="white" opacity={0.75} />
        <Path d="M 320 100 L 308 120 L 332 120 Z" fill="white" opacity={0.7} />
        {/* Hills */}
        <Path d="M 0 185 Q 100 165 200 178 Q 290 168 390 180 L 390 220 L 0 220 Z" fill="#4ADE80" opacity={0.65} />
        {/* House */}
        <Rect x={290} y={172} width={44} height={30} rx={2} fill="#FEF3C7" opacity={0.8} />
        <Path d="M 285 174 L 312 155 L 339 174 Z" fill="#F87171" opacity={0.8} />
        {/* Trees */}
        <Circle cx={260} cy={188} r={10} fill="#16A34A" opacity={0.7} />
        <Rect x={257} y={195} width={6} height={10} fill="#92400E" opacity={0.5} />
        <Circle cx={340} cy={192} r={8} fill="#16A34A" opacity={0.65} />
        {/* Ground */}
        <Rect x={0} y={208} width={W} height={12} fill="#4ADE80" opacity={0.6} />
        {/* Clouds */}
        <Ellipse cx={270} cy={55} rx={38} ry={13} fill="white" opacity={0.65} />
        <Ellipse cx={290} cy={46} rx={26} ry={11} fill="white" opacity={0.65} />
      </Svg>
      <Text style={{ position: 'absolute', top: 110, left: 30, fontSize: 18, opacity: 0.3 }}>🐷</Text>
      <Text style={{ position: 'absolute', top: 75, right: 28, fontSize: 16, opacity: 0.25 }}>🌱</Text>
    </View>
  );
}

// ─── Desmitificando: night observatory ───────────────────────────────────────
function DesmitificandoScene() {
  const stars: { cx: number; cy: number; r: number }[] = [
    {cx:30,cy:25,r:1.5},{cx:80,cy:18,r:2},{cx:120,cy:35,r:1.2},{cx:160,cy:20,r:1.8},
    {cx:200,cy:30,r:1.4},{cx:250,cy:15,r:2.2},{cx:300,cy:28,r:1.6},{cx:340,cy:18,r:1.9},
    {cx:370,cy:35,r:1.3},{cx:55,cy:55,r:1.6},{cx:210,cy:55,r:1.3},{cx:360,cy:62,r:1.7},
    {cx:140,cy:70,r:1.1},{cx:280,cy:58,r:1.4},{cx:100,cy:90,r:1.2},
  ];
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Svg width={W} height={220} style={{ position: 'absolute', top: 0 }}>
        <Defs>
          <RadialGradient id="moon" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#F5F3FF" />
            <Stop offset="100%" stopColor="#A78BFA" />
          </RadialGradient>
        </Defs>
        {/* Moon glow */}
        <Circle cx={320} cy={48} r={42} fill="#A78BFA" opacity={0.12} />
        <Circle cx={320} cy={48} r={31} fill="url(#moon)" opacity={0.9} />
        {/* Stars */}
        {stars.map((s, i) => (
          <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={0.8} />
        ))}
        {/* Observatory dome */}
        <Rect x={155} y={168} width={60} height={40} rx={2} fill="#DDD6FE" opacity={0.5} />
        <Path d="M 155 168 Q 185 140 215 168 Z" fill="#C4B5FD" opacity={0.6} />
        {/* Rooftops */}
        <Rect x={60}  y={175} width={50} height={45} rx={2} fill="#EDE9FE" opacity={0.4} />
        <Path d="M 55 177 L 85 158 L 115 177 Z" fill="#C4B5FD" opacity={0.5} />
        <Rect x={275} y={178} width={44} height={42} rx={2} fill="#EDE9FE" opacity={0.4} />
        <Path d="M 271 180 L 297 162 L 323 180 Z" fill="#C4B5FD" opacity={0.5} />
        {/* Ground */}
        <Rect x={0} y={208} width={W} height={12} fill="#7C3AED" opacity={0.3} />
      </Svg>
      <Text style={{ position: 'absolute', top: 110, left: 30, fontSize: 18, opacity: 0.3 }}>🔍</Text>
      <Text style={{ position: 'absolute', top: 80, left: 180, fontSize: 16, opacity: 0.22 }}>💡</Text>
    </View>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function WorldScene({ pathId }: { pathId: PathId | string }) {
  if (pathId === 'fundamentos')    return <FundamentosScene />;
  if (pathId === 'economia')       return <EconomiaScene />;
  if (pathId === 'finanzas')       return <FinanzasScene />;
  if (pathId === 'desmitificando') return <DesmitificandoScene />;
  return <FundamentosScene />;
}
