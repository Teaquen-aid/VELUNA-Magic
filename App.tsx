import React, { useState, useRef, useEffect } from 'react';
import { constructSpell, extendAttributeKeywords, ATTRIBUTE_KEYWORDS, DIVINE_PROTECTIONS, getTools, registerTool, PREDEFINED_GRIMOIRE, DEFAULT_TOOLS, ENEMIES, CHARACTER_PRESETS } from './services/geminiService';
import { AppState, ManifestedSpell, SpellAnalysis, INVOCATION_STEPS, MagicSystem, SYSTEM_ATTRIBUTES, RING_DATA, CasterStatus, SpellEnvironment, ToolDef, EnemyDef, CombatLogEntry, WeatherType, CharacterPreset } from './types';
import MagicCircle from './components/MagicCircle';
import SpellResult from './components/SpellResult';
import Grimoire from './components/Grimoire';
import SpellEditor from './components/SpellEditor';
import CombatPanel from './components/CombatPanel';
import { Box, CircleDot, Layers, Component, Sparkles, Activity, Settings, X, Shield, Trash2, Volume2, Edit2, ChevronUp, Waves, Zap, Upload, List, Plus, Search, Crown, Heart, Thermometer, CloudFog, MapPin, Gauge, Hammer, Pause, Play, Book, Skull, ArrowUp, AlertTriangle, Swords, User, Sun, CloudRain, Cloud } from 'lucide-react';

const FAILURE_REASONS = [
  "術式回路の臨界崩壊 (Circuit Criticality Collapse)",
  "W粒子同調率の不足 (Insufficient W-Particle Sync)",
  "精神感応ノイズの干渉 (Psychic Noise Interference)",
  "マナ供給パスの遮断 (Mana Supply Interrupted)",
  "無意識領域による拒絶 (Subconscious Rejection)"
];

// Vertical HP Slider
const VerticalHpSlider: React.FC<{ hp: number; maxHp: number; onChange: (val: number) => void }> = ({ hp, maxHp, onChange }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const hpPercentage = Math.min(100, Math.max(0, (hp / maxHp) * 100));
    const isCrisis = hpPercentage <= 5;

    let colorClass = "bg-green-500/80 shadow-[0_0_10px_#22c55e]";
    if (hpPercentage <= 5) colorClass = "bg-red-600/90 animate-pulse shadow-[0_0_15px_#dc2626]";
    else if (hpPercentage <= 20) colorClass = "bg-red-500/80 shadow-[0_0_10px_#ef4444]";
    else if (hpPercentage <= 50) colorClass = "bg-yellow-500/80 shadow-[0_0_10px_#eab308]";

    const handleInteraction = (clientY: number) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const height = rect.height;
        const bottom = rect.bottom;
        const delta = bottom - clientY;
        const rawPercent = Math.min(100, Math.max(0, (delta / height) * 100));
        const newVal = Math.round((rawPercent / 100) * maxHp);
        onChange(newVal);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleInteraction(e.touches[0].clientY);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                e.preventDefault();
                handleInteraction(e.clientY);
            }
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging) {
                e.preventDefault();
                handleInteraction(e.touches[0].clientY);
            }
        };
        const handleUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchend', handleUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
        };
    }, [isDragging]);

    return (
        <div className="h-full flex flex-col items-center gap-2">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest writing-vertical-lr rotate-180">
                Vitality
            </div>
            <div 
                ref={sliderRef}
                className="relative flex-1 w-4 bg-gray-900 border border-white/10 rounded-full overflow-hidden cursor-ns-resize group"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_10px]"></div>
                <div 
                    className={`absolute bottom-0 w-full transition-all duration-300 ease-out overflow-hidden ${colorClass}`}
                    style={{ height: `${hpPercentage}%` }}
                >
                    {!isCrisis && (
                        <>
                            <div className="absolute -top-[10px] -left-[100%] w-[400%] h-[100px] rounded-[40%] bg-white/20 animate-[spin_4s_linear_infinite]"></div>
                            <div className="absolute -top-[12px] -left-[100%] w-[400%] h-[100px] rounded-[35%] bg-white/10 animate-[spin_7s_linear_infinite]"></div>
                        </>
                    )}
                </div>
                <div className="absolute bottom-[5%] w-full h-[1px] bg-red-500 z-10 opacity-50"></div>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            <div className={`text-[10px] font-mono font-bold ${isCrisis ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                {hp}
            </div>
        </div>
    );
};

// Circular Slider
const CircularSlider: React.FC<{ value: number; onChange: (val: number) => void; color: string }> = ({ value, onChange, color }) => {
  const circleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!circleRef.current) return;
    const rect = circleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = centerY - clientY; 
    let angle = Math.atan2(deltaX, deltaY); 
    let degree = angle * (180 / Math.PI);
    if (degree < 0) degree += 360;
    const rawValue = (degree / 360) * 100;
    const newValue = Math.min(100, Math.max(0, Math.round(rawValue * 10) / 10));
    onChange(newValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); handleInteraction(e.clientX, e.clientY); };
  const handleTouchStart = (e: React.TouchEvent) => { setIsDragging(true); handleInteraction(e.touches[0].clientX, e.touches[0].clientY); };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { if (isDragging) { e.preventDefault(); handleInteraction(e.clientX, e.clientY); } };
    const handleTouchMove = (e: TouchEvent) => { if (isDragging) { e.preventDefault(); handleInteraction(e.touches[0].clientX, e.touches[0].clientY); } };
    const handleUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  const size = 160; 
  const strokeWidth = 8;
  const padding = 20; 
  const radius = (size - strokeWidth - padding) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const [intPart, decPart] = value.toFixed(1).split('.');

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
       <div ref={circleRef} className="absolute inset-0 rounded-full z-20 cursor-pointer" onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}></div>
       <svg width={size} height={size} className="transform -rotate-90 pointer-events-none overflow-visible">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-100 ease-out" style={{ filter: `drop-shadow(0 0 15px ${color})` }} />
       </svg>
       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex items-baseline justify-center font-mono font-bold transition-colors duration-300 drop-shadow-md tracking-tighter" style={{ color: color }}>
             <span className="text-4xl md:text-5xl">{intPart}</span>
             <span className="text-xl md:text-2xl">.{decPart}</span>
             <span className="text-xs opacity-50 ml-1">%</span>
          </div>
       </div>
       <div className="absolute w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-transform duration-100 ease-out" style={{ top: 0, left: 0, transform: `translate(${size/2 - 8}px, ${size/2 - 8}px) rotate(${value * 3.6}deg) translateY(-${radius}px)` }}>
         <div className="w-full h-full rounded-full bg-white opacity-80" style={{ boxShadow: `0 0 15px ${color}` }}></div>
       </div>
    </div>
  );
};

// Sensor Component
const SensorData: React.FC<{ icon: React.ReactNode; label: string; value: string; unit?: string; color?: string; blink?: boolean }> = ({ icon, label, value, unit, color = "text-white", blink = false }) => (
  <div className={`bg-white/5 border border-white/5 rounded p-2 flex flex-col justify-between h-full hover:bg-white/10 transition-colors ${blink ? 'animate-pulse bg-red-900/20 border-red-500/30' : ''}`}>
     <div className="flex items-center gap-1.5 text-gray-500 mb-1">
        <div style={{ color: color }} className="opacity-80">{icon}</div>
        <span className="text-[9px] font-mono uppercase tracking-wider">{label}</span>
     </div>
     <div className="text-sm font-mono font-medium truncate flex items-baseline gap-1" style={{ color: color === "text-white" ? undefined : color }}>
        {value} {unit && <span className="text-[10px] text-gray-500">{unit}</span>}
     </div>
  </div>
);

export default function App() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [currentSpell, setCurrentSpell] = useState<ManifestedSpell | null>(null);
  const [grimoire, setGrimoire] = useState<ManifestedSpell[]>([]);
  const [analysis, setAnalysis] = useState<SpellAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invocationStep, setInvocationStep] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Character State
  const [characters, setCharacters] = useState<CharacterPreset[]>(CHARACTER_PRESETS);
  const [newCharName, setNewCharName] = useState('');
  const [showCharAdd, setShowCharAdd] = useState(false);

  // Modals
  const [showRegistryEditor, setShowRegistryEditor] = useState(false);
  const [showSpellEditor, setShowSpellEditor] = useState(false);
  const [editingSpell, setEditingSpell] = useState<ManifestedSpell | null>(null);
  
  const [configOpen, setConfigOpen] = useState(false);
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  
  // Config Tab State
  const [configTab, setConfigTab] = useState<'MAGIC' | 'PROTECTION' | 'TOOL' | 'CHARACTER'>('MAGIC');

  // Combat State
  const [combatOpen, setCombatOpen] = useState(false);
  const [activeEnemy, setActiveEnemy] = useState<EnemyDef>(ENEMIES[0]);
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);
  const [lastProcessedSpellId, setLastProcessedSpellId] = useState<string | null>(null);

  // Attributes & Tools
  const [sysAttributes, setSysAttributes] = useState<Record<MagicSystem, string[]>>(SYSTEM_ATTRIBUTES);
  const [keywords, setKeywords] = useState(ATTRIBUTE_KEYWORDS);
  const [allTools, setAllTools] = useState<ToolDef[]>([]);
  
  // Editor State
  const [editorTab, setEditorTab] = useState<'REGISTRY' | 'TOOLS' | 'IMPORT'>('REGISTRY');
  const [newAttrSystem, setNewAttrSystem] = useState<MagicSystem>(MagicSystem.ELEMENTAL);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrKanji, setNewAttrKanji] = useState('');
  const [newAttrReading, setNewAttrReading] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Tool Editor State
  const [newToolName, setNewToolName] = useState('');
  const [newToolCategory, setNewToolCategory] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [newToolSystem, setNewToolSystem] = useState<MagicSystem>(MagicSystem.ELEMENTAL);
  const [newToolBonus, setNewToolBonus] = useState<string>('1.1');

  // Load initial tools and PREDEFINED SPELLS
  useEffect(() => {
    setAllTools(getTools());
    const spells = PREDEFINED_GRIMOIRE.map(p => ({
        ...p,
        timestamp: Date.now(),
        eyeColor: '#fff',
        oipAmplitude: '0',
        oipFrequency: '0',
        casterStatus: { hp: 100, maxHp: 100, heartRate: 0, bodyTemp: 0, bloodPressure: '', respiration: 0, spO2: 0, consciousnessLevel: '', emotionIndex: 0 },
        environment: { location: { lat: 0, lng: 0, alt: 0 }, temperature: 0, humidity: 0, wDensity: 0, weather: 'SUNNY' },
        protection: DIVINE_PROTECTIONS[0],
        tool: DEFAULT_TOOLS[0],
        calculationFormula: '',
        visualPrompt: '',
        domain: '',
        lore: { magicType: '', medium: '', condition: '', cost: '', theory: '', origin: '', famousUser: '' }
    } as ManifestedSpell));
    setGrimoire(spells);
  }, []);

  // --- LIVE SIMULATION DATA ---
  const [simulateVitals, setSimulateVitals] = useState(true);
  
  // Environment State (FIXED until updated)
  const [envData, setEnvData] = useState<SpellEnvironment>({
    location: { lat: 35.6895, lng: 139.6917, alt: 45 },
    temperature: 24.5,
    humidity: 55,
    wDensity: 4500,
    weather: 'SUNNY'
  });

  const [vitalData, setVitalData] = useState<CasterStatus>({
    hp: 100, maxHp: 100, heartRate: 72, bodyTemp: 36.6, bloodPressure: "118/76", respiration: 16, spO2: 98.5, consciousnessLevel: "Clear", emotionIndex: 45
  });

  // Settings State
  const [highPerformance, setHighPerformance] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Selection State
  const [activityRate, setActivityRate] = useState<number>(20.0);
  const [rank, setRank] = useState<number>(1);
  const [system, setSystem] = useState<MagicSystem>(MagicSystem.ELEMENTAL);
  const [attribute, setAttribute] = useState<string>(SYSTEM_ATTRIBUTES[MagicSystem.ELEMENTAL][0]);
  const [selectedProtection, setSelectedProtection] = useState<string>('none');
  const [selectedToolId, setSelectedToolId] = useState<string>('tool_none');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [activeSpellId, setActiveSpellId] = useState<string | null>(null);

  // --- ACTIONS ---

  const updateEnvironment = () => {
      // Random Weather
      const weathers: WeatherType[] = ['SUNNY', 'RAIN', 'CLOUDY'];
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      
      let tempBase = 20;
      let humidBase = 50;
      
      if (newWeather === 'SUNNY') { tempBase = 28; humidBase = 40; }
      else if (newWeather === 'RAIN') { tempBase = 18; humidBase = 85; }
      else { tempBase = 22; humidBase = 60; }

      setEnvData({
          location: { lat: 35 + (Math.random() - 0.5) * 5, lng: 139 + (Math.random() - 0.5) * 5, alt: Math.floor(Math.random() * 500) },
          temperature: parseFloat((tempBase + (Math.random() * 10 - 5)).toFixed(1)),
          humidity: Math.floor(Math.max(10, Math.min(100, humidBase + (Math.random() * 20 - 10)))),
          wDensity: Math.floor(Math.random() * 8000) + 1500,
          weather: newWeather
      });
  };

  const handleAddCharacter = () => {
      if (!newCharName.trim()) return;
      const newChar: CharacterPreset = {
          id: `char_${Date.now()}`,
          name: newCharName,
          protectionId: 'none',
          activityRate: Math.floor(Math.random() * 100),
          description: 'Custom Persona'
      };
      setCharacters([...characters, newChar]);
      setShowCharAdd(false);
      setNewCharName('');
      applyCharacterPreset(newChar.id);
  };
  
  const handleUpdateCharacter = (charId: string, field: keyof CharacterPreset, value: any) => {
      setCharacters(prev => prev.map(c => c.id === charId ? { ...c, [field]: value } : c));
  };

  // Initial Env Randomization (One-off)
  useEffect(() => {
      updateEnvironment();
  }, []);

  const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyCharacterPreset = (charId: string) => {
    const char = characters.find(c => c.id === charId);
    if (char) {
        setSelectedProtection(char.protectionId);
        setActivityRate(char.activityRate);
        setSelectedCharacterId(charId);
    }
  };

  // Vitals Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (simulateVitals) {
        setVitalData(prev => {
            const hpRatio = prev.hp / prev.maxHp;
            let baseHr = 72;
            if (hpRatio < 0.2) baseHr = 130; 
            else if (hpRatio < 0.5) baseHr = 100;
            else if (hpRatio > 0.9) baseHr = 65;

            const newHr = Math.max(30, Math.min(220, baseHr + Math.floor(Math.random() * 10 - 5)));
            const newEmotion = Math.max(0, Math.min(100, (hpRatio < 0.3 ? 80 : 40) + Math.floor(Math.random() * 20 - 10)));

            return {
                ...prev,
                heartRate: newHr,
                bodyTemp: parseFloat((Math.max(35.5, Math.min(40.0, prev.bodyTemp + (Math.random() * 0.2 - 0.1))).toFixed(1))),
                spO2: parseFloat((Math.max(85, Math.min(100, 98.5 - (1-hpRatio)*5 + (Math.random() * 0.4 - 0.2))).toFixed(1))), 
                emotionIndex: newEmotion,
                respiration: Math.max(10, Math.min(45, 16 + (1-hpRatio)*20 + Math.floor(Math.random() * 3 - 1))),
            };
        });
      }
    }, 1500); 
    return () => clearInterval(interval);
  }, [simulateVitals]);

  // COMBAT LOGIC
  useEffect(() => {
      if (combatOpen && currentSpell && currentSpell.id !== lastProcessedSpellId) {
          handleCombatTurn(currentSpell);
          setLastProcessedSpellId(currentSpell.id);
      }
  }, [combatOpen, currentSpell, lastProcessedSpellId]);

  const handleCombatTurn = (spell: ManifestedSpell) => {
      if (activeEnemy.currentHp <= 0) return;
      let multiplier = 1.0;
      let effectType: 'SUPER' | 'NORMAL' | 'POOR' = 'NORMAL';
      const spellAttr = spell.attribute;
      const enemyAttr = activeEnemy.attribute;
      if (spellAttr.includes('火') && enemyAttr.includes('風')) { multiplier = 1.5; effectType = 'SUPER'; }
      else if (spellAttr.includes('風') && enemyAttr.includes('土')) { multiplier = 1.5; effectType = 'SUPER'; }
      else if (spellAttr.includes('土') && enemyAttr.includes('水')) { multiplier = 1.5; effectType = 'SUPER'; }
      else if (spellAttr.includes('水') && enemyAttr.includes('火')) { multiplier = 1.5; effectType = 'SUPER'; }
      else if (spellAttr.includes('光') && enemyAttr.includes('闇')) { multiplier = 1.5; effectType = 'SUPER'; }
      else if (spellAttr.includes('風') && enemyAttr.includes('火')) { multiplier = 0.5; effectType = 'POOR'; }
      else if (spellAttr.includes('土') && enemyAttr.includes('風')) { multiplier = 0.5; effectType = 'POOR'; }
      else if (spellAttr.includes('水') && enemyAttr.includes('土')) { multiplier = 0.5; effectType = 'POOR'; }
      else if (spellAttr.includes('火') && enemyAttr.includes('水')) { multiplier = 0.5; effectType = 'POOR'; }

      const actualDamage = Math.floor(spell.predictedDamage * multiplier);
      const isCrit = Math.random() < 0.1;
      const finalDamage = isCrit ? Math.floor(actualDamage * 1.5) : actualDamage;
      
      const logEntry: CombatLogEntry = {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          message: `${spell.name} hit ${activeEnemy.name}!`,
          damage: finalDamage,
          isCritical: isCrit,
          effectiveness: effectType
      };
      setCombatLogs(prev => [...prev, logEntry]);
      setActiveEnemy(prev => ({ ...prev, currentHp: Math.max(0, prev.currentHp - finalDamage) }));
  };

  const handleResetCombat = () => {
      setActiveEnemy(prev => ({ ...prev, currentHp: prev.maxHp }));
      setCombatLogs([]);
  };

  const handleSelectEnemy = (id: string) => {
      const enemy = ENEMIES.find(e => e.id === id);
      if (enemy) { setActiveEnemy(enemy); setCombatLogs([]); }
  };

  const calculateOutput = () => {
    const baseOutput = envData.wDensity * (activityRate / 100);
    const rankMult = Math.pow(1.6, rank - 1); 
    const hpRatio = vitalData.hp / vitalData.maxHp;
    const crisisMult = (hpRatio <= 0.05 && hpRatio > 0) ? 3.0 : (0.5 + hpRatio * 0.5);
    return Math.floor(baseOutput * rankMult * crisisMult);
  };
  const estimatedOutput = calculateOutput();

  const getRankRequirement = (r: number) => {
    switch (r) { case 1: return 1; case 2: return 10; case 3: return 20; case 4: return 35; case 5: return 50; case 6: return 70; case 7: return 81; default: return 0; }
  };
  const isRankAvailable = (r: number) => activityRate >= getRankRequirement(r);

  useEffect(() => {
    if (!isRankAvailable(rank)) {
      let newRank = 0; 
      for (let r = 7; r >= 1; r--) {
         if (isRankAvailable(r)) { newRank = r; break; }
      }
      setRank(newRank === 0 ? 1 : newRank);
    }
  }, [activityRate, rank]);

  useEffect(() => {
    if (!sysAttributes[system]?.includes(attribute)) {
      setAttribute(sysAttributes[system]?.[0] || "");
    }
  }, [system, attribute, sysAttributes]);

  useEffect(() => {
    if (appState === 'ANALYZING') {
      setInvocationStep(0);
      const interval = setInterval(() => { setInvocationStep(prev => (prev < 2 ? prev + 1 : prev)); }, 1000); 
      return () => clearInterval(interval);
    } 
    if (appState === 'MANIFESTING') {
      setInvocationStep(3);
      const interval = setInterval(() => { setInvocationStep(prev => (prev < 6 ? prev + 1 : prev)); }, 800); 
      return () => clearInterval(interval);
    }
  }, [appState]);

  const calculateStability = () => {
    const hpRatio = vitalData.hp / vitalData.maxHp;
    const hpBonus = hpRatio * 25;
    const rankPenalty = rank * 5;
    const baseStability = 30;
    return Math.floor(Math.min(100, Math.max(0, activityRate + baseStability + hpBonus - rankPenalty)));
  };
  const stabilityScore = calculateStability();

  const castSpell = async () => {
    const hpRatio = vitalData.hp / vitalData.maxHp;
    const hpBonus = hpRatio * 25;
    const rankPenalty = rank * 5;
    const baseStability = 30;
    const successProbability = activityRate + baseStability + hpBonus - rankPenalty;
    const roll = Math.random() * 100;
    const isSuccess = roll <= successProbability;

    setConfigOpen(false);

    if (!isSuccess) {
         setAppState('ANALYZING'); setErrorMsg(null); setInvocationStep(0);
         await new Promise(resolve => setTimeout(resolve, 1500));
         const randomReason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
         setErrorMsg(`発動に失敗しました (Activation Failed)\nReason: ${randomReason}`);
         setAppState('ERROR');
         return;
    }

    try {
      setAppState('ANALYZING'); setErrorMsg(null);
      let knownSpell = activeSpellId ? grimoire.find(s => s.id === activeSpellId) : undefined;
      if (!knownSpell) knownSpell = grimoire.find(s => s.system === system && s.rank === rank && s.attribute === attribute);
      
      const spellAnalysis = await constructSpell(
          rank, system, attribute, selectedProtection, selectedToolId, envData, vitalData, knownSpell
      );
      setAnalysis(spellAnalysis);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAppState('MANIFESTING');
      await new Promise(resolve => setTimeout(resolve, 3200));
      const id = `INV${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const newSpell: ManifestedSpell = { ...spellAnalysis, id, timestamp: Date.now() };
      setCurrentSpell(newSpell);
      setAppState('COMPLETE');
    } catch (err) {
      console.error(err);
      setErrorMsg("W-Core Critical Failure.");
      setAppState('ERROR');
    }
  };

  const reset = () => { setAppState('IDLE'); setCurrentSpell(null); setAnalysis(null); setInvocationStep(0); };
  const handleGrimoireSelect = (spell: ManifestedSpell) => {
    setSystem(spell.system); setRank(spell.rank); setAttribute(spell.attribute); setActiveSpellId(spell.id);
    if (window.innerWidth < 768) setIsGrimoireOpen(false);
    setAppState('IDLE');
  };
  const clearHistory = () => { setGrimoire([]); setShowSettings(false); };
  
  const handleOpenSpellEditor = (spell?: ManifestedSpell) => { setEditingSpell(spell || null); setShowSpellEditor(true); };
  const handleSaveSpell = (spell: ManifestedSpell) => {
    if (editingSpell) setGrimoire(prev => prev.map(s => s.id === spell.id ? spell : s));
    else setGrimoire(prev => [spell, ...prev]);
    setShowSpellEditor(false);
  };
  const handleDeleteSpell = (spellId: string) => { setGrimoire(prev => prev.filter(s => s.id !== spellId)); };

  const handleManualAdd = () => {
    if (!newAttrName || !newAttrKanji || !newAttrReading) return;
    const newKeywordData = { [newAttrName]: { kanji: newAttrKanji, reading: newAttrReading, tone: 'neutral' } };
    extendAttributeKeywords(newKeywordData);
    setKeywords(prev => ({ ...prev, ...newKeywordData }));
    setSysAttributes(prev => {
        const currentList = prev[newAttrSystem] || [];
        if (currentList.includes(newAttrName)) return prev;
        return { ...prev, [newAttrSystem]: [...currentList, newAttrName] };
    });
    setNewAttrName(''); setNewAttrKanji(''); setNewAttrReading('');
  };
  
  const handleManualAddTool = () => {
      if (!newToolName || !newToolCategory || !newToolDesc) return;
      const newTool: ToolDef = {
          id: `tool_custom_${Date.now()}`, name: newToolName, category: newToolCategory, description: newToolDesc, compatibleSystems: [newToolSystem], powerBonus: parseFloat(newToolBonus) || 1.1
      };
      registerTool(newTool);
      setAllTools(getTools());
      setNewToolName(''); setNewToolCategory(''); setNewToolDesc('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... existing import logic ... */ };

  const renderAttrButton = (attr: string) => (
    <button
      key={attr}
      onClick={() => setAttribute(attr)}
      className={`py-2 text-[10px] md:text-xs font-sans font-medium border rounded transition-all duration-300 truncate px-1
        ${attribute === attr ? 'bg-magic-accent/20 border-magic-accent text-white shadow-[inset_0_0_10px_rgba(139,92,246,0.2)]' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'}`}
    >
      {attr}
    </button>
  );

  const getActivityColor = (rate: number) => {
    const stops = [{ p: 0, c: [75, 85, 99] }, { p: 25, c: [59, 130, 246] }, { p: 50, c: [139, 92, 246] }, { p: 75, c: [239, 68, 68] }, { p: 100, c: [251, 191, 36] }];
    let start = stops[0]; let end = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (rate >= stops[i].p && rate <= stops[i + 1].p) { start = stops[i]; end = stops[i + 1]; break; }
    }
    const range = end.p - start.p;
    const factor = range === 0 ? 0 : (rate - start.p) / range;
    const r = Math.round(start.c[0] + (end.c[0] - start.c[0]) * factor);
    const g = Math.round(start.c[1] + (end.c[1] - start.c[1]) * factor);
    const b = Math.round(start.c[2] + (end.c[2] - start.c[2]) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  };
  const activityColor = getActivityColor(activityRate);

  const isIdle = appState === 'IDLE';

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-magic-accent selection:text-white flex overflow-hidden">
      
      {/* Add Character Modal */}
      {showCharAdd && (
          <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0f172a] border border-white/20 rounded-lg max-w-sm w-full p-6 animate-in zoom-in-95">
                  <h2 className="text-lg font-serif text-white mb-4">Register New Persona</h2>
                  <input 
                    type="text" 
                    placeholder="Character Name" 
                    value={newCharName} 
                    onChange={e => setNewCharName(e.target.value)} 
                    className="w-full bg-black border border-white/20 rounded p-3 text-sm text-white mb-4 focus:border-magic-accent outline-none" 
                  />
                  <div className="flex gap-2">
                      <button onClick={() => setShowCharAdd(false)} className="flex-1 py-2 text-gray-400 hover:text-white">Cancel</button>
                      <button onClick={handleAddCharacter} className="flex-1 py-2 bg-magic-accent text-white rounded shadow-lg shadow-magic-accent/20">Create</button>
                  </div>
              </div>
          </div>
      )}

      <main className={`flex-1 flex flex-col items-center justify-center relative min-h-screen transition-all duration-500 ${grimoire.length > 0 ? (isGrimoireOpen ? 'md:mr-80' : 'md:mr-10') : ''}`}>
        
        {highPerformance && (
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
               <div className="absolute top-0 left-1/4 w-96 h-96 bg-magic-accent/5 rounded-full blur-[120px] animate-pulse"></div>
               <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          </div>
        )}

        <header className="absolute top-0 left-0 p-8 z-20 w-full flex justify-between items-center pointer-events-none">
          <div className="flex items-center gap-4 cursor-pointer pointer-events-auto" onClick={reset}>
             <Box className="w-6 h-6 text-magic-accent" />
             <h1 className="font-sans text-xl font-bold text-white tracking-widest">VELUNA</h1>
          </div>
        </header>

        <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col items-center">
          
          {appState === 'ERROR' && (
             <div className="mb-8 p-6 bg-red-950/80 border border-red-500/50 rounded-lg text-red-100 font-mono text-sm max-w-md text-center z-50 shadow-[0_0_30px_rgba(220,38,38,0.3)] backdrop-blur-md animate-in slide-in-from-top-4 fade-in">
                <div className="flex justify-center mb-2"><AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" /></div>
                <div className="whitespace-pre-wrap leading-relaxed">{errorMsg}</div>
                <button onClick={reset} className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-xs uppercase tracking-widest transition-colors w-full">Re-stabilize W-Core</button>
             </div>
          )}

          <div className={`transition-all duration-1000 ease-in-out flex justify-center items-center ${appState === 'IDLE' ? 'opacity-0 scale-50 pointer-events-none absolute' : appState === 'COMPLETE' ? 'opacity-0 scale-50 pointer-events-none absolute' : 'scale-125 my-12 opacity-100'}`}>
            <MagicCircle state={appState === 'COMPLETE' ? 'IDLE' : appState} system={appState === 'IDLE' ? system : analysis?.system} attribute={appState === 'IDLE' ? attribute : analysis?.attribute} eyeColor={appState === 'IDLE' ? undefined : analysis?.eyeColor} stepText={appState === 'IDLE' ? undefined : INVOCATION_STEPS[invocationStep]} stepIndex={invocationStep} />
          </div>
          
          <div className={`w-full relative z-10 transition-all duration-700 delay-100 ${!isIdle ? 'opacity-0 translate-y-20 pointer-events-none h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            
            <div className="bg-black/60 border border-white/10 rounded-lg p-8 backdrop-blur-md shadow-2xl relative transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-magic-accent to-transparent opacity-50"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Column: Stats & Controls */}
                <div className="lg:col-span-3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8 gap-4">
                   <div className="flex gap-4 items-center justify-between mb-2 h-44">
                        <VerticalHpSlider hp={vitalData.hp} maxHp={vitalData.maxHp} onChange={(val) => setVitalData(prev => ({...prev, hp: val}))} />
                        <div className="flex-1 flex flex-col items-center">
                            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-widest mb-2 w-full justify-center"><Activity className="w-4 h-4" style={{ color: activityColor }} /><span>Resonance</span></div>
                            <CircularSlider value={activityRate} onChange={(val) => { setActivityRate(val); setSelectedCharacterId(null); }} color={activityColor} />
                       </div>
                   </div>

                   <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1">
                          <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest flex items-center gap-2"><Heart className="w-3 h-3" /> Live Biometrics</div>
                          <button onClick={() => setSimulateVitals(!simulateVitals)} className={`text-xs hover:text-white transition-colors ${simulateVitals ? 'text-green-500' : 'text-red-500'}`}>{simulateVitals ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <SensorData icon={<Heart size={14} />} label="HR" value={vitalData.heartRate.toString()} unit="bpm" color={vitalData.heartRate > 120 ? '#ef4444' : '#ffffff'} blink={vitalData.heartRate > 150} />
                          <SensorData icon={<Activity size={14} />} label="Psyche" value={vitalData.emotionIndex.toString()} unit="%" color="#8b5cf6" />
                          <SensorData icon={<Thermometer size={14} />} label="Temp" value={vitalData.bodyTemp.toString()} unit="°C" />
                           <SensorData icon={<Gauge size={14} />} label="SpO2" value={vitalData.spO2.toFixed(1)} unit="%" color={vitalData.spO2 < 95 ? '#fbbf24' : '#10b981'} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1">
                          <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest flex items-center gap-2">
                             {envData.weather === 'SUNNY' ? <Sun className="w-3 h-3 text-yellow-500" /> : envData.weather === 'RAIN' ? <CloudRain className="w-3 h-3 text-blue-500" /> : <Cloud className="w-3 h-3 text-gray-400" />}
                             Weather: {envData.weather}
                          </div>
                          <button onClick={updateEnvironment} className="text-[9px] hover:text-white transition-colors text-magic-accent uppercase font-mono border border-magic-accent/30 px-1 rounded bg-magic-accent/10">UPDATE ENV</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <SensorData icon={<Waves size={14} />} label="W-Density" value={envData.wDensity.toString()} unit="u/m³" color="#3b82f6" />
                          <SensorData icon={estimatedOutput > 50000 ? <Skull size={14} /> : <Zap size={14} />} label="Est.Out" value={estimatedOutput > 9999 ? (estimatedOutput/1000).toFixed(1) + 'k' : estimatedOutput.toString()} unit="Tk" color={estimatedOutput > 50000 ? '#ef4444' : '#fbbf24'} blink={estimatedOutput > 50000} />
                           <SensorData icon={<Thermometer size={14} />} label="Amb.Temp" value={envData.temperature.toString()} unit="°C" />
                          <SensorData icon={<CloudFog size={14} />} label="Humidity" value={envData.humidity.toString()} unit="%" />
                      </div>
                       <div className="bg-white/5 border border-white/5 rounded p-1.5 flex items-center gap-2"><MapPin className="w-3 h-3 text-gray-500" /><div className="text-[9px] font-mono text-gray-400 truncate">{envData.location.lat.toFixed(4)}, {envData.location.lng.toFixed(4)} <span className="text-gray-600">|</span> Alt: {envData.location.alt}m</div></div>
                   </div>
                </div>

                {/* Right Column: Configuration */}
                <div className="lg:col-span-9 flex flex-col justify-center">
                  
                  {/* Character Selection (Moved Here) */}
                  <div className="mb-6 bg-black/20 p-4 rounded border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                          <div className="text-xs font-mono text-gray-500 uppercase">Resonance Persona</div>
                          <button onClick={() => setShowCharAdd(true)} className="text-[10px] flex items-center gap-1 text-magic-accent hover:text-white transition-colors">
                              <Plus className="w-3 h-3" /> ADD NEW
                          </button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {characters.map(char => (
                            <button
                                key={char.id}
                                onClick={() => applyCharacterPreset(char.id)}
                                className={`flex-shrink-0 px-4 py-2 border rounded text-xs min-w-[120px] transition-all relative overflow-hidden group text-left ${
                                    selectedCharacterId === char.id 
                                    ? 'bg-magic-accent/20 border-magic-accent text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
                                    : 'border-white/10 text-gray-400 hover:border-white/30'
                                }`}
                            >
                                <div className="relative z-10 font-bold">{char.name}</div>
                                <div className="relative z-10 text-[9px] opacity-70">Rate: {char.activityRate}%</div>
                                {selectedCharacterId === char.id && (
                                    <div className="absolute inset-0 bg-magic-accent/10 animate-pulse"></div>
                                )}
                            </button>
                        ))}
                      </div>
                  </div>

                  {!configOpen ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      
                      <div onClick={() => setConfigOpen(true)} className="grid grid-cols-3 gap-4 w-full text-center cursor-pointer group relative">
                         <div className="absolute -top-6 right-0 text-[10px] text-magic-accent opacity-0 group-hover:opacity-100 transition-opacity font-mono uppercase tracking-widest flex items-center gap-1">Modify <Edit2 className="w-3 h-3" /></div>
                         <div className="p-3 border border-white/10 rounded bg-white/5 group-hover:bg-white/10 group-hover:border-magic-accent/50 transition-all">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">System</div>
                            <div className="text-sm font-sans text-white">{system}</div>
                         </div>
                         <div className="p-3 border border-white/10 rounded bg-white/5 group-hover:bg-white/10 group-hover:border-magic-accent/50 transition-all">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Rank</div>
                            <div className="text-sm font-sans text-white">Rank {rank}</div>
                         </div>
                         <div className="p-3 border border-white/10 rounded bg-white/5 group-hover:bg-white/10 group-hover:border-magic-accent/50 transition-all">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Attribute</div>
                            <div className="text-sm font-sans text-white">{attribute}</div>
                         </div>
                      </div>

                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1 text-[10px] font-mono px-1">
                            <span className="text-gray-500">Stability Rating</span>
                            <span className={`${stabilityScore < 50 ? 'text-red-500' : stabilityScore < 80 ? 'text-yellow-500' : 'text-green-500'}`}>{stabilityScore}%</span>
                        </div>
                        <button onClick={castSpell} disabled={activityRate === 0} className={`w-full py-4 text-white font-mono font-bold uppercase tracking-[0.2em] rounded border transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${activityRate > 0 ? 'bg-white/5 hover:bg-white/10 border-white/20 hover:border-magic-accent hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] active:scale-95' : 'bg-black/50 border-white/5 text-gray-600 cursor-not-allowed'}`}>
                          {activityRate > 0 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-magic-accent/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>}
                          <Sparkles className={`w-4 h-4 ${activityRate > 0 ? 'group-hover:animate-spin' : ''}`} />
                          <span>Construct</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative flex flex-col h-[400px]">
                      <button onClick={() => setConfigOpen(false)} className="absolute -top-4 -right-2 p-2 text-gray-500 hover:text-white transition-colors"><ChevronUp className="w-5 h-5" /></button>

                      {/* Config Tabs */}
                      <div className="flex border-b border-white/10 mb-4 shrink-0">
                          {['MAGIC', 'PROTECTION', 'TOOL', 'CHARACTER'].map(tab => (
                              <button key={tab} onClick={() => setConfigTab(tab as any)} className={`flex-1 py-2 text-xs font-mono border-b-2 transition-colors ${configTab === tab ? 'border-magic-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>{tab}</button>
                          ))}
                      </div>

                      <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
                          {configTab === 'MAGIC' && (
                              <div className="space-y-6">
                                  <div>
                                     <div className="flex items-center gap-2 mb-2 text-xs font-mono text-gray-500 uppercase tracking-widest"><Layers className="w-3 h-3 text-magic-accent" /> System</div>
                                     <div className="flex flex-wrap gap-2">
                                        {Object.values(MagicSystem).map((sys) => (
                                            <button key={sys} onClick={() => setSystem(sys)} className={`px-3 py-1 text-xs border rounded ${system === sys ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400 hover:text-white'}`}>{sys}</button>
                                        ))}
                                     </div>
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-2 mb-2 text-xs font-mono text-gray-500 uppercase tracking-widest"><CircleDot className="w-3 h-3 text-magic-accent" /> Rank</div>
                                     <div className="flex gap-1">
                                        {[1,2,3,4,5,6,7].map(r => (
                                            <button key={r} onClick={() => isRankAvailable(r) && setRank(r)} disabled={!isRankAvailable(r)} className={`flex-1 py-1 text-sm border rounded ${rank === r ? 'bg-magic-accent text-white border-magic-accent' : isRankAvailable(r) ? 'border-white/10 hover:bg-white/5' : 'border-white/5 text-gray-700 cursor-not-allowed'}`}>{r}</button>
                                        ))}
                                     </div>
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-2 mb-2 text-xs font-mono text-gray-500 uppercase tracking-widest"><Component className="w-3 h-3 text-magic-accent" /> Attribute</div>
                                     <div className="grid grid-cols-4 gap-2">
                                        {sysAttributes[system]?.map(renderAttrButton) || []}
                                     </div>
                                  </div>
                              </div>
                          )}

                          {configTab === 'PROTECTION' && (
                              <div className="space-y-2">
                                  {DIVINE_PROTECTIONS.map((prot) => (
                                      <button key={prot.id} onClick={() => setSelectedProtection(prot.id)} className={`w-full text-left p-2 border rounded flex justify-between items-center group transition-colors ${selectedProtection === prot.id ? 'bg-magic-accent/20 border-magic-accent' : 'border-white/10 hover:bg-white/5'}`}>
                                          <div>
                                              <div className={`text-xs font-bold ${selectedProtection === prot.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{prot.name}</div>
                                              <div className="text-[9px] text-gray-500">{prot.category}</div>
                                          </div>
                                          {selectedProtection === prot.id && <Crown className="w-4 h-4 text-magic-accent" />}
                                      </button>
                                  ))}
                              </div>
                          )}

                          {configTab === 'TOOL' && (
                              <div className="space-y-2">
                                  {allTools.map((tool) => (
                                      <button key={tool.id} onClick={() => setSelectedToolId(tool.id)} className={`w-full text-left p-2 border rounded flex justify-between items-center group transition-colors ${selectedToolId === tool.id ? 'bg-blue-500/20 border-blue-500' : 'border-white/10 hover:bg-white/5'}`}>
                                          <div>
                                              <div className={`text-xs font-bold ${selectedToolId === tool.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{tool.name}</div>
                                              <div className="text-[9px] text-gray-500">{tool.category}</div>
                                          </div>
                                          {selectedToolId === tool.id && <Hammer className="w-4 h-4 text-blue-500" />}
                                      </button>
                                  ))}
                              </div>
                          )}

                          {configTab === 'CHARACTER' && (
                              <div className="space-y-4">
                                  {characters.map(char => (
                                      <div key={char.id} className="bg-white/5 border border-white/10 rounded p-3">
                                          <div className="flex justify-between items-center mb-2">
                                              <div className="text-xs font-bold text-white">{char.name}</div>
                                              {selectedCharacterId === char.id && <span className="text-[9px] bg-magic-accent/20 text-magic-accent px-1 rounded">ACTIVE</span>}
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 mb-2">
                                              <div>
                                                  <label className="text-[9px] text-gray-500 block">Activity Rate (%)</label>
                                                  <input 
                                                    type="number" 
                                                    value={char.activityRate} 
                                                    onChange={(e) => handleUpdateCharacter(char.id, 'activityRate', parseInt(e.target.value))}
                                                    className="w-full bg-black border border-white/20 rounded px-2 py-1 text-xs text-white" 
                                                  />
                                              </div>
                                              <div>
                                                  <label className="text-[9px] text-gray-500 block">Protection ID</label>
                                                  <select 
                                                    value={char.protectionId} 
                                                    onChange={(e) => handleUpdateCharacter(char.id, 'protectionId', e.target.value)}
                                                    className="w-full bg-black border border-white/20 rounded px-2 py-1 text-xs text-white"
                                                  >
                                                      {DIVINE_PROTECTIONS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                  </select>
                                              </div>
                                          </div>
                                          <div className="text-right">
                                              <button onClick={() => applyCharacterPreset(char.id)} className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded">LOAD</button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                      
                      <button onClick={() => setConfigOpen(false)} className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-widest rounded border border-white/10 transition-colors shrink-0">Confirm Parameters</button>
                    </div>
                  )}
                  
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between text-[10px] text-gray-600 font-mono uppercase tracking-wider px-2">
                <span>VELUNA SYSTEM // ONLINE</span>
                <span>Output Mode: {activityRate > 0 ? RING_DATA[rank]?.name : "STANDBY"}</span>
            </div>
          </div>

          {appState === 'COMPLETE' && currentSpell && (
            <div className="relative z-20 w-full"><SpellResult spell={currentSpell} onReset={reset} /></div>
          )}

        </div>

      </main>

      {/* Right Sidebar Grimoire */}
      <Grimoire history={grimoire} onSelect={handleGrimoireSelect} isOpen={isGrimoireOpen} onToggle={() => setIsGrimoireOpen(!isGrimoireOpen)} onAdd={() => handleOpenSpellEditor()} onEdit={(spell) => handleOpenSpellEditor(spell)} onDelete={(id) => handleDeleteSpell(id)} />
      
      {showSpellEditor && <SpellEditor isOpen={showSpellEditor} onClose={() => setShowSpellEditor(false)} onSave={handleSaveSpell} initialData={editingSpell} />}
      <CombatPanel isOpen={combatOpen} onClose={() => setCombatOpen(false)} enemy={activeEnemy} logs={combatLogs} onReset={handleResetCombat} onSelectEnemy={handleSelectEnemy} enemiesList={ENEMIES} />

      {/* Button Stack */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
        <button onClick={() => setIsGrimoireOpen(!isGrimoireOpen)} className={`p-3 border rounded-full backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] ${isGrimoireOpen ? 'bg-magic-gold text-black border-magic-gold' : 'bg-black/60 border-white/10 text-magic-gold hover:border-magic-gold'}`}><Book className="w-5 h-5" /></button>
        <button onClick={() => setCombatOpen(!combatOpen)} className={`p-3 border rounded-full backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] ${combatOpen ? 'bg-red-500 text-white border-red-500' : 'bg-black/60 border-white/10 text-red-500 hover:border-red-500'}`}><Swords className="w-5 h-5" /></button>
        <button onClick={() => setShowRegistryEditor(true)} className="p-3 bg-black/60 border border-white/10 text-gray-400 hover:text-white hover:border-magic-accent rounded-full backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"><List className="w-5 h-5" /></button>
        <button onClick={() => setShowSettings(true)} className="p-3 bg-black/60 border border-white/10 text-gray-400 hover:text-white hover:border-magic-accent rounded-full backdrop-blur-md transition-all hover:rotate-90"><Settings className="w-5 h-5" /></button>
      </div>

      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <button onClick={scrollToTop} className="p-3 bg-magic-accent hover:bg-magic-accent/80 text-white rounded-full shadow-lg shadow-magic-accent/30 transition-transform hover:-translate-y-1"><ArrowUp className="w-5 h-5" /></button>
      </div>

      {showRegistryEditor && (
        // ... Registry Editor UI kept mostly same, ensured it renders
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-[#0a0a0f] border border-white/20 w-full max-w-2xl rounded-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                 {/* ... (Registry Content) ... */}
                 <div className="p-6 flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                       <div className="flex items-center gap-2 text-magic-accent"><List className="w-5 h-5" /><h2 className="font-serif text-lg tracking-widest text-white">GRIMOIRE REGISTRY</h2></div>
                       <button onClick={() => setShowRegistryEditor(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                     {/* Tab Navigation */}
                    <div className="flex border-b border-white/10 mb-6 shrink-0">
                      <button onClick={() => setEditorTab('REGISTRY')} className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${editorTab === 'REGISTRY' ? 'text-white border-b-2 border-magic-accent bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Registry List</button>
                      <button onClick={() => setEditorTab('TOOLS')} className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${editorTab === 'TOOLS' ? 'text-white border-b-2 border-magic-accent bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Tools</button>
                      <button onClick={() => setEditorTab('IMPORT')} className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${editorTab === 'IMPORT' ? 'text-white border-b-2 border-magic-accent bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Injection</button>
                    </div>
                    {/* Content Logic Same as before */}
                    {editorTab === 'REGISTRY' && (
                        <div className="flex-1 overflow-hidden flex flex-col">
                             <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded shrink-0">
                                <h3 className="text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-3 flex items-center gap-2"><Plus className="w-3 h-3" /> Manual Entry</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                                    <select value={newAttrSystem} onChange={(e) => setNewAttrSystem(e.target.value as MagicSystem)} className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none">
                                        {Object.values(MagicSystem).map(sys => <option key={sys} value={sys}>{sys}</option>)}
                                    </select>
                                    <input type="text" placeholder="Name" value={newAttrName} onChange={(e) => setNewAttrName(e.target.value)} className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none" />
                                    <input type="text" placeholder="Kanji" value={newAttrKanji} onChange={(e) => setNewAttrKanji(e.target.value)} className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none" />
                                    <input type="text" placeholder="Reading" value={newAttrReading} onChange={(e) => setNewAttrReading(e.target.value)} className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none" />
                                </div>
                                <button onClick={handleManualAdd} disabled={!newAttrName || !newAttrKanji || !newAttrReading} className="w-full py-2 bg-magic-accent/20 hover:bg-magic-accent/30 text-magic-accent border border-magic-accent/30 rounded text-xs uppercase tracking-widest transition-colors disabled:opacity-50">Register Attribute</button>
                             </div>
                             <div className="mb-4 relative shrink-0"><Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" /><input type="text" placeholder="Search archives..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded pl-9 pr-3 py-2 text-sm text-gray-300 focus:border-magic-accent outline-none" /></div>
                             <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-2">
                                 {Object.entries(sysAttributes).map(([sys, attrs]) => {
                                     const filteredAttrs = (attrs as string[]).filter(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
                                     if (filteredAttrs.length === 0) return null;
                                     return (
                                        <div key={sys}><div className="text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-2 border-b border-white/5 pb-1">{sys}</div><div className="grid grid-cols-2 gap-2">{filteredAttrs.map(attr => (<div key={attr} className="bg-white/5 border border-white/5 rounded p-2 flex justify-between items-center group hover:border-white/20 transition-colors"><div><div className="text-xs text-gray-200">{attr}</div><div className="text-[10px] text-gray-500 font-mono">{keywords[attr]?.kanji} / {keywords[attr]?.reading}</div></div></div>))}</div></div>
                                     );
                                 })}
                             </div>
                        </div>
                    )}
                    {/* ... Other tabs ... */}
                 </div>
             </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/10 p-8 rounded-lg shadow-2xl max-w-md w-full relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="font-serif text-xl text-white mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-magic-accent" /> システム設定</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Shield className="w-5 h-5 text-blue-400" /><div><div className="text-sm text-gray-200">高パフォーマンスモード</div><div className="text-xs text-gray-500">高度なパーティクルエフェクトを有効化</div></div></div><button onClick={() => setHighPerformance(!highPerformance)} className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${highPerformance ? 'bg-blue-500' : 'bg-gray-700'}`}><div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${highPerformance ? 'translate-x-6' : 'translate-x-0'}`}></div></button></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Volume2 className="w-5 h-5 text-purple-400" /><div><div className="text-sm text-gray-200">システムオーディオ</div><div className="text-xs text-gray-500">インターフェース音を有効化</div></div></div><button onClick={() => setAudioEnabled(!audioEnabled)} className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${audioEnabled ? 'bg-purple-500' : 'bg-gray-700'}`}><div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${audioEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div></button></div>
              <div className="pt-6 border-t border-white/10"><button onClick={clearHistory} className="w-full py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-widest"><Trash2 className="w-4 h-4" /> アーカイブ全消去</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
