import React, { useState, useRef, useEffect } from 'react';
import { constructSpell, extendAttributeKeywords, ATTRIBUTE_KEYWORDS, DIVINE_PROTECTIONS, getTools, registerTool, PREDEFINED_GRIMOIRE, DEFAULT_TOOLS } from './services/geminiService';
import { AppState, ManifestedSpell, SpellAnalysis, INVOCATION_STEPS, MagicSystem, SYSTEM_ATTRIBUTES, RING_DATA, CasterStatus, SpellEnvironment, ToolDef } from './types';
import MagicCircle from './components/MagicCircle';
import SpellResult from './components/SpellResult';
import Grimoire from './components/Grimoire';
import SpellEditor from './components/SpellEditor';
import { Box, CircleDot, Layers, Component, Sparkles, Activity, Settings, X, Shield, Trash2, Volume2, Edit2, ChevronUp, Waves, Zap, Upload, List, Plus, Search, Crown, Heart, Thermometer, CloudFog, MapPin, Gauge, Hammer, Pause, Play, Book, Skull, ArrowUp } from 'lucide-react';

// Vertical HP Slider Component
const VerticalHpSlider: React.FC<{ hp: number; maxHp: number; onChange: (val: number) => void }> = ({ hp, maxHp, onChange }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const hpPercentage = Math.min(100, Math.max(0, (hp / maxHp) * 100));
    const isCrisis = hpPercentage <= 5;

    // Color Logic
    let colorClass = "bg-green-500 shadow-[0_0_10px_#22c55e]";
    if (hpPercentage <= 5) colorClass = "bg-red-600 animate-pulse shadow-[0_0_15px_#dc2626]";
    else if (hpPercentage <= 20) colorClass = "bg-red-500 shadow-[0_0_10px_#ef4444]";
    else if (hpPercentage <= 50) colorClass = "bg-yellow-500 shadow-[0_0_10px_#eab308]";

    const handleInteraction = (clientY: number) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const height = rect.height;
        const bottom = rect.bottom;
        
        // Calculate raw position from bottom
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
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_10px]"></div>
                
                {/* Bar */}
                <div 
                    className={`absolute bottom-0 w-full transition-all duration-100 ease-out ${colorClass}`}
                    style={{ height: `${hpPercentage}%` }}
                ></div>

                {/* Threshold Marker (5%) */}
                <div className="absolute bottom-[5%] w-full h-[1px] bg-red-500 z-10 opacity-50"></div>
                
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            <div className={`text-[10px] font-mono font-bold ${isCrisis ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                {hp}
            </div>
        </div>
    );
};

// Circular Slider Component (Updated: Larger Integer Font)
const CircularSlider: React.FC<{ value: number; onChange: (val: number) => void; color: string }> = ({ value, onChange, color }) => {
  const circleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!circleRef.current) return;
    const rect = circleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center
    const deltaX = clientX - centerX;
    const deltaY = centerY - clientY; 
    
    let angle = Math.atan2(deltaX, deltaY); 
    let degree = angle * (180 / Math.PI);
    
    if (degree < 0) degree += 360;
    
    // Calculate value 0-100 with 1 decimal precision
    const rawValue = (degree / 360) * 100;
    const newValue = Math.min(100, Math.max(0, Math.round(rawValue * 10) / 10));
    
    onChange(newValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleInteraction(e.clientX, e.clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
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

  // Dimensions
  const size = 160; // Slightly smaller to fit layout
  const strokeWidth = 8;
  const padding = 20; 
  const radius = (size - strokeWidth - padding) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Split value for styling
  const [intPart, decPart] = value.toFixed(1).split('.');

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
       {/* Input Area */}
       <div 
         ref={circleRef}
         className="absolute inset-0 rounded-full z-20 cursor-pointer"
         onMouseDown={handleMouseDown}
         onTouchStart={handleTouchStart}
       ></div>

       {/* SVG Ring */}
       <svg width={size} height={size} className="transform -rotate-90 pointer-events-none overflow-visible">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-100 ease-out"
            style={{ filter: `drop-shadow(0 0 15px ${color})` }}
          />
       </svg>

       {/* Center Content (Number Only) */}
       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex items-baseline justify-center font-mono font-bold transition-colors duration-300 drop-shadow-md tracking-tighter" style={{ color: color }}>
             <span className="text-4xl md:text-5xl">{intPart}</span>
             <span className="text-xl md:text-2xl">.{decPart}</span>
             <span className="text-xs opacity-50 ml-1">%</span>
          </div>
       </div>
       
       {/* Knob Indicator */}
       <div 
         className="absolute w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-transform duration-100 ease-out"
         style={{
           top: 0, left: 0,
           transform: `translate(${size/2 - 8}px, ${size/2 - 8}px) rotate(${value * 3.6}deg) translateY(-${radius}px)`
         }}
       >
         <div className="w-full h-full rounded-full bg-white opacity-80" style={{ boxShadow: `0 0 15px ${color}` }}></div>
       </div>
    </div>
  );
};

// Reusable Sensor Component
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

  // Modals
  const [showRegistryEditor, setShowRegistryEditor] = useState(false);
  const [showSpellEditor, setShowSpellEditor] = useState(false);
  const [editingSpell, setEditingSpell] = useState<ManifestedSpell | null>(null);
  
  const [configOpen, setConfigOpen] = useState(false);
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  
  // Dynamic Attributes State
  const [sysAttributes, setSysAttributes] = useState<Record<MagicSystem, string[]>>(SYSTEM_ATTRIBUTES);
  const [keywords, setKeywords] = useState(ATTRIBUTE_KEYWORDS);
  
  // Tool State
  const [allTools, setAllTools] = useState<ToolDef[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<string>('tool_none');
  
  // Registry Editor State
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
    // Load Predefined Spells into Grimoire
    const spells = PREDEFINED_GRIMOIRE.map(p => ({
        ...p,
        // Fill missing required fields for ManifestedSpell type with dummy/defaults
        timestamp: Date.now(), // Registered time
        eyeColor: '#fff',
        oipAmplitude: '0',
        oipFrequency: '0',
        casterStatus: { hp: 100, maxHp: 100, heartRate: 0, bodyTemp: 0, bloodPressure: '', respiration: 0, spO2: 0, consciousnessLevel: '', emotionIndex: 0 },
        environment: { location: { lat: 0, lng: 0, alt: 0 }, temperature: 0, humidity: 0, wDensity: 0 },
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
  const [simulateEnv, setSimulateEnv] = useState(true);

  // Environment State
  const [envData, setEnvData] = useState<SpellEnvironment>({
    location: { lat: 35.6895, lng: 139.6917, alt: 45 },
    temperature: 24.5,
    humidity: 55,
    wDensity: 4500
  });

  // Vitals State
  const [vitalData, setVitalData] = useState<CasterStatus>({
    hp: 100,
    maxHp: 100,
    heartRate: 72,
    bodyTemp: 36.6,
    bloodPressure: "118/76",
    respiration: 16,
    spO2: 98.5,
    consciousnessLevel: "Clear",
    emotionIndex: 45
  });

  // Settings State
  const [highPerformance, setHighPerformance] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Selection State
  const [activityRate, setActivityRate] = useState<number>(20.0); // Default 20.0%
  const [rank, setRank] = useState<number>(1);
  const [system, setSystem] = useState<MagicSystem>(MagicSystem.ELEMENTAL);
  const [attribute, setAttribute] = useState<string>(SYSTEM_ATTRIBUTES[MagicSystem.ELEMENTAL][0]);
  const [selectedProtection, setSelectedProtection] = useState<string>('none');
  const [activeSpellId, setActiveSpellId] = useState<string | null>(null); // Track if we are casting a known spell

  // Scroll Event Listener
  useEffect(() => {
    const handleScroll = () => {
        if (window.scrollY > 300) {
            setShowScrollTop(true);
        } else {
            setShowScrollTop(false);
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SIMULATION EFFECT: Fluctuate Vitals and Environment
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate Vitals based on HP
      if (simulateVitals) {
        setVitalData(prev => {
            const hpRatio = prev.hp / prev.maxHp;
            
            // Base HR increases as HP drops (stress)
            let baseHr = 72;
            let stressFactor = 0;
            
            if (hpRatio < 0.2) { baseHr = 130; stressFactor = 20; } // Critical panic
            else if (hpRatio < 0.5) { baseHr = 100; stressFactor = 10; } // Elevated
            else if (hpRatio > 0.9) { baseHr = 65; stressFactor = -5; } // Calm

            const newHr = Math.max(30, Math.min(220, baseHr + Math.floor(Math.random() * 10 - 5)));
            
            // Emotion index fluctuates more at low HP
            const emotionBase = hpRatio < 0.3 ? 80 : 40; 
            const newEmotion = Math.max(0, Math.min(100, emotionBase + Math.floor(Math.random() * 20 - 10)));

            return {
                ...prev,
                heartRate: newHr,
                bodyTemp: parseFloat((Math.max(35.5, Math.min(40.0, prev.bodyTemp + (Math.random() * 0.2 - 0.1))).toFixed(1))),
                spO2: parseFloat((Math.max(85, Math.min(100, 98.5 - (1-hpRatio)*5 + (Math.random() * 0.4 - 0.2))).toFixed(1))), // SpO2 drops with HP
                emotionIndex: newEmotion,
                respiration: Math.max(10, Math.min(45, 16 + (1-hpRatio)*20 + Math.floor(Math.random() * 3 - 1))), // Breathing faster with low HP
            };
        });
      }

      // Fluctuate Environment
      if (simulateEnv) {
        setEnvData(prev => ({
            ...prev,
            wDensity: Math.max(1000, Math.min(9999, prev.wDensity + Math.floor(Math.random() * 300 - 150))),
            temperature: parseFloat((Math.max(-10, Math.min(50, prev.temperature + (Math.random() * 0.4 - 0.2))).toFixed(1))),
            humidity: Math.max(10, Math.min(90, prev.humidity + Math.floor(Math.random() * 3 - 1))),
        }));
      }
    }, 1500); // Faster update for dramatic effect

    return () => clearInterval(interval);
  }, [simulateVitals, simulateEnv]);

  // Calculate Theoretical Output
  // Formula: Density * (Activity/100) * (Rank Multiplier)
  const calculateOutput = () => {
    const baseOutput = envData.wDensity * (activityRate / 100);
    // Rank multiplier: Rank 1 = x1, Rank 7 = x25 (exponential growth)
    const rankMult = Math.pow(1.6, rank - 1); 
    
    // Preview Crisis Multiplier
    const hpRatio = vitalData.hp / vitalData.maxHp;
    const crisisMult = (hpRatio <= 0.05 && hpRatio > 0) ? 3.0 : (0.5 + hpRatio * 0.5);

    return Math.floor(baseOutput * rankMult * crisisMult);
  };

  const estimatedOutput = calculateOutput();

  const getRankRequirement = (r: number) => {
    switch (r) {
      case 1: return 1;
      case 2: return 10;
      case 3: return 20;
      case 4: return 35;
      case 5: return 50;
      case 6: return 70;
      case 7: return 81;
      default: return 0;
    }
  };

  const isRankAvailable = (r: number) => activityRate >= getRankRequirement(r);

  useEffect(() => {
    if (!isRankAvailable(rank)) {
      let newRank = 0; 
      for (let r = 7; r >= 1; r--) {
         if (isRankAvailable(r)) {
            newRank = r;
            break;
         }
      }
      setRank(newRank === 0 ? 1 : newRank);
    }
  }, [activityRate, rank]);

  // Use dynamic sysAttributes instead of static constant
  useEffect(() => {
    if (!sysAttributes[system]?.includes(attribute)) {
      setAttribute(sysAttributes[system]?.[0] || "");
    }
  }, [system, attribute, sysAttributes]);

  useEffect(() => {
    if (appState === 'ANALYZING') {
      setInvocationStep(0);
      const interval = setInterval(() => {
        setInvocationStep(prev => (prev < 2 ? prev + 1 : prev));
      }, 1000); 
      return () => clearInterval(interval);
    } 
    
    if (appState === 'MANIFESTING') {
      setInvocationStep(3);
      const interval = setInterval(() => {
        setInvocationStep(prev => (prev < 6 ? prev + 1 : prev));
      }, 800); 
      return () => clearInterval(interval);
    }
  }, [appState]);

  const castSpell = async () => {
    // Check Failure Probability
    // Logic: 
    // - Base Stability = Activity Rate (0-100)
    // - HP Bonus/Penalty: Full HP = +25% Stability, Low HP = +0%
    // - Rank Difficulty: Each Rank subtracts 5% Stability (Rank 1 = -5, Rank 7 = -35)
    // - Base: +30
    // Success Threshold = Stability Score
    // If Random Roll (0-100) > Success Threshold, then FAILURE.

    const hpRatio = vitalData.hp / vitalData.maxHp;
    const hpBonus = hpRatio * 25;
    const rankPenalty = rank * 5;
    const baseStability = 30;
    
    // Calculate total probability of success
    const successProbability = activityRate + baseStability + hpBonus - rankPenalty;
    
    // RNG Roll
    const roll = Math.random() * 100;
    
    const isSuccess = roll <= successProbability;

    // Log for debugging (optional)
    console.log(`Spell Check: Roll ${roll.toFixed(1)} vs Prob ${successProbability.toFixed(1)} (Act:${activityRate} + Base:${baseStability} + HP:${hpBonus.toFixed(1)} - Rank:${rankPenalty})`);

    // Auto-close config on cast
    setConfigOpen(false);

    if (!isSuccess) {
         // Failure Sequence
         setAppState('ANALYZING');
         setErrorMsg(null);
         setInvocationStep(0);
         
         // Simulate start...
         await new Promise(resolve => setTimeout(resolve, 1500));
         
         // Then FIZZLE
         setErrorMsg(`W-CORE INSTABILITY DETECTED. RESONANCE INSUFFICIENT (${successProbability.toFixed(1)}% Stability). SPELL COLLAPSED.`);
         setAppState('ERROR');
         return;
    }

    try {
      setAppState('ANALYZING');
      setErrorMsg(null);
      
      // Look up if current config matches the active spell, OR find a matching spell in the Grimoire
      let knownSpell = activeSpellId ? grimoire.find(s => s.id === activeSpellId) : undefined;
      
      // If no active spell ID, try to find by params
      if (!knownSpell) {
         knownSpell = grimoire.find(s => s.system === system && s.rank === rank && s.attribute === attribute);
      }
      
      const spellAnalysis = await constructSpell(
          rank, system, attribute, selectedProtection, selectedToolId, envData, vitalData, knownSpell
      );
      setAnalysis(spellAnalysis);
      
      // Delay 1: Analyzing Phase (Steps 0, 1, 2)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setAppState('MANIFESTING');
      
      // Delay 2: Manifesting Phase (Steps 3, 4, 5, 6)
      await new Promise(resolve => setTimeout(resolve, 3200));

      // Generate ID for this specific *invocation* (not the spell ID itself)
      const id = `INV${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      const newSpell: ManifestedSpell = {
        ...spellAnalysis,
        id,
        timestamp: Date.now()
      };

      setCurrentSpell(newSpell);
      // NOTE: We do NOT add to grimoire automatically anymore.
      setAppState('COMPLETE');
    } catch (err) {
      console.error(err);
      setErrorMsg("W-Core Critical Failure. Incantation rejected by the laws of physics.");
      setAppState('ERROR');
    }
  };

  const reset = () => {
    setAppState('IDLE');
    setCurrentSpell(null);
    setAnalysis(null);
    setInvocationStep(0);
  };

  // Called when clicking a spell in Grimoire
  const handleGrimoireSelect = (spell: ManifestedSpell) => {
    // Load config
    setSystem(spell.system);
    setRank(spell.rank);
    setAttribute(spell.attribute);
    setActiveSpellId(spell.id);
    
    // Auto-open config to show parameters? Or just let user click Construct.
    // Let's close Grimoire on mobile
    if (window.innerWidth < 768) setIsGrimoireOpen(false);
    
    // Reset state to ready
    setAppState('IDLE');
  };

  const clearHistory = () => {
    setGrimoire([]); // Purge everything
    setShowSettings(false);
  };
  
  // -- Spell Editor Handlers --
  const handleOpenSpellEditor = (spell?: ManifestedSpell) => {
    setEditingSpell(spell || null);
    setShowSpellEditor(true);
  };

  const handleSaveSpell = (spell: ManifestedSpell) => {
    if (editingSpell) {
        // Update existing in Grimoire
        setGrimoire(prev => prev.map(s => s.id === spell.id ? spell : s));
    } else {
        // Create new in Grimoire
        setGrimoire(prev => [spell, ...prev]);
    }
    setShowSpellEditor(false);
  };

  const handleDeleteSpell = (spellId: string) => {
      setGrimoire(prev => prev.filter(s => s.id !== spellId));
  };

  // -- Registry Handlers --

  const handleManualAdd = () => {
    if (!newAttrName || !newAttrKanji || !newAttrReading) return;

    const newKeywordData = {
        [newAttrName]: {
            kanji: newAttrKanji,
            reading: newAttrReading,
            tone: 'neutral'
        }
    };
    
    // Update Service Data
    extendAttributeKeywords(newKeywordData);

    // Update Local Keyword State
    setKeywords(prev => ({ ...prev, ...newKeywordData }));

    // Update UI List
    setSysAttributes(prev => {
        const currentList = prev[newAttrSystem] || [];
        if (currentList.includes(newAttrName)) return prev;
        return {
            ...prev,
            [newAttrSystem]: [...currentList, newAttrName]
        };
    });

    // Reset Form
    setNewAttrName('');
    setNewAttrKanji('');
    setNewAttrReading('');
  };
  
  const handleManualAddTool = () => {
      if (!newToolName || !newToolCategory || !newToolDesc) return;
      
      const newTool: ToolDef = {
          id: `tool_custom_${Date.now()}`,
          name: newToolName,
          category: newToolCategory,
          description: newToolDesc,
          compatibleSystems: [newToolSystem],
          powerBonus: parseFloat(newToolBonus) || 1.1
      };
      
      registerTool(newTool);
      setAllTools(getTools());
      
      // Reset Form
      setNewToolName('');
      setNewToolCategory('');
      setNewToolDesc('');
      alert("New Tool Registered.");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let jsonStr = text;
        const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch) {
            jsonStr = jsonBlockMatch[1];
        } else {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonStr = text.substring(firstBrace, lastBrace + 1);
            }
        }
        
        const data = JSON.parse(jsonStr);

        if (data.attributes && Array.isArray(data.attributes)) {
            const newKeywords: Record<string, any> = {};
            const newSysAttrs = { ...sysAttributes };

            data.attributes.forEach((attr: any) => {
                if (attr.name && attr.system && attr.kanji && attr.reading) {
                    newKeywords[attr.name] = { 
                        kanji: attr.kanji, 
                        reading: attr.reading, 
                        tone: attr.tone || 'neutral' 
                    };
                    
                    const sysKey = Object.values(MagicSystem).find(s => s === attr.system) || MagicSystem.OTHER;
                    if (!newSysAttrs[sysKey]) newSysAttrs[sysKey] = [];
                    if (!newSysAttrs[sysKey].includes(attr.name)) {
                        newSysAttrs[sysKey] = [...newSysAttrs[sysKey], attr.name];
                    }
                }
            });

            extendAttributeKeywords(newKeywords);
            setKeywords(prev => ({ ...prev, ...newKeywords }));
            setSysAttributes(newSysAttrs);
            alert(`Grimoire Updated: ${data.attributes.length} new entries assimilated.`);
            setEditorTab('REGISTRY'); // Switch to registry view
        } else {
            alert("Invalid Grimoire Format. Missing 'attributes' array.");
        }

      } catch (err) {
        console.error(err);
        alert("Failed to parse Grimoire data. Ensure valid JSON format.");
      }
    };
    reader.readAsText(file);
  };

  // Helper to render attribute buttons
  const renderAttrButton = (attr: string) => (
    <button
      key={attr}
      onClick={() => setAttribute(attr)}
      className={`py-2 text-[10px] md:text-xs font-sans font-medium border rounded transition-all duration-300 truncate px-1
        ${attribute === attr
          ? 'bg-magic-accent/20 border-magic-accent text-white shadow-[inset_0_0_10px_rgba(139,92,246,0.2)]'
          : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
        }`}
    >
      {attr}
    </button>
  );

  const getActivityColor = (rate: number) => {
    // Gradient Stops: Gray -> Blue -> Purple -> Red -> Gold
    const stops = [
      { p: 0, c: [75, 85, 99] },      // Gray-600
      { p: 25, c: [59, 130, 246] },   // Blue-500
      { p: 50, c: [139, 92, 246] },   // Purple-500
      { p: 75, c: [239, 68, 68] },    // Red-500
      { p: 100, c: [251, 191, 36] }   // Amber-400
    ];

    let start = stops[0];
    let end = stops[stops.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
      if (rate >= stops[i].p && rate <= stops[i + 1].p) {
        start = stops[i];
        end = stops[i + 1];
        break;
      }
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
      
      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col items-center justify-center relative min-h-screen transition-all duration-500 ${grimoire.length > 0 ? (isGrimoireOpen ? 'md:mr-80' : 'md:mr-10') : ''}`}>
        
        {/* Background Ambient Effects */}
        {highPerformance && (
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
               <div className="absolute top-0 left-1/4 w-96 h-96 bg-magic-accent/5 rounded-full blur-[120px] animate-pulse"></div>
               <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          </div>
        )}

        {/* Header - SIMPLIFIED */}
        <header className="absolute top-0 left-0 p-8 z-20 w-full flex justify-between items-center pointer-events-none">
          <div 
            className="flex items-center gap-4 cursor-pointer pointer-events-auto"
            onClick={reset}
          >
             <Box className="w-6 h-6 text-magic-accent" />
             <h1 className="font-sans text-xl font-bold text-white tracking-widest">
               VELUNA
             </h1>
          </div>
        </header>

        {/* Dynamic Center Stage - Wide Layout */}
        <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col items-center">
          
          {appState === 'ERROR' && (
             <div className="mb-8 p-4 bg-red-900/30 border border-red-500/30 rounded text-red-200 font-mono text-sm max-w-md text-center z-50">
                {errorMsg}
                <button onClick={reset} className="block w-full mt-2 underline hover:text-white">Re-stabilize</button>
             </div>
          )}

          {/* Magic Circle Visualization Layer - Transitions based on state */}
          <div className={`transition-all duration-1000 ease-in-out flex justify-center items-center
             ${appState === 'IDLE' ? 'opacity-0 scale-50 pointer-events-none absolute' : 
               appState === 'COMPLETE' ? 'opacity-0 scale-50 pointer-events-none absolute' : 
               'scale-125 my-12 opacity-100'}`}
          >
            <MagicCircle 
              state={appState === 'COMPLETE' ? 'IDLE' : appState} 
              system={appState === 'IDLE' ? system : analysis?.system} 
              attribute={appState === 'IDLE' ? attribute : analysis?.attribute}
              eyeColor={appState === 'IDLE' ? undefined : analysis?.eyeColor} 
              stepText={appState === 'IDLE' ? undefined : INVOCATION_STEPS[invocationStep]}
              stepIndex={invocationStep}
            />
          </div>
          
          {/* Control Panel Layer - Hides during active casting */}
          <div className={`w-full relative z-10 transition-all duration-700 delay-100 ${!isIdle ? 'opacity-0 translate-y-20 pointer-events-none h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            
            <div className="bg-black/60 border border-white/10 rounded-lg p-8 backdrop-blur-md shadow-2xl relative transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-magic-accent to-transparent opacity-50"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Column: Activity Rate & Sensor Data (UPDATED: Smart UI) */}
                <div className="lg:col-span-3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8 gap-4">
                   
                   {/* Top: Activity Control + HP Control Row */}
                   <div className="flex gap-4 items-center justify-between mb-2 h-44">
                        {/* HP Slider */}
                        <VerticalHpSlider 
                            hp={vitalData.hp} 
                            maxHp={vitalData.maxHp} 
                            onChange={(val) => setVitalData(prev => ({...prev, hp: val}))} 
                        />

                        {/* Activity Slider */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-widest mb-2 w-full justify-center">
                                <Activity className="w-4 h-4" style={{ color: activityColor }} />
                                <span>Resonance</span>
                            </div>
                            <CircularSlider 
                                value={activityRate} 
                                onChange={setActivityRate} 
                                color={activityColor} 
                            />
                       </div>
                   </div>

                   {/* Middle: Live Biometrics Grid */}
                   <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1">
                          <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest flex items-center gap-2">
                             <Heart className="w-3 h-3" /> Live Biometrics
                          </div>
                          <button 
                             onClick={() => setSimulateVitals(!simulateVitals)}
                             className={`text-xs hover:text-white transition-colors ${simulateVitals ? 'text-green-500' : 'text-red-500'}`}
                             title={simulateVitals ? "Pause Simulation" : "Resume Simulation"}
                          >
                             {simulateVitals ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <SensorData 
                             icon={<Heart size={14} />} 
                             label="HR" 
                             value={vitalData.heartRate.toString()} 
                             unit="bpm"
                             color={vitalData.heartRate > 120 ? '#ef4444' : '#ffffff'}
                             blink={vitalData.heartRate > 150}
                          />
                          <SensorData 
                             icon={<Activity size={14} />} 
                             label="Psyche" 
                             value={vitalData.emotionIndex.toString()} 
                             unit="%"
                             color="#8b5cf6"
                          />
                          <SensorData 
                             icon={<Thermometer size={14} />} 
                             label="Temp" 
                             value={vitalData.bodyTemp.toString()} 
                             unit="°C"
                          />
                           <SensorData 
                             icon={<Gauge size={14} />} 
                             label="SpO2" 
                             value={vitalData.spO2.toFixed(1)} 
                             unit="%"
                             color={vitalData.spO2 < 95 ? '#fbbf24' : '#10b981'}
                          />
                      </div>
                   </div>

                   {/* Bottom: Live Environment Grid */}
                   <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1">
                          <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest flex items-center gap-2">
                             <CloudFog className="w-3 h-3" /> Environment
                          </div>
                          <button 
                             onClick={() => setSimulateEnv(!simulateEnv)}
                             className={`text-xs hover:text-white transition-colors ${simulateEnv ? 'text-green-500' : 'text-red-500'}`}
                             title={simulateEnv ? "Pause Simulation" : "Resume Simulation"}
                          >
                             {simulateEnv ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <SensorData 
                             icon={<Waves size={14} />} 
                             label="W-Density" 
                             value={envData.wDensity.toString()} 
                             unit="u/m³"
                             color="#3b82f6"
                          />
                          <SensorData 
                             icon={estimatedOutput > 50000 ? <Skull size={14} /> : <Zap size={14} />} 
                             label="Est.Out" 
                             value={estimatedOutput > 9999 ? (estimatedOutput/1000).toFixed(1) + 'k' : estimatedOutput.toString()} 
                             unit="Tk"
                             color={estimatedOutput > 50000 ? '#ef4444' : '#fbbf24'}
                             blink={estimatedOutput > 50000}
                          />
                           <SensorData 
                             icon={<Thermometer size={14} />} 
                             label="Amb.Temp" 
                             value={envData.temperature.toString()} 
                             unit="°C"
                          />
                          <SensorData 
                             icon={<CloudFog size={14} />} 
                             label="Humidity" 
                             value={envData.humidity.toString()} 
                             unit="%"
                          />
                      </div>
                       <div className="bg-white/5 border border-white/5 rounded p-1.5 flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <div className="text-[9px] font-mono text-gray-400 truncate">
                               {envData.location.lat.toFixed(4)}, {envData.location.lng.toFixed(4)} <span className="text-gray-600">|</span> Alt: {envData.location.alt}m
                            </div>
                       </div>
                   </div>

                </div>

                {/* Right Column: Configuration - Collapsible */}
                <div className="lg:col-span-9 flex flex-col justify-center">
                  
                  {/* Closed State - Summary & Edit Button */}
                  {!configOpen ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      
                      {/* Interactive Summary Display (Opens Config) */}
                      <div 
                        onClick={() => setConfigOpen(true)}
                        className="grid grid-cols-3 gap-4 w-full text-center cursor-pointer group relative"
                      >
                         {/* Hover Hint */}
                         <div className="absolute -top-6 right-0 text-[10px] text-magic-accent opacity-0 group-hover:opacity-100 transition-opacity font-mono uppercase tracking-widest flex items-center gap-1">
                            Modify <Edit2 className="w-3 h-3" />
                         </div>

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
                        <button
                          onClick={castSpell}
                          disabled={activityRate === 0}
                          className={`w-full py-4 text-white font-mono font-bold uppercase tracking-[0.2em] rounded border transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                            ${activityRate > 0 
                              ? 'bg-white/5 hover:bg-white/10 border-white/20 hover:border-magic-accent hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] active:scale-95' 
                              : 'bg-black/50 border-white/5 text-gray-600 cursor-not-allowed'}`}
                        >
                          {activityRate > 0 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-magic-accent/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>}
                          <Sparkles className={`w-4 h-4 ${activityRate > 0 ? 'group-hover:animate-spin' : ''}`} />
                          <span>Construct</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Open State - Full Controls */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                      <button 
                         onClick={() => setConfigOpen(false)}
                         className="absolute -top-4 -right-2 p-2 text-gray-500 hover:text-white transition-colors"
                      >
                         <ChevronUp className="w-5 h-5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* System Selection */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
                            <Layers className="w-4 h-4 text-magic-accent" />
                            <span>Magic System</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                            {Object.values(MagicSystem).map((sys) => (
                                <button
                                key={sys}
                                onClick={() => setSystem(sys)}
                                className={`px-4 py-2 text-sm font-mono border rounded transition-all duration-300
                                    ${system === sys
                                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                    : 'bg-transparent border-white/20 text-gray-400 hover:border-white/50 hover:text-white'
                                    }`}
                                >
                                {sys}
                                </button>
                            ))}
                            </div>
                        </div>

                        {/* Rank Selection */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
                            <CircleDot className="w-4 h-4 text-magic-accent" />
                            <span>Invocation Rank</span>
                            </div>
                            <div className="flex justify-between gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                            {[1, 2, 3, 4, 5, 6, 7].map((r) => {
                                const available = isRankAvailable(r) && activityRate > 0;
                                return (
                                <button
                                    key={r}
                                    onClick={() => available && setRank(r)}
                                    disabled={!available}
                                    className={`flex-1 h-10 text-sm font-serif transition-all duration-300 flex items-center justify-center rounded
                                    ${rank === r 
                                        ? 'bg-magic-accent text-white shadow-lg' 
                                        : available
                                        ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                                        : 'text-gray-700 cursor-not-allowed opacity-30'
                                    }`}
                                >
                                    {r}
                                </button>
                                );
                            })}
                            </div>
                            <div className="text-right mt-2 text-[10px] font-mono text-magic-accent flex justify-end items-center gap-2 h-4">
                            {activityRate > 0 && RING_DATA[rank]?.alias}
                            </div>
                        </div>
                      </div>

                      {/* Divine Protection & Tools Selection */}
                      <div className="mb-6 grid grid-cols-2 gap-4">
                         {/* Protection */}
                         <div>
                             <div className="flex items-center gap-2 mb-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
                                <Crown className="w-4 h-4 text-magic-accent" />
                                <span>Protection (加護)</span>
                             </div>
                             <select
                                value={selectedProtection}
                                onChange={(e) => setSelectedProtection(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs font-mono text-gray-300 focus:border-magic-accent focus:outline-none"
                             >
                                {DIVINE_PROTECTIONS.map((prot) => (
                                    <option key={prot.id} value={prot.id} className="bg-black text-gray-300">
                                    [{prot.category}] {prot.name} {prot.powerMultiplier > 1 ? `(x${prot.powerMultiplier})` : ''}
                                    </option>
                                ))}
                             </select>
                         </div>
                         
                         {/* Tools */}
                         <div>
                             <div className="flex items-center gap-2 mb-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
                                <Hammer className="w-4 h-4 text-blue-400" />
                                <span>Tool (道具)</span>
                             </div>
                             <select
                                value={selectedToolId}
                                onChange={(e) => setSelectedToolId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs font-mono text-gray-300 focus:border-magic-accent focus:outline-none"
                             >
                                {allTools.map((tool) => (
                                    <option key={tool.id} value={tool.id} className="bg-black text-gray-300">
                                    [{tool.category}] {tool.name}
                                    </option>
                                ))}
                             </select>
                         </div>
                      </div>
                      
                      {/* Descriptions */}
                      <div className="mb-6 bg-white/5 border border-white/5 rounded p-2 text-[10px] text-gray-500 font-sans grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-magic-accent block mb-1 uppercase tracking-wider font-mono">Protection Effect</span>
                                {DIVINE_PROTECTIONS.find(p => p.id === selectedProtection)?.description}
                            </div>
                            <div>
                                <span className="text-blue-400 block mb-1 uppercase tracking-wider font-mono">Tool Effect</span>
                                {allTools.find(t => t.id === selectedToolId)?.description}
                            </div>
                      </div>

                      {/* Attribute Selection */}
                      <div className="border-t border-white/10 pt-6 mb-6">
                        <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
                          <Component className="w-4 h-4 text-magic-accent" />
                          <span>Attribute Configuration</span>
                        </div>
                        
                        {/* Use dynamic sysAttributes here */}
                        {system === MagicSystem.ELEMENTAL ? (
                          <div className="space-y-4">
                              <div>
                                <div className="text-[10px] font-mono text-gray-600 mb-2 ml-1 border-l-2 border-magic-accent/30 pl-2">基本属性 (Basic Attributes)</div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                  {sysAttributes[system].filter(a => a.includes('属性')).map(renderAttrButton)}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-mono text-gray-600 mb-2 ml-1 border-l-2 border-magic-accent/30 pl-2">上位領域 (Domains)</div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                  {sysAttributes[system].filter(a => !a.includes('属性')).map(renderAttrButton)}
                                </div>
                              </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {sysAttributes[system]?.map(renderAttrButton) || []}
                          </div>
                        )}
                      </div>
                      
                      {/* Close/Confirm Button */}
                       <button
                          onClick={() => setConfigOpen(false)}
                          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-widest rounded border border-white/10 transition-colors"
                        >
                          Confirm Parameters
                        </button>
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

          {/* Complete State - Result */}
          {appState === 'COMPLETE' && currentSpell && (
            <div className="relative z-20 w-full">
               <SpellResult spell={currentSpell} onReset={reset} />
            </div>
          )}

        </div>

      </main>

      {/* Right Sidebar Grimoire */}
      <Grimoire 
        history={grimoire} 
        onSelect={handleGrimoireSelect} 
        isOpen={isGrimoireOpen}
        onToggle={() => setIsGrimoireOpen(!isGrimoireOpen)}
        onAdd={() => handleOpenSpellEditor()}
        onEdit={(spell) => handleOpenSpellEditor(spell)}
        onDelete={(id) => handleDeleteSpell(id)}
      />
      
      {/* Spell Editor Modal */}
      {showSpellEditor && (
        <SpellEditor 
            isOpen={showSpellEditor}
            onClose={() => setShowSpellEditor(false)}
            onSave={handleSaveSpell}
            initialData={editingSpell}
        />
      )}

      {/* Button Stack (Bottom Left) - REORGANIZED */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
        {/* Grimoire Toggle - Separated and on Top */}
        <button 
          onClick={() => setIsGrimoireOpen(!isGrimoireOpen)}
          className={`p-3 border rounded-full backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]
            ${isGrimoireOpen ? 'bg-magic-gold text-black border-magic-gold' : 'bg-black/60 border-white/10 text-magic-gold hover:border-magic-gold'}`}
          title="Toggle Grimoire"
        >
          <Book className="w-5 h-5" />
        </button>

        {/* Registry/Editor Button */}
        <button 
          onClick={() => setShowRegistryEditor(true)}
          className="p-3 bg-black/60 border border-white/10 text-gray-400 hover:text-white hover:border-magic-accent rounded-full backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          title="Grimoire Registry"
        >
          <List className="w-5 h-5" />
        </button>

        {/* Settings Button */}
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 bg-black/60 border border-white/10 text-gray-400 hover:text-white hover:border-magic-accent rounded-full backdrop-blur-md transition-all hover:rotate-90"
          title="System Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Scroll To Top Button (Fixed Bottom Right) */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <button 
            onClick={scrollToTop}
            className="p-3 bg-magic-accent hover:bg-magic-accent/80 text-white rounded-full shadow-lg shadow-magic-accent/30 transition-transform hover:-translate-y-1"
            title="Scroll to Top"
          >
              <ArrowUp className="w-5 h-5" />
          </button>
      </div>

      {/* Registry Editor Modal */}
      {showRegistryEditor && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/20 w-full max-w-2xl rounded-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-magic-accent to-transparent"></div>
             
             <div className="p-6 flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6 shrink-0">
                   <div className="flex items-center gap-2 text-magic-accent">
                      <List className="w-5 h-5" />
                      <h2 className="font-serif text-lg tracking-widest text-white">GRIMOIRE REGISTRY</h2>
                   </div>
                   <button onClick={() => setShowRegistryEditor(false)} className="text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-white/10 mb-6 shrink-0">
                  <button 
                    onClick={() => setEditorTab('REGISTRY')}
                    className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${editorTab === 'REGISTRY' ? 'text-white border-b-2 border-magic-accent bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Registry List
                  </button>
                  <button 
                    onClick={() => setEditorTab('TOOLS')}
                    className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${editorTab === 'TOOLS' ? 'text-white border-b-2 border-magic-accent bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Tools
                  </button>
                  <button 
                    onClick={() => setEditorTab('IMPORT')}
                    className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${editorTab === 'IMPORT' ? 'text-white border-b-2 border-magic-accent bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Injection
                  </button>
                </div>

                {/* Registry Tab Content */}
                {editorTab === 'REGISTRY' && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        
                        {/* Quick Add Form */}
                        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded shrink-0">
                            <h3 className="text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-3 flex items-center gap-2">
                                <Plus className="w-3 h-3" /> Manual Entry
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                                <select 
                                    value={newAttrSystem}
                                    onChange={(e) => setNewAttrSystem(e.target.value as MagicSystem)}
                                    className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none"
                                >
                                    {Object.values(MagicSystem).map(sys => (
                                        <option key={sys} value={sys}>{sys}</option>
                                    ))}
                                </select>
                                <input 
                                    type="text" 
                                    placeholder="Name (e.g. Plasma)" 
                                    value={newAttrName}
                                    onChange={(e) => setNewAttrName(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none placeholder:text-gray-700"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Kanji (e.g. 雷漿)" 
                                    value={newAttrKanji}
                                    onChange={(e) => setNewAttrKanji(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none placeholder:text-gray-700"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Reading (e.g. ライショウ)" 
                                    value={newAttrReading}
                                    onChange={(e) => setNewAttrReading(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none placeholder:text-gray-700"
                                />
                            </div>
                            <button 
                                onClick={handleManualAdd}
                                disabled={!newAttrName || !newAttrKanji || !newAttrReading}
                                className="w-full py-2 bg-magic-accent/20 hover:bg-magic-accent/30 text-magic-accent border border-magic-accent/30 rounded text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Register Attribute
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-4 relative shrink-0">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                            <input 
                                type="text"
                                placeholder="Search archives..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded pl-9 pr-3 py-2 text-sm text-gray-300 focus:border-magic-accent outline-none placeholder:text-gray-700"
                            />
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-2">
                             {Object.entries(sysAttributes).map(([sys, attrs]) => {
                                 const filteredAttrs = (attrs as string[]).filter(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
                                 if (filteredAttrs.length === 0) return null;
                                 
                                 return (
                                    <div key={sys}>
                                        <div className="text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-2 border-b border-white/5 pb-1">
                                            {sys}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {filteredAttrs.map(attr => (
                                                <div key={attr} className="bg-white/5 border border-white/5 rounded p-2 flex justify-between items-center group hover:border-white/20 transition-colors">
                                                    <div>
                                                        <div className="text-xs text-gray-200">{attr}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono">
                                                            {keywords[attr]?.kanji} / {keywords[attr]?.reading}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                 );
                             })}
                        </div>
                    </div>
                )}
                
                {/* Tools Tab Content */}
                {editorTab === 'TOOLS' && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {/* Add Tool Form */}
                        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded shrink-0">
                            <h3 className="text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-3 flex items-center gap-2">
                                <Hammer className="w-3 h-3" /> New Tool Registration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <input 
                                    type="text" 
                                    placeholder="Tool Name (e.g. Phoenix Wand)" 
                                    value={newToolName}
                                    onChange={(e) => setNewToolName(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Category (e.g. Wand)" 
                                    value={newToolCategory}
                                    onChange={(e) => setNewToolCategory(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Description" 
                                    value={newToolDesc}
                                    onChange={(e) => setNewToolDesc(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none col-span-2"
                                />
                                <select 
                                    value={newToolSystem}
                                    onChange={(e) => setNewToolSystem(e.target.value as MagicSystem)}
                                    className="bg-black/40 border border-white/10 rounded text-xs text-gray-300 p-2 focus:border-magic-accent outline-none"
                                >
                                    {Object.values(MagicSystem).map(sys => (
                                        <option key={sys} value={sys}>{sys}</option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded px-2">
                                    <span className="text-[10px] text-gray-500 font-mono">POWER: x</span>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        placeholder="Bonus" 
                                        value={newToolBonus}
                                        onChange={(e) => setNewToolBonus(e.target.value)}
                                        className="bg-transparent text-xs text-gray-300 p-2 focus:outline-none w-full"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleManualAddTool}
                                disabled={!newToolName || !newToolCategory || !newToolDesc}
                                className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Fabricate Tool
                            </button>
                        </div>
                        
                        {/* Tools List */}
                         <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-2">
                             {allTools.map(tool => (
                                <div key={tool.id} className="bg-white/5 border border-white/5 rounded p-3 flex justify-between items-center group hover:border-white/20 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-gray-200">{tool.name}</span>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5">{tool.category}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mb-1">{tool.description}</div>
                                        <div className="flex gap-2">
                                            {tool.compatibleSystems.map(s => (
                                                <span key={s} className="text-[9px] font-mono text-magic-accent">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-mono text-blue-400">x{tool.powerBonus.toFixed(1)}</div>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* Import Tab Content */}
                {editorTab === 'IMPORT' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-lg hover:border-magic-accent/50 transition-colors bg-white/5">
                        <Upload className="w-12 h-12 text-gray-500 mb-4" />
                        <h3 className="text-white font-mono text-sm mb-2">UPLOAD GRIMOIRE DATA</h3>
                        <p className="text-gray-500 text-xs text-center max-w-sm mb-6">
                            Inject external JSON data containing attribute definitions.
                            Compatible with standard VELUNA data structures.
                        </p>
                        
                        <label className="relative cursor-pointer group">
                            <input 
                                type="file" 
                                accept=".json,.txt"
                                onChange={handleFileUpload}
                                className="hidden" 
                            />
                            <div className="px-6 py-3 bg-magic-accent hover:bg-magic-accent/80 text-white font-mono text-xs uppercase tracking-widest rounded shadow-lg shadow-magic-accent/20 transition-all group-hover:scale-105">
                                Select File
                            </div>
                        </label>
                        
                        <div className="mt-8 p-4 bg-black/40 rounded text-[10px] font-mono text-gray-600 w-full max-w-md">
                            <div className="mb-2 text-gray-500 uppercase">Expected Format:</div>
                            <pre className="whitespace-pre-wrap">
{`{
  "attributes": [
    {
      "name": "Void",
      "system": "因果系",
      "kanji": "虚無",
      "reading": "キョム"
    }
  ]
}`}
                            </pre>
                        </div>
                    </div>
                )}

             </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/10 p-8 rounded-lg shadow-2xl max-w-md w-full relative">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="font-serif text-xl text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-magic-accent" />
              システム設定
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Shield className="w-5 h-5 text-blue-400" />
                   <div>
                     <div className="text-sm text-gray-200">高パフォーマンスモード</div>
                     <div className="text-xs text-gray-500">高度なパーティクルエフェクトを有効化</div>
                   </div>
                </div>
                <button 
                  onClick={() => setHighPerformance(!highPerformance)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${highPerformance ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                   <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${highPerformance ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Volume2 className="w-5 h-5 text-purple-400" />
                   <div>
                     <div className="text-sm text-gray-200">システムオーディオ</div>
                     <div className="text-xs text-gray-500">インターフェース音を有効化</div>
                   </div>
                </div>
                <button 
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${audioEnabled ? 'bg-purple-500' : 'bg-gray-700'}`}
                >
                   <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${audioEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="pt-6 border-t border-white/10">
                 <button 
                   onClick={clearHistory}
                   className="w-full py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-widest"
                 >
                   <Trash2 className="w-4 h-4" />
                   アーカイブ全消去
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}