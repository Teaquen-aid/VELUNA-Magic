
export enum MagicSystem {
  ELEMENTAL = '元素系', // Elemental
  CAUSAL = '因果系',    // Causal
  CREATION = '創造系',  // Creation
  DAWN = '黎明系',      // Dawn/Origin
  OTHER = 'その他'      // Other
}

export const SYSTEM_ATTRIBUTES: Record<MagicSystem, string[]> = {
  [MagicSystem.ELEMENTAL]: [
    '火属性', '水属性', '風属性', '土属性',
    '光属性', '闇属性',
    '雷属性', '氷属性', '音属性',
    '凍氷域', '雷霆域', '煉獄域'
  ],
  [MagicSystem.CAUSAL]: ['律界域', '時空域', '因果域'],
  [MagicSystem.CREATION]: ['念理域', '夢界域', '心象域', '創生域'],
  [MagicSystem.DAWN]: ['灼界域', '星焔域', '黎氷域'],
  [MagicSystem.OTHER]: ['自然属性', '神聖魔法', '生活魔法']
};

export interface SpellLore {
  magicType: string; // e.g., Attack, Defense, Ritual
  medium: string; // e.g., Wand, Chant, Blood
  condition: string; // e.g., Line of sight, Full moon
  cost: string; // e.g., Mana, Life force, Sanity
  theory: string; // e.g., "E8 Subgroup Projection", "Causal Collapse"
  origin: string; // Historical origin
  famousUser: string; // A fictional famous user
}

export interface CasterStatus {
  hp: number; // Current HP
  maxHp: number; // Max HP
  heartRate: number; // bpm
  bodyTemp: number; // Celsius
  bloodPressure: string; // mmHg
  respiration: number; // bpm
  spO2: number; // %
  consciousnessLevel: string; // GCS or descriptive
  emotionIndex: number; // 0-100 (affecting output)
}

export type WeatherType = 'SUNNY' | 'RAIN' | 'CLOUDY';

export interface SpellEnvironment {
  location: {
    lat: number;
    lng: number;
    alt: number; // meters
  };
  temperature: number; // Celsius
  humidity: number; // %
  wDensity: number; // Ambient W density
  weather: WeatherType; // Added Weather Type
}

export interface DivineProtectionLore {
    deity: string;
    symbol: string;
    alias: string;
    conditions: {
        grant: string;
        maintain: string;
        loss: string;
    };
    effects: {
        direct: string;
        indirect: string;
        constraints: string;
    };
    hierarchy: {
        lower?: string;
        middle?: string;
        upper?: string;
    };
    role: string;
}

export interface DivineProtectionDef {
    id: string;
    name: string;
    category: string;
    description: string;
    compatibleAttributes: string[];
    powerMultiplier: number; // Configurable numeric multiplier
    lore: DivineProtectionLore; // Detailed Lore Data
}

export interface ToolDef {
    id: string;
    name: string;
    category: string; // e.g. Staff, Grimoire
    description: string;
    compatibleSystems: MagicSystem[];
    powerBonus: number; // Base multiplier
}

export interface CharacterPreset {
  id: string;
  name: string;
  protectionId: string;
  activityRate: number;
  description: string;
}

export interface SpellAnalysis {
  name: string; // The specific spell name
  system: MagicSystem; // The 5 Major Systems
  attribute: string; // e.g., Fire, Time, Dream (属)
  domain: string; // e.g., Inferno, Chrono-Navigation (域)
  rank: number; // 1-7 (Ring)
  description: string;
  chantFeedback: string;
  visualPrompt: string;
  // W-Core Lore
  eyeColor: string;
  oipAmplitude: string;
  oipFrequency: string;
  
  // New Influence Data
  casterStatus: CasterStatus;
  environment: SpellEnvironment;

  // Equipment / Buffs
  protection: DivineProtectionDef;
  tool: ToolDef;
  toolReinforcement: number; // -3 to +3
  buffLevel: number; // -5 to +5 (New field)

  predictedDamage: number; // Calculated damage value
  calculationFormula?: string; // Formula string for transparency
  // Deep Lore
  lore: SpellLore;
}

export interface ManifestedSpell extends SpellAnalysis {
  id: string; // Format: MGxxxx
  timestamp: number;
}

export type AppState = 'IDLE' | 'ANALYZING' | 'MANIFESTING' | 'READY' | 'COMPLETE' | 'ERROR';

export const INVOCATION_STEPS = [
  "意志集中 (Intent Focus)",
  "物質W視核活性 (W-Core Activation)",
  "魔法陣形成 (Circle Formation)",
  "物質W流動 (W-Flow)",
  "属性変容 (Elemental Conversion)",
  "魔素収束 (Essence Convergence)",
  "現象顕現 (Phenomenon Manifestation)"
];

export const RING_DATA: Record<number, { name: string; alias: string }> = {
  1: { name: "微視的自然操作 (Microscopic Nature Manipulation)", alias: "基礎魔法 (Basic Magic)" },
  2: { name: "形態制御魔術 (Form Control Magic)", alias: "応用魔法 (Applied Magic)" },
  3: { name: "作用連鎖魔術 (Action Chain Magic)", alias: "初級魔術 (Beginner Magic)" },
  4: { name: "複合圏域制御 (Composite Domain Control)", alias: "中級魔術 (Intermediate Magic)" },
  5: { name: "自然級干渉 (Natural Scale Interference)", alias: "上級魔術 (Advanced Magic)" },
  6: { name: "儀式的共鳴 (Ritual Resonance)", alias: "最上級魔術 (Supreme Magic)" },
  7: { name: "根源接続 (Root Connection)", alias: "神代魔法 (Divine Magic)" }
};

export interface EnemyDef {
  id: string;
  name: string;
  description: string;
  maxHp: number;
  currentHp: number;
  attribute: string;
  resistance?: string[];
  weakness?: string[];
}

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  message: string;
  damage?: number;
  isCritical?: boolean;
  effectiveness?: 'SUPER' | 'POOR' | 'NORMAL' | 'IMMUNE';
}
