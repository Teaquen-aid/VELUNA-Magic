import { SpellAnalysis, MagicSystem, CasterStatus, SpellEnvironment, DivineProtectionDef, ToolDef, ManifestedSpell, CharacterPreset } from "../types";

// Mutable Data Table for runtime extension
export let ATTRIBUTE_KEYWORDS: Record<string, { kanji: string, reading: string, tone: string }> = {
  // Elemental
  '火属性': { kanji: '紅蓮', reading: 'グレン', tone: 'burning' },
  '水属性': { kanji: '蒼氷', reading: 'ソウヒョウ', tone: 'calm' },
  '風属性': { kanji: '翠嵐', reading: 'スイラン', tone: 'sharp' },
  '土属性': { kanji: '金剛', reading: 'コンゴウ', tone: 'heavy' },
  '光属性': { kanji: '輝聖', reading: 'キセイ', tone: 'bright' },
  '闇属性': { kanji: '常闇', reading: 'トコヤミ', tone: 'dark' },
  '雷属性': { kanji: '紫電', reading: 'シデン', tone: 'energetic' },
  '氷属性': { kanji: '絶対零度', reading: 'アブソリュート', tone: 'cold' },
  '音属性': { kanji: '響鳴', reading: 'キョウメイ', tone: 'oscillating' },
  '凍氷域': { kanji: 'ニブルヘイム', reading: 'ニブルヘイム', tone: 'freezing' },
  '雷霆域': { kanji: 'ケラウノス', reading: 'ケラウノス', tone: 'shocking' },
  '煉獄域': { kanji: 'ムスペル', reading: 'ムスペル', tone: 'infernal' },
  // Causal
  '律界域': { kanji: '法典', reading: 'コード', tone: 'rigid' },
  '時空域': { kanji: '刻戻', reading: 'クロノス', tone: 'mystical' },
  '因果域': { kanji: 'アカシック', reading: 'アカシック', tone: 'complex' },
  // Creation
  '念理域': { kanji: 'イデア', reading: 'イデア', tone: 'abstract' },
  '夢界域': { kanji: '胡蝶', reading: 'コチョウ', tone: 'dreamy' },
  '心象域': { kanji: '鏡面', reading: 'ミラージュ', tone: 'reflective' },
  '創生域': { kanji: '起源', reading: 'オリジン', tone: 'ancient' },
  // Dawn
  '灼界域': { kanji: 'プロミネンス', reading: 'プロミネンス', tone: 'blazing' },
  '星焔域': { kanji: 'ステラ', reading: 'ステラ', tone: 'cosmic' },
  '黎氷域': { kanji: 'オーロラ', reading: 'オーロラ', tone: 'celestial' },
  // Other
  '自然属性': { kanji: 'ガイア', reading: 'ガイア', tone: 'natural' },
  '神聖魔法': { kanji: 'サンクチュアリ', reading: 'サンクチュアリ', tone: 'holy' },
  '生活魔法': { kanji: '日常', reading: 'デイリー', tone: 'practical' }
};

export const extendAttributeKeywords = (newData: Record<string, { kanji: string, reading: string, tone: string }>) => {
  ATTRIBUTE_KEYWORDS = { ...ATTRIBUTE_KEYWORDS, ...newData };
};

export let DIVINE_PROTECTIONS: DivineProtectionDef[] = [
    { 
        id: 'none', 
        name: 'なし (None)', 
        category: 'None', 
        description: '加護を受けていない状態。', 
        compatibleAttributes: [], 
        powerMultiplier: 1.0,
        lore: {
            deity: 'なし',
            symbol: 'なし',
            alias: '無垢なる状態',
            conditions: { grant: '-', maintain: '-', loss: '-' },
            effects: { direct: 'なし', indirect: 'なし', constraints: 'なし' },
            hierarchy: { lower: '-', middle: '-', upper: '-' },
            role: '初期状態'
        }
    },
    // ... (Keep existing protections)
    { id: 'kago_light', name: '光耀の加護', category: '属性加護', description: '魔力回復増加・防御大幅強化。', compatibleAttributes: ['光属性', '神聖魔法', '黎氷域', '星焔域'], powerMultiplier: 4.5, lore: { deity: '光神ルミナス', symbol: '八芒星の光輪', alias: '聖なる守り', conditions: { grant: '光属性への高い親和性と、慈愛の精神を持つ者。', maintain: '定期的な礼拝と不浄の回避。', loss: '背信行為、または大罪を犯すこと。' }, effects: { direct: '光属性魔術の威力増幅、魔力自然回復速度の向上(大)。', indirect: '病気・毒への高耐性、アンデッドへの威圧。', constraints: '闇属性魔術の使用が不可能になる。' }, hierarchy: { lower: '蛍火の加護', middle: '光輝の加護', upper: '天光の加護' }, role: '世界の秩序維持と浄化を担う。' } },
    { id: 'kago_storm', name: '嵐刃の加護', category: '属性加護', description: '攻撃速度上昇・雷霆増幅・麻痺付与。', compatibleAttributes: ['風属性', '雷属性', '雷霆域', '音属性'], powerMultiplier: 3.8, lore: { deity: '暴風神テンペスト', symbol: '交差する稲妻と翼', alias: '戦場の疾風', conditions: { grant: '嵐の中で生き延びた者、あるいは天性の速さを持つ者。', maintain: '常に挑戦し続けること。', loss: '恐怖に屈し、逃亡すること。' }, effects: { direct: '詠唱速度の短縮、雷属性の威力強化。', indirect: '落下ダメージ無効、風読みの直感。', constraints: '土属性（防御系）の魔術効果が半減する。' }, hierarchy: { lower: 'そよ風の加護', middle: '疾風の加護', upper: '天嵐の加護' }, role: '停滞を破壊し、変化をもたらす力。' } },
    { id: 'kago_frost', name: '凍月の加護', category: '属性加護', description: '氷結耐性・氷属性威力極大化。', compatibleAttributes: ['氷属性', '水属性', '凍氷域', '黎氷域'], powerMultiplier: 4.0, lore: { deity: '氷雪の女王ニブル', symbol: '六花（雪の結晶）', alias: '静寂の抱擁', conditions: { grant: '極寒の地での生存、または冷徹な理性の持ち主。', maintain: '感情に流されず、冷静であること。', loss: '激昂し、理性を失うこと。' }, effects: { direct: '氷属性の絶対零度化、物理防御力の向上（氷衣）。', indirect: '精神干渉への耐性、体温低下の無効化。', constraints: '火属性魔術の使用時にダメージを受ける。' }, hierarchy: { lower: '霜の加護', middle: '氷結の加護', upper: '絶対零度の加護' }, role: '世界の熱的均衡を保ち、静寂をもたらす。' } },
    { id: 'kago_purgatory', name: '煉獄の加護', category: '属性加護', description: '炎属性極大化・燃焼強化。', compatibleAttributes: ['火属性', '煉獄域', '灼界域'], powerMultiplier: 5.0, lore: { deity: '炎帝イフリート', symbol: '燃え盛る心臓', alias: '滅びの焔', conditions: { grant: '焼き尽くしたいという強烈な渇望、または王の資質。', maintain: '他者を圧倒する強さを維持すること。', loss: '敗北し、誇りを折られること。' }, effects: { direct: '火属性の破壊力極大化、継続燃焼効果の付与。', indirect: '寒冷地での活動制限解除、恐怖耐性。', constraints: '水属性耐性が著しく低下する。' }, hierarchy: { lower: '火粉の加護', middle: '爆炎の加護', upper: '劫火の加護' }, role: '腐敗を焼き払い、再生の土壌を作る。' } },
    { id: 'kago_star', name: '星辰の加護', category: '属性加護', description: '運命回避・星辰属性強化。', compatibleAttributes: ['星焔域', '光属性', '黎明系'], powerMultiplier: 4.8, lore: { deity: '星神アストライア', symbol: '羅針盤', alias: '導きの光', conditions: { grant: '星読みの才', maintain: '夜空の観測', loss: '運命への冒涜' }, effects: { direct: '星属性強化', indirect: '直感強化', constraints: '地下での能力低下' }, hierarchy: { lower: '星屑の加護', middle: '-', upper: '銀河の加護' }, role: '運命の観測' } },
    { id: 'kago_fire', name: '火の加護', category: '属性加護', description: '攻撃力上昇・炎耐性。', compatibleAttributes: ['火属性', '煉獄域', '灼界域'], powerMultiplier: 3.0, lore: { deity: '下級炎精霊', symbol: '篝火', alias: '-', conditions: { grant: '火への親和', maintain: '-', loss: '-' }, effects: { direct: '火属性強化', indirect: '耐寒', constraints: '-' }, hierarchy: { lower: '-', middle: '火炎の加護', upper: '煉獄の加護' }, role: '文明の象徴' } },
    { id: 'kago_water', name: '水の加護', category: '属性加護', description: '回復力強化・氷結耐性。', compatibleAttributes: ['水属性', '氷属性', '凍氷域'], powerMultiplier: 3.0, lore: { deity: '下級水精霊', symbol: '雫', alias: '-', conditions: { grant: '水への親和', maintain: '-', loss: '-' }, effects: { direct: '水属性強化', indirect: '水中呼吸', constraints: '-' }, hierarchy: { lower: '-', middle: '激流の加護', upper: '大海の加護' }, role: '生命の源' } },
    { id: 'kago_wind', name: '風の加護', category: '属性加護', description: '速度上昇・飛行能力。', compatibleAttributes: ['風属性', '音属性'], powerMultiplier: 3.0, lore: { deity: '下級風精霊', symbol: '羽', alias: '-', conditions: { grant: '風への親和', maintain: '-', loss: '-' }, effects: { direct: '風属性強化', indirect: '落下耐性', constraints: '-' }, hierarchy: { lower: '-', middle: '烈風の加護', upper: '嵐刃の加護' }, role: '伝達と移動' } },
    { id: 'kago_earth', name: '地の加護', category: '属性加護', description: '防御力強化・耐震。', compatibleAttributes: ['土属性', '金剛'], powerMultiplier: 3.5, lore: { deity: '下級土精霊', symbol: '岩', alias: '-', conditions: { grant: '土への親和', maintain: '-', loss: '-' }, effects: { direct: '土属性強化', indirect: '毒耐性', constraints: '-' }, hierarchy: { lower: '-', middle: '盤石の加護', upper: '大地の加護' }, role: '基盤と安定' } },
    { id: 'kago_thunder', name: '雷の加護', category: '属性加護', description: '瞬発力強化・電撃。', compatibleAttributes: ['雷属性', '雷霆域'], powerMultiplier: 3.8, lore: { deity: '下級雷精霊', symbol: '雷紋', alias: '-', conditions: { grant: '雷への親和', maintain: '-', loss: '-' }, effects: { direct: '雷属性強化', indirect: '麻痺無効', constraints: '-' }, hierarchy: { lower: '-', middle: '稲妻の加護', upper: '建御雷の加護' }, role: '裁定と神威' } },
    { id: 'kago_world', name: '世界の加護', category: '最強加護', description: '【序列1位】物質・情報・因果律の完全操作。', compatibleAttributes: ['因果系', '創造系', '律界域', '時空域', '因果域', '創生域'], powerMultiplier: 50.0, lore: { deity: '根源神ヴェルナ（世界意思）', symbol: 'ウロボロスを内包する世界樹', alias: '全知全能の許諾', conditions: { grant: '世界意思による直接指名。数千年に一人の逸材。', maintain: '世界の均衡を崩さないこと。', loss: '世界の敵対者となること。' }, effects: { direct: '全系統魔法の行使可能、魔力消費ゼロ、事象改変。', indirect: '不老不死、因果律からの逸脱。', constraints: '自身の消滅を代償とする魔法のみ行使不可。' }, hierarchy: { lower: '精霊王の加護', middle: '世界樹の加護', upper: 'なし（頂点）' }, role: '世界の管理者権限（Admin）そのもの。' } },
    { id: 'kago_spacetime', name: '時空の加護', category: '最強加護', description: '【序列2位】時間操作・因果律制御。', compatibleAttributes: ['時空域', '因果系', '律界域'], powerMultiplier: 30.0, lore: { deity: '時空神クロノス', symbol: '砂時計と無限大', alias: '刻の支配者', conditions: { grant: '時の狭間に落ち、帰還した者。', maintain: '歴史の大きな改変を行わないこと（観測者であること）。', loss: 'タイムパラドックスによる自己消滅。' }, effects: { direct: '時間停止、過去改変、未来予知。', indirect: '老化停止、瞬間移動。', constraints: '自身の過去には干渉できない。' }, hierarchy: { lower: '加速の加護', middle: '転移の加護', upper: '世界の加護' }, role: '歴史の編纂と修正。' } },
    { id: 'kago_hero', name: '勇者の加護', category: '最強加護', description: '【序列3位】絶対生命力・運命操作。', compatibleAttributes: ['光属性', '黎明系', '灼界域', '神聖魔法'], powerMultiplier: 25.0, lore: { deity: '英雄神ブレイブ', symbol: '聖剣', alias: '希望の灯火', conditions: { grant: '世界を救う運命にある者', maintain: '正義の心', loss: '闇落ち' }, effects: { direct: '全能力大幅向上', indirect: '致死ダメージ回避', constraints: '魔王以外に殺せない' }, hierarchy: { lower: '戦士の加護', middle: '英雄の加護', upper: '救世主の加護' }, role: '厄災への対抗手段' } },
    { id: 'kago_sword', name: '剣聖の加護', category: '最強加護', description: '【序列4位】因果断裂刃・絶対攻撃。', compatibleAttributes: ['風属性', '雷属性', '音属性'], powerMultiplier: 20.0, lore: { deity: '剣神ブレイド', symbol: '折れない剣', alias: '一刀修羅', conditions: { grant: '剣の道を極めた者', maintain: '研鑽', loss: '剣を捨てる' }, effects: { direct: '斬撃の概念化', indirect: '心眼', constraints: '魔法適性低下' }, hierarchy: { lower: '剣士の加護', middle: '剣豪の加護', upper: '武神の加護' }, role: '武の極致' } },
    { id: 'kago_guardian', name: '守護の加護', category: '最強加護', description: '【序列5位】物理的・因果的防御要塞。', compatibleAttributes: ['土属性', '光属性', '神聖魔法'], powerMultiplier: 15.0, lore: { deity: '守護神アイギス', symbol: '大盾', alias: '絶対防御', conditions: { grant: '守るべきものがある者', maintain: '自己犠牲', loss: '守るべきものの喪失' }, effects: { direct: 'ダメージ遮断', indirect: '範囲防衛', constraints: '攻撃力皆無' }, hierarchy: { lower: '盾の加護', middle: '城壁の加護', upper: '金剛の加護' }, role: '聖域の維持' } },
    { id: 'kago_saint', name: '聖女の加護', category: '最強加護', description: '【序列6位】量子再生・浄化。', compatibleAttributes: ['神聖魔法', '水属性', '光属性'], powerMultiplier: 12.0, lore: { deity: '癒しの女神マリア', symbol: '聖杯', alias: '奇跡の御手', conditions: { grant: '清らかな魂', maintain: '純潔（精神的）', loss: '穢れ' }, effects: { direct: '完全治癒', indirect: '呪い無効', constraints: '殺傷行為の禁止' }, hierarchy: { lower: '癒しの加護', middle: '慈愛の加護', upper: '女神の加護' }, role: '傷の修復' } },
    { id: 'kago_dragon', name: '竜の加護', category: '特殊加護', description: '竜との親和性・竜語理解。', compatibleAttributes: ['火属性', '雷属性', '煉獄域', '雷霆域'], powerMultiplier: 7.7, lore: { deity: '竜王バハムート', symbol: '竜の瞳', alias: '竜血', conditions: { grant: '竜に認められる', maintain: '強さ', loss: '竜への敵対' }, effects: { direct: 'ブレス強化', indirect: '長寿', constraints: '逆鱗' }, hierarchy: { lower: '竜人の加護', middle: '-', upper: '龍神の加護' }, role: '種族の架け橋' } },
    { id: 'kago_curse', name: '呪血の加護', category: '特殊加護', description: 'ダメージを力に変換。', compatibleAttributes: ['闇属性', '煉獄域', '呪い'], powerMultiplier: 6.66, lore: { deity: '邪神カオス', symbol: '滴る血', alias: '代償の力', conditions: { grant: '呪いを受ける', maintain: '苦痛', loss: '浄化' }, effects: { direct: '呪術強化', indirect: 'ペイン変換', constraints: '持続ダメージ' }, hierarchy: { lower: '不運の加護', middle: '-', upper: '災厄の加護' }, role: '負の側面' } },
    { id: 'kago_shadow', name: '影の加護', category: '特殊加護', description: '隠密・闇の力。', compatibleAttributes: ['闇属性', '常闇'], powerMultiplier: 6.0, lore: { deity: '影の王', symbol: '三日月', alias: '夜の友', conditions: { grant: '孤独', maintain: '隠密', loss: '日向' }, effects: { direct: '潜伏', indirect: '気配遮断', constraints: '光に弱い' }, hierarchy: { lower: '闇の加護', middle: '-', upper: '虚無の加護' }, role: '裏の監視者' } },
];

export let DEFAULT_TOOLS: ToolDef[] = [
    { id: 'tool_staff', name: '樫の木の杖 (Oak Staff)', category: '杖', description: '汎用的な触媒。安定性が高い。', compatibleSystems: [MagicSystem.ELEMENTAL, MagicSystem.OTHER], powerBonus: 1.1 },
    { id: 'tool_wand', name: 'ミスリルの短杖 (Mithril Wand)', category: '短杖', description: '魔伝導率が高い。高速詠唱向け。', compatibleSystems: [MagicSystem.ELEMENTAL, MagicSystem.DAWN], powerBonus: 1.3 },
    { id: 'tool_grimoire', name: '古の魔導書 (Ancient Grimoire)', category: '魔導書', description: '複雑な術式を補助する。', compatibleSystems: [MagicSystem.CAUSAL, MagicSystem.CREATION], powerBonus: 1.5 },
    { id: 'tool_orb', name: '賢者の宝玉 (Sage Orb)', category: '宝玉', description: '魔力を貯蔵・増幅する。', compatibleSystems: [MagicSystem.CREATION, MagicSystem.DAWN], powerBonus: 1.4 },
    { id: 'tool_sword', name: '魔法剣 (Magic Sword)', category: '武具', description: '近接戦闘用の魔力付与武具。', compatibleSystems: [MagicSystem.ELEMENTAL, MagicSystem.OTHER], powerBonus: 1.2 },
    { id: 'tool_none', name: '素手 (Unarmed)', category: 'なし', description: '道具を使用しない。', compatibleSystems: [], powerBonus: 1.0 },
];

export const CHARACTER_PRESETS: CharacterPreset[] = [
    { id: 'char_canon', name: 'CANON', protectionId: 'kago_world', activityRate: 93.2, description: 'World Class Singularity' },
    { id: 'char_aid', name: 'AID', protectionId: 'kago_spacetime', activityRate: 81.7, description: 'Chrono Navigator' },
    { id: 'char_nana', name: 'NANA', protectionId: 'kago_light', activityRate: 60.5, description: 'Luminous Saint' }
];

let CUSTOM_TOOLS: ToolDef[] = [];

export const getTools = () => [...DEFAULT_TOOLS, ...CUSTOM_TOOLS];

export const registerTool = (tool: ToolDef) => {
    // Check if tool exists (update) or new
    const idx = CUSTOM_TOOLS.findIndex(t => t.id === tool.id);
    if (idx >= 0) {
        CUSTOM_TOOLS[idx] = tool;
    } else {
        const defaultIdx = DEFAULT_TOOLS.findIndex(t => t.id === tool.id);
        if (defaultIdx >= 0) {
            DEFAULT_TOOLS[defaultIdx] = tool;
        } else {
            CUSTOM_TOOLS.push(tool);
        }
    }
};

export const registerProtection = (prot: DivineProtectionDef) => {
    const idx = DIVINE_PROTECTIONS.findIndex(p => p.id === prot.id);
    if (idx >= 0) {
        DIVINE_PROTECTIONS[idx] = prot;
    } else {
        DIVINE_PROTECTIONS.push(prot);
    }
};

// Modifiers for spell construction
const RANK_MODIFIERS: Record<number, { suffix: string; theory: string; effect: string }> = {
  1: { suffix: '球 (Sphere)', theory: '基礎凝縮 (Basic Condensation)', effect: '小規模な顕現 (Minor Manifestation)' },
  2: { suffix: '矢 (Arrow)', theory: '指向性制御 (Directional Control)', effect: '物理的干渉 (Physical Interference)' },
  3: { suffix: '槍 (Lance)', theory: '連鎖励起 (Chain Excitation)', effect: '局所的破壊 (Local Destruction)' },
  4: { suffix: '爆 (Blast)', theory: '臨界突破 (Critical Break)', effect: '広域拡散 (Area Dispersion)' },
  5: { suffix: '嵐 (Storm)', theory: '環境改変 (Environmental Alteration)', effect: '災害級干渉 (Disaster Interference)' },
  6: { suffix: '帝 (Emperor)', theory: '概念定着 (Concept Fixation)', effect: '法則支配 (Law Domination)' },
  7: { suffix: '神 (Deity)', theory: '根源接続 (Root Connection)', effect: '事象改変 (Phenomenon Rewrite)' },
};

// ... (Predefined Grimoire and Hidden Arts omitted for brevity, logic unchanged)

export const PREDEFINED_GRIMOIRE: Partial<ManifestedSpell>[] = [
    // ... existing
    {
        id: 'LIB_001', name: 'ファイアボール (Fireball)', system: MagicSystem.ELEMENTAL, attribute: '火属性', rank: 1,
        description: '初歩的な火球を形成し、対象に射出する基礎魔術。',
        chantFeedback: '赤き熱量よ、我が指先に集い球となれ。',
        predictedDamage: 150
    },
    // ... rest of spells
];

const HIDDEN_ARTS = [
    // ... existing hidden arts
    {
        condition: { protectionId: 'kago_world', system: MagicSystem.CAUSAL, attribute: '因果域', rank: 7 },
        data: {
            name: 'アカシック・リライト (Akashic Rewrite)',
            description: '【裏奥義】世界の理を書き換える禁忌のコマンド。対象の存在定義そのものを根源から抹消する神の御業。',
            chantFeedback: 'System.override(Target); Execute(Delete); // 終焉',
            predictedDamage: 9999999,
            oipAmplitude: '∞ Wm',
            oipFrequency: '∞ THz',
            eyeColor: '#ffffff'
        }
    },
];

const getEyeColor = (attribute: string, system: string): string => {
  const attr = attribute.toLowerCase();
  const sys = system.toLowerCase();
  if (attr.includes('火') || attr.includes('fire') || attr.includes('熱') || attr.includes('灼') || attr.includes('煉獄')) return '#ef4444'; 
  if (attr.includes('水') || attr.includes('water') || attr.includes('氷') || attr.includes('ice') || attr.includes('凍')) return '#3b82f6'; 
  if (attr.includes('風') || attr.includes('wind') || attr.includes('空') || attr.includes('air') || attr.includes('音')) return '#10b981'; 
  if (attr.includes('土') || attr.includes('earth') || attr.includes('地') || attr.includes('rock')) return '#a16207'; 
  if (attr.includes('光') || attr.includes('light') || attr.includes('雷') || attr.includes('thunder') || attr.includes('星')) return '#fbbf24'; 
  if (attr.includes('闇') || attr.includes('dark') || attr.includes('影') || attr.includes('shadow')) return '#7e22ce'; 
  if (sys.includes('因果') || attr.includes('時') || attr.includes('律')) return '#8b5cf6'; 
  if (sys.includes('黎明')) return '#fef08a'; 
  if (sys.includes('創造') || attr.includes('夢') || attr.includes('心')) return '#ec4899'; 
  return '#9ca3af'; 
};

export const constructSpell = async (
    rank: number, 
    system: string, 
    attribute: string, 
    protectionId: string = 'none', 
    toolId: string = 'tool_none', 
    environment: SpellEnvironment, 
    casterStatus: CasterStatus,
    knownSpell?: Partial<ManifestedSpell>,
    toolReinforcement: number = 0, // New parameter for reinforcement
    buffLevel: number = 0 // New parameter for buff/debuff (-5 to +5)
): Promise<SpellAnalysis> => {
  
  const attrData = ATTRIBUTE_KEYWORDS[attribute] || { kanji: attribute, reading: 'アンノウン', tone: 'neutral' };
  const rankData = RANK_MODIFIERS[rank] || RANK_MODIFIERS[1];
  const protection = DIVINE_PROTECTIONS.find(p => p.id === protectionId) || DIVINE_PROTECTIONS[0];
  
  const availableTools = getTools();
  const tool = availableTools.find(t => t.id === toolId) || availableTools.find(t => t.id === 'tool_none') || DEFAULT_TOOLS[5];

  const hiddenArt = HIDDEN_ARTS.find(art => 
      art.condition.protectionId === protectionId &&
      art.condition.system === system &&
      art.condition.attribute === attribute &&
      art.condition.rank === rank
  );

  if (hiddenArt) {
      // ... hidden art logic
      const art = hiddenArt.data;
      return {
          name: art.name,
          system: system as MagicSystem,
          attribute: attribute,
          domain: attribute,
          rank: rank,
          eyeColor: art.eyeColor || getEyeColor(attribute, system),
          oipAmplitude: art.oipAmplitude || 'Unknown',
          oipFrequency: art.oipFrequency || 'Unknown',
          casterStatus,
          environment,
          protection,
          tool,
          toolReinforcement,
          buffLevel,
          predictedDamage: art.predictedDamage,
          calculationFormula: '[HIDDEN COMMAND] DIVINE INTERVENTION DETECTED. LIMITERS RELEASED.',
          description: art.description,
          chantFeedback: art.chantFeedback,
          visualPrompt: `Divine Magic Circle of ${attribute}, Ultimate Rank`,
          lore: { magicType: 'Hidden Art', medium: 'Divine', condition: 'Resonance', cost: 'None', theory: 'Divine', origin: 'Akashic', famousUser: 'Player' }
      };
  }

  const name = knownSpell?.name || `${attrData.kanji}${rankData.suffix}`;
  
  let chant = knownSpell?.chantFeedback || "";
  if (!chant) {
      if (rank <= 2) {
        chant = `我が声に応えよ、${attribute}の精霊。${rankData.theory}を開始する。`;
      } else if (rank <= 4) {
        chant = `深淵より来たる${attrData.reading}の理よ、我が魔力をもって形となせ。${rankData.effect}を引き起こせ！`;
      } else {
        chant = `原初の刻、${system}の理において命ず。${attrData.kanji}の権能をここに顕現させ、${rankData.theory}を完遂せよ。万象、我が意のままに！`;
      }
  }

  const baseAmp = Math.pow(10, rank).toExponential(2);
  const frequencyVal = Math.random() * 100 + 400; 
  const frequency = `${frequencyVal.toFixed(2)} THz`;
  
  const finalCasterStatus = {
    ...casterStatus,
    consciousnessLevel: casterStatus.emotionIndex > 80 ? "Exalted (変性意識)" : casterStatus.emotionIndex > 50 ? "Clear (覚醒)" : "Normal (通常)",
  };

  const baseDamageVal = knownSpell?.predictedDamage || (50 * Math.pow(6, rank)); 
  
  let internalMult = 1.0 + (finalCasterStatus.emotionIndex / 200) + ((finalCasterStatus.heartRate - 60) / 400); 
  
  const hpRatio = Math.max(0, Math.min(1, casterStatus.hp / casterStatus.maxHp));
  let hpMultStr = "";
  
  if (hpRatio <= 0.05 && hpRatio > 0) {
      internalMult *= 3.0;
      hpMultStr = "x3.0 (CRISIS BOOST)";
  } else {
      const healthFactor = 0.5 + (hpRatio * 0.5); 
      internalMult *= healthFactor;
      hpMultStr = `x${healthFactor.toFixed(2)} (Health Factor)`;
  }

  // --- UPDATED WEATHER LOGIC ---
  let weatherSynergy = 1.0;
  let weatherNote = "";
  
  // Basic temperature/humidity checks (Legacy)
  if (attribute.includes('火') || attribute.includes('煉獄')) {
      if (environment.temperature > 25) weatherSynergy += 0.1;
      if (environment.humidity < 40) weatherSynergy += 0.1;
  } else if (attribute.includes('水') || attribute.includes('氷')) {
      if (environment.temperature < 10) weatherSynergy += 0.1;
      if (environment.humidity > 60) weatherSynergy += 0.1;
  }
  
  // Specific Weather Type Bonuses (Requested)
  if (environment.weather === 'RAIN') {
      if (attribute.includes('水') || attribute.includes('氷') || attribute.includes('海')) {
          weatherSynergy *= 1.25;
          weatherNote = "(Rain Boost)";
      } else if (attribute.includes('火')) {
          weatherSynergy *= 0.8;
          weatherNote = "(Rain Penalty)";
      }
  } else if (environment.weather === 'CLOUDY') {
      if (attribute.includes('風') || attribute.includes('音') || attribute.includes('雷')) {
          weatherSynergy *= 1.20;
          weatherNote = "(Cloud Boost)";
      }
  } else if (environment.weather === 'SUNNY') {
      if (attribute.includes('光') || attribute.includes('火') || attribute.includes('灼')) {
          weatherSynergy *= 1.15;
          weatherNote = "(Sun Boost)";
      }
  }

  const externalMult = (environment.wDensity / 3000) * weatherSynergy;

  let protectionMult = 1.0;
  let protectionStatus = "Inactive";
  if (protection.id !== 'none') {
    if (protection.compatibleAttributes.some(c => attribute.includes(c) || system.includes(c))) {
        protectionMult = protection.powerMultiplier;
        protectionStatus = "Active (Resonance)";
    } else {
        protectionMult = 1.0; 
        protectionStatus = "Inactive (Incompatible)";
    }
  }
  
  let toolMult = tool.powerBonus;
  if (tool.compatibleSystems.includes(system as MagicSystem)) {
      toolMult *= 1.2;
  }
  // Apply Reinforcement
  const reinforcementBonus = 1 + (toolReinforcement * 0.1); // -0.3 to +0.3
  toolMult *= reinforcementBonus;

  // Apply Buff/Debuff
  const buffBonus = 1 + (buffLevel * 0.2); // +/- 20% per level
  const finalBuffMult = Math.max(0.1, buffBonus); // Minimum 0.1 multiplier

  const finalDamage = Math.floor(baseDamageVal * internalMult * externalMult * protectionMult * toolMult * finalBuffMult);

  const formula = `
    [BASE] ${knownSpell ? 'Spell Power' : 'Rank Power'}: ${baseDamageVal.toLocaleString()}
    
    [INTERNAL] (Emotion ${finalCasterStatus.emotionIndex}% + Vitals): x${(internalMult / (hpRatio <= 0.05 ? 3.0 : (0.5 + hpRatio * 0.5))).toFixed(2)}
    [VITALITY] HP ${casterStatus.hp}/${casterStatus.maxHp}: ${hpMultStr}
    
    [EXTERNAL] (W-Density ${environment.wDensity}): x${(environment.wDensity/3000).toFixed(2)}
    [WEATHER] ${environment.weather} ${weatherNote}: x${weatherSynergy.toFixed(2)}
    
    [DIVINE] ${protection.name} (${protectionStatus}): x${protectionMult.toFixed(2)}
    
    [TOOL] ${tool.name} (Reinf: ${toolReinforcement > 0 ? '+' : ''}${toolReinforcement}): x${toolMult.toFixed(2)}
    [BUFF] Resonance Amp: Lv${buffLevel} (x${finalBuffMult.toFixed(2)})

    --------------------------------
    TOTAL: ${finalDamage.toLocaleString()}
  `.trim();

  const description = knownSpell?.description || `第${rank}環に属する${system}魔法。${rankData.theory}を応用し、対象領域に${attrData.kanji}属性の${rankData.effect}をもたらす。`;

  return {
    name: name,
    system: system as MagicSystem,
    attribute: attribute,
    domain: attribute.includes('域') ? attribute : "通常領域",
    rank: rank,
    eyeColor: getEyeColor(attribute, system),
    oipAmplitude: `${baseAmp} Wm`,
    oipFrequency: frequency,
    
    casterStatus: finalCasterStatus,
    environment: environment,
    
    protection: protection,
    tool: tool,
    toolReinforcement,
    buffLevel,

    predictedDamage: finalDamage,
    calculationFormula: formula,
    description: description,
    chantFeedback: chant,
    visualPrompt: `Magic circle of ${attribute}, rank ${rank}`,
    lore: {
      magicType: rank > 4 ? "儀式魔術" : "即時発動",
      medium: "音声詠唱およびW視核",
      condition: "視界確保",
      cost: rank > 5 ? "術者の生命力" : "大気中のマナ",
      theory: rankData.theory,
      origin: "古代文明",
      famousUser: "不明"
    }
  };
};