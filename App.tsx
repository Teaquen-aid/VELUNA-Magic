import React, { useState, useRef, useEffect } from 'react';
import { constructSpell, extendAttributeKeywords, ATTRIBUTE_KEYWORDS, DIVINE_PROTECTIONS, getTools, registerTool, PREDEFINED_GRIMOIRE, DEFAULT_TOOLS, ENEMIES, CHARACTER_PRESETS } from './services/geminiService';
import { AppState, ManifestedSpell, SpellAnalysis, INVOCATION_STEPS, MagicSystem, SYSTEM_ATTRIBUTES, RING_DATA, CasterStatus, SpellEnvironment, ToolDef, EnemyDef, CombatLogEntry, GameMode, BattlePhase } from './types';
import MagicCircle from './components/MagicCircle';
import SpellResult from './components/SpellResult';
import Grimoire from './components/Grimoire';
import SpellEditor from './components/SpellEditor';
import CombatPanel from './components/CombatPanel';
import { Box, CircleDot, Layers, Component, Sparkles, Activity, Settings, X, Shield, Trash2, Volume2, Edit2, ChevronUp, Waves, Zap, Upload, List, Plus, Search, Crown, Heart, Thermometer, CloudFog, MapPin, Gauge, Hammer, Pause, Play, Book, Skull, ArrowUp, AlertTriangle, Swords, User, Scale, RefreshCw, Hand, Briefcase, PlayCircle } from 'lucide-react';

const FAILURE_REASONS = [
  "術式回路の臨界崩壊 (Circuit Criticality Collapse)",
  "W粒子同調率の不足 (Insufficient W-Particle Sync)",
  "精神感応ノイズの干渉 (Psychic Noise Interference)",
  "マナ供給パスの遮断 (Mana Supply Interrupted)",
  "無意識領域による拒絶 (Subconscious Rejection)"
];

// Vertical HP Slider
const VerticalHpSlider: React.FC<{ hp: number; maxHp: number; onChange?: (val: number) => void; readonly?: boolean }> = ({ hp, maxHp, onChange, readonly }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const hpPercentage = Math.min(100, Math.max(0, (hp / maxHp) * 100));
    const isCrisis = hpPercentage <= 5;

    let colorClass = "bg-green-500/80 shadow-[0_0_10px_#22c55e]";
    if (hpPercentage <= 5) colorClass = "bg-red-600/90 animate-pulse shadow-[0_0_15px_#dc2626]";
    else if (hpPercentage <= 20) colorClass = "bg-red-500/80 shadow-[0_0_10px_#ef4444]";
    else if (hpPercentage <= 50) colorClass = "bg-yellow-500/80 shadow-[0_0_10px_#eab308]";

    const handleInteraction = (clientY: number) => {
        if (!sliderRef.current || readonly || !onChange) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const height = rect.height;
        const bottom = rect.bottom;
        const delta = bottom - clientY;
        const rawPercent = Math.min(100, Math.max(0, (delta / height) * 100));
        const newVal = Math.round((rawPercent / 100) * maxHp);
        onChange(newVal);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if(readonly) return;
        setIsDragging(true);
        handleInteraction(e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if(readonly) return;
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
                className={`relative flex-1 w-4 bg-gray-900 border border-white/10 rounded-full overflow-hidden group ${readonly ? '' : 'cursor-ns-resize'}`}
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
                {!readonly && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>}
            </div>
            <div className={`text-[10px] font-mono font-bold ${isCrisis ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                {hp}
            </div>
        </div>
    );
};

// Circular Output Gauge
const OutputGauge: React.FC<{ value: number; color: string; label: string }> = ({ value, color, label }) => {
  const size = 160; 
  const strokeWidth = 8;
  const padding = 20; 
  const radius = (size - strokeWidth - padding) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const [intPart, decPart] = value.toFixed(1).split('.');

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
       <svg width={size} height={size} className="transform -rotate-90 pointer-events-none overflow-visible">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-300 ease-out" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
       </svg>
       <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">{label}</div>
          <div className="flex items-baseline justify-center font-mono font-bold transition-colors duration-300 drop-shadow-md tracking-tighter" style={{ color: color }}>
             <span className="text-4xl">{intPart}</span>
             <span className="text-xl">.{decPart}</span>
             <span className="text-xs opacity-50 ml-1">%</span>
          </div>
       </div>
    </div>
  );
};

// SYNC SLIDER COMPONENT (Modified for Dual Mode)
const SyncSlider: React.FC<{ value: number; onChange: (val: number) => void; mode: GameMode }> = ({ value, onChange, mode }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleInteraction = (clientX: number) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const rawPercent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        onChange(rawPercent);
    };

    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); handleInteraction(e.clientX); };
    const handleTouchStart = (e: React.TouchEvent) => { setIsDragging(true); handleInteraction(e.touches[0].clientX); };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => { if (isDragging) { e.preventDefault(); handleInteraction(e.clientX); } };
        const handleTouchMove = (e: TouchEvent) => { if (isDragging) { e.preventDefault(); handleInteraction(e.touches[0].clientX); } };
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

    let modeLabel = "BALANCED";
    let modeColor = "text-white";
    
    // Different Labels for Battle Mode
    if (mode === 'BATTLE') {
        if (value < 0.35) { modeLabel = "ATTACK STANCE"; modeColor = "text-red-500"; }
        else if (value > 0.65) { modeLabel = "RECOVERY STANCE"; modeColor = "text-green-400"; }
        else { modeLabel = "DEFENSE STANCE"; modeColor = "text-blue-400"; }
    } else {
        if (value < 0.3) { modeLabel = "OVERDRIVE"; modeColor = "text-red-500"; }
        else if (value > 0.7) { modeLabel = "RESONANCE"; modeColor = "text-green-400"; }
        else { modeLabel = "EQUILIBRIUM"; modeColor = "text-blue-400"; }
    }

    return (
        <div className="w-full mt-4 select-none">
            <div className="flex justify-between items-end mb-2 px-1">
                <div className={`text-[10px] font-mono tracking-widest flex items-center gap-2 ${modeColor}`}>
                    <Scale className="w-3 h-3" /> {modeLabel}
                </div>
                <div className="text-[9px] text-gray-500 font-mono">
                    {(value * 100).toFixed(1)}% SYNC
                </div>
            </div>
            <div 
                ref={sliderRef}
                className="relative h-8 bg-black/40 border border-white/10 rounded cursor-crosshair group overflow-hidden"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 via-blue-900/30 to-green-900/40 opacity-50"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20"></div>
                <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_white] transition-transform duration-75"
                    style={{ left: `${value * 100}%`, transform: 'translateX(-50%)' }}
                ></div>
                
                {mode === 'BATTLE' ? (
                    <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none text-[8px] font-mono font-bold text-white/30">
                        <span>ATK</span>
                        <span>DEF</span>
                        <span>REC</span>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none text-[8px] font-mono font-bold text-white/30">
                        <span>POWER</span>
                        <span>STABLE</span>
                        <span>ADAPT</span>
                    </div>
                )}
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
  // Global State
  const [gameMode, setGameMode] = useState<GameMode>('SIMULATION');
  const [appState, setAppState] = useState<AppState>('IDLE');
  
  // Battle State
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('SETUP');
  const [battleLogs, setBattleLogs] = useState<CombatLogEntry[]>([]);
  
  // Magic Core
  const [currentSpell, setCurrentSpell] = useState<ManifestedSpell | null>(null);
  const [grimoire, setGrimoire] = useState<ManifestedSpell[]>([]);
  const [analysis, setAnalysis] = useState<SpellAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invocationStep, setInvocationStep] = useState<number>(0);
  
  // UI Panels
  const [showSettings, setShowSettings] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showRegistryEditor, setShowRegistryEditor] = useState(false);
  const [showSpellEditor, setShowSpellEditor] = useState(false);
  const [editingSpell, setEditingSpell] = useState<ManifestedSpell | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [configTab, setConfigTab] = useState<'MAGIC' | 'PROTECTION' | 'TOOL'>('MAGIC');
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  const [combatOpen, setCombatOpen] = useState(false); // Legacy Combat Panel (Might disable in Battle Mode)

  // Simulation Data
  const [simulateVitals, setSimulateVitals] = useState(true);
  const [envData, setEnvData] = useState<SpellEnvironment>({
    location: { lat: 35.6895, lng: 139.6917, alt: 45 },
    temperature: 24.5,
    humidity: 55,
    wDensity: 4500
  });
  const [vitalData, setVitalData] = useState<CasterStatus>({
    hp: 100, maxHp: 100, heartRate: 72, bodyTemp: 36.6, bloodPressure: "118/76", respiration: 16, spO2: 98.5, consciousnessLevel: "Clear", emotionIndex: 45
  });

  // Settings
  const [highPerformance, setHighPerformance] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Selection & Input
  const [syncRate, setSyncRate] = useState<number>(0.5); 
  const [rank, setRank] = useState<number>(1);
  const [system, setSystem] = useState<MagicSystem>(MagicSystem.ELEMENTAL);
  const [attribute, setAttribute] = useState<string>(SYSTEM_ATTRIBUTES[MagicSystem.ELEMENTAL][0]);
  const [selectedProtection, setSelectedProtection] = useState<string>('none');
  const [selectedToolId, setSelectedToolId] = useState<string>('tool_none');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [activeSpellId, setActiveSpellId] = useState<string | null>(null); 
  const [activeEnemy, setActiveEnemy] = useState<EnemyDef>(ENEMIES[0]);

  // Derived
  const activityDisplay = Math.round((1.0 - (syncRate * 0.7)) * 100);
  const [sysAttributes, setSysAttributes] = useState<Record<MagicSystem, string[]>>(SYSTEM_ATTRIBUTES);
  const [keywords, setKeywords] = useState(ATTRIBUTE_KEYWORDS);
  const [allTools, setAllTools] = useState<ToolDef[]>([]);

  // Init
  useEffect(() => {
    setAllTools(getTools());
    // Predefined Grimoire load...
  }, []);

  const updateEnvironment = () => {
      setEnvData({
          location: { lat: 35 + (Math.random() - 0.5) * 10, lng: 139 + (Math.random() - 0.5) * 10, alt: Math.floor(Math.random() * 1000) },
          temperature: parseFloat((Math.random() * 60 - 10).toFixed(1)),
          humidity: Math.floor(Math.random() * 100),
          wDensity: Math.floor(Math.random() * 8000) + 1000
      });
  };

  // Vitals Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (simulateVitals) {
        setVitalData(prev => {
            const hpRatio = prev.hp / prev.maxHp;
            const syncStress = (1.0 - syncRate) * 40; 
            let baseHr = 60 + syncStress;
            if (hpRatio < 0.2) baseHr += 40; 
            const newHr = Math.max(30, Math.min(220, baseHr + Math.floor(Math.random() * 10 - 5)));
            const tempRise = (1.0 - syncRate) * 0.5;
            const newTemp = parseFloat((Math.max(35.5, Math.min(42.0, 36.5 + tempRise + (Math.random() * 0.2 - 0.1))).toFixed(1)));
            const newEmotion = Math.max(0, Math.min(100, (hpRatio < 0.3 ? 80 : 40 + syncStress) + Math.floor(Math.random() * 20 - 10)));
            return { ...prev, heartRate: newHr, bodyTemp: newTemp, emotionIndex: newEmotion };
        });
      }
    }, 1500); 
    return () => clearInterval(interval);
  }, [simulateVitals, syncRate]);

  // --- BATTLE LOGIC ---
  const startBattle = () => {
      setVitalData(prev => ({ ...prev, hp: prev.maxHp })); // Heal to full
      setActiveEnemy(prev => ({ ...prev, currentHp: prev.maxHp })); // Reset Enemy
      setBattleLogs([{ id: 'init', timestamp: Date.now(), message: `Battle Started against ${activeEnemy.name}.` }]);
      setBattlePhase('PLAYER_TURN');
      setConfigOpen(false);
  };

  const executePlayerTurn = async () => {
      if (battlePhase !== 'PLAYER_TURN') return;

      // 1. Determine Action based on Sync Slider
      let actionType = 'DEFEND';
      if (syncRate < 0.35) actionType = 'ATTACK';
      else if (syncRate > 0.65) actionType = 'RECOVER';

      // 2. Visual Casting
      setAppState('MANIFESTING');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAppState('IDLE');

      // 3. Effect Calculation
      const logId = Date.now().toString();
      let damage = 0;
      let logs = [...battleLogs];

      if (actionType === 'ATTACK') {
          const hits = Math.floor(Math.random() * 3) + 1; // 1-3 hits
          const baseDmg = 100 * (1 + (1-syncRate)*2); // Higher dmg on left
          const rankMult = rank * 0.5;
          const totalDmg = Math.floor(baseDmg * hits * rankMult);
          
          setActiveEnemy(prev => ({ ...prev, currentHp: Math.max(0, prev.currentHp - totalDmg) }));
          logs.push({ id: logId, timestamp: Date.now(), message: `You cast ${attribute} Magic! ${hits} Hits! Dealt ${totalDmg} damage.`, source: 'PLAYER', damage: totalDmg, effectiveness: 'SUPER' });
      } else if (actionType === 'RECOVER') {
          const healAmount = Math.floor(vitalData.maxHp * 0.2);
          setVitalData(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) }));
          logs.push({ id: logId, timestamp: Date.now(), message: `You focused on recovery. Healed ${healAmount} HP.`, source: 'PLAYER', effectiveness: 'HEAL' });
      } else {
          logs.push({ id: logId, timestamp: Date.now(), message: `You adopted a defensive stance. Evasion UP.`, source: 'PLAYER', effectiveness: 'BUFF' });
      }

      setBattleLogs(logs);

      // Check Win
      if (activeEnemy.currentHp <= 0 || (actionType === 'ATTACK' && logs[logs.length-1].damage && activeEnemy.currentHp - logs[logs.length-1].damage! <= 0)) {
           setBattlePhase('VICTORY');
           setBattleLogs(prev => [...prev, { id: 'win', timestamp: Date.now(), message: 'VICTORY! Enemy defeated.', effectiveness: 'SUPER' }]);
           return;
      }

      // 4. Proceed to Enemy Turn
      setBattlePhase('ENEMY_TURN');
      setTimeout(executeEnemyTurn, 1500);
  };

  const executeEnemyTurn = () => {
      if (battlePhase !== 'VICTORY' && battlePhase !== 'DEFEAT') {
          const enemyDmg = Math.floor(activeEnemy.attackPower * (Math.random() * 0.4 + 0.8));
          // Defense Mitigation
          let takenDmg = enemyDmg;
          let defended = false;
          
          // Defense Stance Mitigation
          if (syncRate >= 0.35 && syncRate <= 0.65) {
              takenDmg = Math.floor(enemyDmg * 0.5);
              defended = true;
          }

          setVitalData(prev => ({ ...prev, hp: Math.max(0, prev.hp - takenDmg) }));
          
          setBattleLogs(prev => [...prev, { 
              id: `enemy_${Date.now()}`, 
              timestamp: Date.now(), 
              message: `${activeEnemy.name} attacks! You took ${takenDmg} damage.${defended ? ' (Guarded)' : ''}`, 
              source: 'ENEMY', 
              damage: takenDmg,
              effectiveness: defended ? 'POOR' : 'NORMAL'
          }]);

          if (vitalData.hp - takenDmg <= 0) {
              setBattlePhase('DEFEAT');
              setBattleLogs(prev => [...prev, { id: 'lose', timestamp: Date.now(), message: 'DEFEAT... Vital signals lost.', effectiveness: 'POOR' }]);
          } else {
              setBattlePhase('PLAYER_TURN');
          }
      }
  };

  // Helper for Presets
  const applyCharacterPreset = (charId: string) => {
    const char = CHARACTER_PRESETS.find(c => c.id === charId);
    if (char) {
        setSelectedProtection(char.protectionId);
        setSyncRate(1.0 - (char.activityRate / 100)); // Map activity to sync position roughly
        setSelectedCharacterId(charId);
    }
  };

  // Calculate Theoretical Output (Simulation)
  const calculateOutput = () => {
    const attackMult = 1.0 + ((1.0 - syncRate) * 2.0);
    const baseOutput = envData.wDensity * attackMult;
    const rankMult = Math.pow(1.6, rank - 1); 
    const hpRatio = vitalData.hp / vitalData.maxHp;
    const crisisMult = (hpRatio <= 0.05 && hpRatio > 0) ? 3.0 : (0.5 + hpRatio * 0.5);
    return Math.floor(baseOutput * rankMult * crisisMult);
  };
  const estimatedOutput = calculateOutput();

  const castSpell = async () => {
      // Simulation Mode Cast
      setAppState('ANALYZING');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAppState('MANIFESTING');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis = await constructSpell(rank, system, attribute, selectedProtection, selectedToolId, envData, vitalData, syncRate);
      setCurrentSpell({ ...analysis, id: 'SIM', timestamp: Date.now() });
      setAppState('COMPLETE');
  };

  const getActivityColor = (rate: number) => {
    // ... gradient logic ...
    return `hsl(${rate * 1.2}, 70%, 50%)`; // simplified for brevity
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-magic-accent selection:text-white flex overflow-hidden">
      
      {/* Mode Toggle (Top Right) */}
      <div className="fixed top-6 right-6 z-50 flex bg-black/60 border border-white/10 rounded-full p-1 backdrop-blur-md">
          <button 
             onClick={() => setGameMode('SIMULATION')}
             className={`px-4 py-2 text-xs font-mono rounded-full transition-all ${gameMode === 'SIMULATION' ? 'bg-magic-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
             SIMULATION
          </button>
          <button 
             onClick={() => setGameMode('BATTLE')}
             className={`px-4 py-2 text-xs font-mono rounded-full transition-all ${gameMode === 'BATTLE' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
             BATTLE
          </button>
      </div>

      <main className={`flex-1 flex flex-col items-center justify-center relative min-h-screen transition-all duration-500`}>
        
        {/* Background */}
        {highPerformance && (
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
               <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] animate-pulse ${gameMode === 'BATTLE' ? 'bg-red-900/10' : 'bg-magic-accent/5'}`}></div>
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          </div>
        )}

        {/* Header */}
        <header className="absolute top-0 left-0 p-8 z-20 w-full flex justify-between items-center pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto" onClick={() => setAppState('IDLE')}>
             <Box className="w-6 h-6 text-magic-accent" />
             <h1 className="font-sans text-xl font-bold text-white tracking-widest">VELUNA</h1>
          </div>
        </header>

        {/* Center Stage */}
        <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col items-center">
          
          {/* Magic Circle (Shared) */}
          <div className={`transition-all duration-1000 ease-in-out flex justify-center items-center ${appState === 'IDLE' && gameMode === 'BATTLE' && battlePhase !== 'SETUP' ? 'scale-75 opacity-100' : 'scale-125 my-12 opacity-100'}`}>
            <MagicCircle state={appState === 'COMPLETE' ? 'IDLE' : appState} system={system} attribute={attribute} stepIndex={invocationStep} />
          </div>
          
          {/* BATTLE MODE INTERFACE */}
          {gameMode === 'BATTLE' && (
              <div className="w-full grid grid-cols-12 gap-6 mt-8">
                  {battlePhase === 'SETUP' ? (
                      <div className="col-span-12 md:col-start-4 md:col-span-6 bg-black/80 border border-white/10 rounded-lg p-8 backdrop-blur-md text-center">
                          <h2 className="text-xl font-serif text-red-500 mb-6 flex items-center justify-center gap-2"><Swords /> BATTLE SETUP</h2>
                          
                          {/* Character Select */}
                          <div className="mb-6">
                              <div className="text-xs text-gray-500 font-mono mb-2 uppercase">Select Persona</div>
                              <div className="flex gap-2 justify-center">
                                  {CHARACTER_PRESETS.map(c => (
                                      <button key={c.id} onClick={() => applyCharacterPreset(c.id)} className={`px-4 py-2 border rounded ${selectedCharacterId === c.id ? 'bg-white text-black' : 'border-white/20'}`}>{c.name}</button>
                                  ))}
                              </div>
                          </div>

                          {/* Enemy Select */}
                          <div className="mb-6">
                              <div className="text-xs text-gray-500 font-mono mb-2 uppercase">Target Hostile</div>
                              <select className="w-full bg-black border border-white/20 p-2 rounded text-white" onChange={(e) => setActiveEnemy(ENEMIES.find(en => en.id === e.target.value) || ENEMIES[0])}>
                                  {ENEMIES.map(e => <option key={e.id} value={e.id}>{e.name} (ATK: {e.attackPower})</option>)}
                              </select>
                          </div>

                          <button onClick={startBattle} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-mono font-bold tracking-widest rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all">
                              INITIATE COMBAT
                          </button>
                      </div>
                  ) : (
                      <>
                        {/* Left: Player Controls */}
                        <div className="col-span-12 md:col-span-4 bg-black/60 border border-white/10 rounded-lg p-6 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-mono text-gray-400">PLAYER STATUS</span>
                                <span className={`${vitalData.hp < 30 ? 'text-red-500' : 'text-green-500'} font-mono font-bold`}>{vitalData.hp}/{vitalData.maxHp} HP</span>
                            </div>
                            <div className="h-4 w-full bg-gray-900 rounded-full overflow-hidden border border-white/10 mb-6">
                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(vitalData.hp/vitalData.maxHp)*100}%` }}></div>
                            </div>

                            <SyncSlider value={syncRate} onChange={setSyncRate} mode='BATTLE' />
                            
                            <div className="mt-6">
                                <button 
                                    onClick={executePlayerTurn}
                                    disabled={battlePhase !== 'PLAYER_TURN'}
                                    className={`w-full py-6 text-xl font-mono font-bold tracking-widest rounded border transition-all
                                        ${battlePhase === 'PLAYER_TURN' 
                                            ? 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                                            : 'bg-black/50 border-white/5 text-gray-600 cursor-not-allowed'}`}
                                >
                                    {battlePhase === 'PLAYER_TURN' ? 'EXECUTE ACTION' : 'WAITING...'}
                                </button>
                            </div>
                        </div>

                        {/* Right: Enemy & Log */}
                        <div className="col-span-12 md:col-span-8 flex flex-col gap-4">
                            {/* Enemy Status */}
                            <div className="bg-black/60 border border-red-900/30 rounded-lg p-6 backdrop-blur-md flex justify-between items-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent pointer-events-none"></div>
                                <div>
                                    <div className="text-[10px] font-mono text-red-400 uppercase mb-1">Target</div>
                                    <div className="text-2xl font-serif text-white">{activeEnemy.name}</div>
                                    <div className="text-sm text-gray-400">{activeEnemy.attribute} Class</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-mono font-bold text-red-500">{activeEnemy.currentHp}</div>
                                    <div className="text-[10px] text-gray-500">INTEGRITY</div>
                                </div>
                            </div>

                            {/* Battle Log */}
                            <div className="flex-1 bg-black/40 border border-white/10 rounded-lg p-4 h-64 overflow-y-auto scrollbar-hide font-mono text-xs space-y-2">
                                {battleLogs.length === 0 && <div className="text-gray-600 text-center mt-10">Combat initialized.</div>}
                                {battleLogs.map(log => (
                                    <div key={log.id} className={`p-2 rounded border-l-2 ${log.source === 'PLAYER' ? 'border-blue-500 bg-blue-900/10' : 'border-red-500 bg-red-900/10'}`}>
                                        <span className="text-gray-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString([], {hour12:false, minute:'2-digit', second:'2-digit'})}]</span>
                                        <span className={log.effectiveness === 'SUPER' ? 'text-yellow-200' : 'text-gray-300'}>{log.message}</span>
                                    </div>
                                ))}
                                {battlePhase === 'VICTORY' && (
                                    <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-200 text-center font-bold text-lg animate-pulse">
                                        MISSION ACCOMPLISHED
                                    </div>
                                )}
                                {battlePhase === 'DEFEAT' && (
                                    <div className="mt-4 p-4 bg-red-600/20 border border-red-600 text-red-200 text-center font-bold text-lg">
                                        SIGNAL LOST
                                    </div>
                                )}
                            </div>
                            
                            {(battlePhase === 'VICTORY' || battlePhase === 'DEFEAT') && (
                                <button onClick={() => setBattlePhase('SETUP')} className="py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-sm uppercase tracking-widest transition-colors">
                                    Return to Setup
                                </button>
                            )}
                        </div>
                      </>
                  )}
              </div>
          )}

          {/* SIMULATION MODE INTERFACE */}
          {gameMode === 'SIMULATION' && (
            <div className={`w-full relative z-10 transition-all duration-700 delay-100 ${appState !== 'IDLE' && appState !== 'COMPLETE' ? 'opacity-0 translate-y-20 pointer-events-none h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            
            <div className="bg-black/60 border border-white/10 rounded-lg p-8 backdrop-blur-md shadow-2xl relative transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Column: Activity Rate & Sensor Data */}
                <div className="lg:col-span-3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8 gap-4">
                   <div className="flex gap-4 items-center justify-between mb-2 h-44">
                        <VerticalHpSlider hp={vitalData.hp} maxHp={vitalData.maxHp} onChange={(val) => setVitalData(prev => ({...prev, hp: val}))} />
                        <div className="flex-1 flex flex-col items-center">
                            <OutputGauge value={activityDisplay} color={getActivityColor(activityDisplay)} label="OUTPUT" />
                       </div>
                   </div>
                   <SyncSlider value={syncRate} onChange={setSyncRate} mode='SIMULATION' />
                   {/* Sensors... (Condensed for brevity, reuse component) */}
                   <div className="grid grid-cols-2 gap-2 mt-4">
                      <SensorData icon={<Heart size={14} />} label="HR" value={vitalData.heartRate.toString()} unit="bpm" />
                      <SensorData icon={<Activity size={14} />} label="Psyche" value={vitalData.emotionIndex.toString()} unit="%" />
                      <SensorData icon={<Waves size={14} />} label="W-Density" value={envData.wDensity.toString()} unit="u/m³" />
                      <SensorData icon={<Zap size={14} />} label="Est.Out" value={estimatedOutput.toString()} />
                   </div>
                   <div className="flex justify-between items-center text-[9px] text-gray-500 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2"><MapPin size={12}/> {envData.location.lat.toFixed(2)}, {envData.location.lng.toFixed(2)}</div>
                        <button onClick={updateEnvironment}><RefreshCw size={12} /></button>
                   </div>
                </div>

                {/* Right Column: Configuration */}
                <div className="lg:col-span-9 flex flex-col justify-center">
                  {!configOpen ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6">
                      <div onClick={() => setConfigOpen(true)} className="grid grid-cols-3 gap-4 w-full text-center cursor-pointer group relative">
                         <div className="p-3 border border-white/10 rounded bg-white/5 group-hover:border-magic-accent/50 transition-all">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">System</div>
                            <div className="text-sm font-sans text-white">{system}</div>
                         </div>
                         <div className="p-3 border border-white/10 rounded bg-white/5 group-hover:border-magic-accent/50 transition-all">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Rank</div>
                            <div className="text-sm font-sans text-white">Rank {rank}</div>
                         </div>
                         <div className="p-3 border border-white/10 rounded bg-white/5 group-hover:border-magic-accent/50 transition-all">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Attribute</div>
                            <div className="text-sm font-sans text-white">{attribute}</div>
                         </div>
                      </div>
                      <button onClick={castSpell} className="w-full py-4 text-white font-mono font-bold uppercase tracking-[0.2em] rounded border bg-white/5 hover:bg-white/10 border-white/20 hover:border-magic-accent transition-all flex items-center justify-center gap-3">
                          <Sparkles className="w-4 h-4" /> <span>Construct</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex flex-col h-full">
                      <button onClick={() => setConfigOpen(false)} className="absolute -top-4 -right-2 p-2 text-gray-500 hover:text-white"><ChevronUp className="w-5 h-5" /></button>
                      
                      {/* Character Presets */}
                      <div className="mb-4">
                          <div className="text-xs font-mono text-gray-500 mb-2">RESONANCE PERSONA</div>
                          <div className="flex gap-2">
                            {CHARACTER_PRESETS.map(c => (
                                <button key={c.id} onClick={() => applyCharacterPreset(c.id)} className={`flex-1 py-2 border rounded text-xs ${selectedCharacterId === c.id ? 'bg-magic-accent/20 border-magic-accent text-white' : 'border-white/10 text-gray-400'}`}>
                                    {c.name}
                                </button>
                            ))}
                          </div>
                      </div>

                      {/* Tabs */}
                      <div className="flex border-b border-white/10 mb-4">
                          {['MAGIC', 'PROTECTION', 'TOOL'].map(tab => (
                              <button key={tab} onClick={() => setConfigTab(tab as any)} className={`flex-1 py-2 text-xs font-mono border-b-2 transition-colors ${configTab === tab ? 'border-magic-accent text-white' : 'border-transparent text-gray-500'}`}>{tab}</button>
                          ))}
                      </div>

                      {/* Tab Content */}
                      <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-hide">
                          {configTab === 'MAGIC' && (
                              <div className="space-y-4">
                                  <div className="flex flex-wrap gap-2">
                                      {Object.values(MagicSystem).map(s => (
                                          <button key={s} onClick={() => setSystem(s)} className={`px-3 py-1 text-xs border rounded ${system === s ? 'bg-white text-black' : 'border-white/20 text-gray-400'}`}>{s}</button>
                                      ))}
                                  </div>
                                  <div className="flex gap-1">
                                      {[1,2,3,4,5,6,7].map(r => <button key={r} onClick={() => setRank(r)} className={`flex-1 py-1 text-sm border rounded ${rank === r ? 'bg-magic-accent border-magic-accent' : 'border-white/10'}`}>{r}</button>)}
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                      {sysAttributes[system]?.map(a => <button key={a} onClick={() => setAttribute(a)} className={`py-1 text-[10px] border rounded ${attribute === a ? 'bg-magic-accent/20 border-magic-accent' : 'border-white/10'}`}>{a}</button>)}
                                  </div>
                              </div>
                          )}
                          {configTab === 'PROTECTION' && (
                              <div className="space-y-2">
                                  {DIVINE_PROTECTIONS.map(p => (
                                      <button key={p.id} onClick={() => setSelectedProtection(p.id)} className={`w-full text-left p-2 border rounded ${selectedProtection === p.id ? 'bg-magic-accent/20 border-magic-accent' : 'border-white/10'}`}>
                                          <div className="text-sm font-bold">{p.name}</div>
                                          <div className="text-[10px] text-gray-400">{p.description}</div>
                                      </button>
                                  ))}
                              </div>
                          )}
                          {configTab === 'TOOL' && (
                              <div className="space-y-2">
                                  {allTools.map(t => (
                                      <button key={t.id} onClick={() => setSelectedToolId(t.id)} className={`w-full text-left p-2 border rounded ${selectedToolId === t.id ? 'bg-blue-500/20 border-blue-500' : 'border-white/10'}`}>
                                          <div className="text-sm font-bold">{t.name}</div>
                                          <div className="text-[10px] text-gray-400">{t.description}</div>
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                      
                      <button onClick={() => setConfigOpen(false)} className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-widest rounded border border-white/10">Confirm</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Spell Result (Simulation Only) */}
          {gameMode === 'SIMULATION' && appState === 'COMPLETE' && currentSpell && (
            <div className="relative z-20 w-full mt-4">
               <SpellResult spell={currentSpell} onReset={() => setAppState('IDLE')} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}