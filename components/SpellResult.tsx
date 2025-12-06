import React, { useState } from 'react';
import { ManifestedSpell, MagicSystem, RING_DATA, DivineProtectionDef } from '../types';
import { Sparkles, Zap, Hourglass, Hexagon, Star, Activity, Eye, Database, Cpu, Flame, Droplets, Wind, Mountain, Swords, ChevronDown, ChevronUp, Thermometer, Heart, CloudFog, Shield, Hammer, BookOpen, X, Crown } from 'lucide-react';

interface SpellResultProps {
  spell: ManifestedSpell;
  onReset: () => void;
}

const getIcon = (system: MagicSystem, sizeClass: string = "w-4 h-4 shrink-0") => {
  switch (system) {
    case MagicSystem.ELEMENTAL: return <Zap className={`${sizeClass} text-red-400`} />;
    case MagicSystem.CAUSAL: return <Hourglass className={`${sizeClass} text-purple-400`} />;
    case MagicSystem.CREATION: return <Hexagon className={`${sizeClass} text-green-400`} />;
    case MagicSystem.DAWN: return <Star className={`${sizeClass} text-yellow-200`} />;
    default: return <Activity className={`${sizeClass} text-gray-400`} />;
  }
};

const getSystemVisual = (system: MagicSystem, attribute: string) => {
    const attr = attribute.toLowerCase();
    const className = "w-32 h-32 md:w-48 md:h-48 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]";
    
    if (attr.includes('fire') || attr.includes('火')) return <Flame className={`${className} text-red-500`} />;
    if (attr.includes('water') || attr.includes('ice') || attr.includes('水')) return <Droplets className={`${className} text-blue-500`} />;
    if (attr.includes('wind') || attr.includes('air') || attr.includes('風')) return <Wind className={`${className} text-green-400`} />;
    if (attr.includes('earth') || attr.includes('rock') || attr.includes('土')) return <Mountain className={`${className} text-amber-600`} />;
    
    switch (system) {
        case MagicSystem.ELEMENTAL: return <Zap className={`${className} text-red-500`} />;
        case MagicSystem.CAUSAL: return <Hourglass className={`${className} text-purple-500`} />;
        case MagicSystem.CREATION: return <Hexagon className={`${className} text-green-500`} />;
        case MagicSystem.DAWN: return <Star className={`${className} text-yellow-300`} />;
        default: return <Activity className={`${className} text-gray-500`} />;
    }
}

const DataRow: React.FC<{ label: string; value: string; full?: boolean }> = ({ label, value, full }) => (
  <div className={`p-2 bg-black/40 border border-white/5 rounded ${full ? 'col-span-2' : ''}`}>
    <div className="text-[9px] text-gray-500 font-mono uppercase mb-0.5">{label}</div>
    <div className="text-xs text-gray-300 font-sans leading-snug break-words">{value}</div>
  </div>
);

// Protection Details Modal
const ProtectionModal: React.FC<{ protection: DivineProtectionDef; onClose: () => void }> = ({ protection, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#0f172a] border border-magic-accent/30 w-full max-w-2xl rounded-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/20 shrink-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="text-[10px] font-mono text-magic-accent uppercase tracking-widest mb-1">
                            Divine Protection Analysis
                        </div>
                        <h2 className="text-2xl font-serif text-white flex items-center gap-2 overflow-hidden">
                           <Crown className="w-6 h-6 text-yellow-500 shrink-0" />
                           <span className="truncate">{protection.name}</span>
                        </h2>
                        <div className="text-xs text-gray-400 mt-1 font-mono">
                            Category: {protection.category}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors shrink-0">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-6">
                    {/* ... (Content kept same structure, ensures wrapping) */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">1. Basic Information (基本情報)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DataRow label="主神 (Deity)" value={protection.lore.deity} />
                            <DataRow label="象徴 (Symbol)" value={protection.lore.symbol} />
                            <DataRow label="別名 (Alias)" value={protection.lore.alias} full />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">2. Conditions (発動条件)</h3>
                        <div className="space-y-2">
                            <DataRow label="授与条件 (Grant)" value={protection.lore.conditions.grant} />
                            <DataRow label="維持条件 (Maintain)" value={protection.lore.conditions.maintain} />
                            <DataRow label="喪失条件 (Loss)" value={protection.lore.conditions.loss} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">3. Effects (効果)</h3>
                        <div className="space-y-2">
                             <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded">
                                <div className="text-[9px] text-blue-400 font-mono uppercase mb-0.5">直接効果 (Direct)</div>
                                <div className="text-sm text-gray-200">{protection.lore.effects.direct}</div>
                             </div>
                             <div className="p-3 bg-green-900/10 border border-green-500/20 rounded">
                                <div className="text-[9px] text-green-400 font-mono uppercase mb-0.5">間接効果 (Indirect)</div>
                                <div className="text-sm text-gray-200">{protection.lore.effects.indirect}</div>
                             </div>
                             <div className="p-3 bg-red-900/10 border border-red-500/20 rounded">
                                <div className="text-[9px] text-red-400 font-mono uppercase mb-0.5">制約 (Constraints)</div>
                                <div className="text-sm text-gray-200">{protection.lore.effects.constraints}</div>
                             </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">4. Hierarchy (階層構造)</h3>
                        <div className="flex items-center justify-between text-xs bg-black/40 p-3 rounded border border-white/5">
                            <div className="text-gray-500 text-center flex-1 min-w-0">
                                <div className="text-[8px] uppercase">Lower</div>
                                <div className="truncate px-1">{protection.lore.hierarchy.lower}</div>
                            </div>
                            <div className="text-gray-600 px-1">→</div>
                            <div className="text-white font-bold text-center flex-1 border px-1 py-1 rounded border-magic-accent/30 bg-magic-accent/10 min-w-0">
                                <div className="text-[8px] uppercase text-magic-accent">Current</div>
                                <div className="truncate px-1">{protection.lore.hierarchy.middle || protection.name}</div>
                            </div>
                            <div className="text-gray-600 px-1">→</div>
                            <div className="text-yellow-200 text-center flex-1 min-w-0">
                                <div className="text-[8px] uppercase">Upper</div>
                                <div className="truncate px-1">{protection.lore.hierarchy.upper}</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">5. World Role (世界観的役割)</h3>
                        <p className="text-sm text-gray-300 italic leading-relaxed pl-4 border-l-2 border-magic-accent">
                            "{protection.lore.role}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SpellResult: React.FC<SpellResultProps> = ({ spell, onReset }) => {
  const [showFormula, setShowFormula] = useState(false);
  const [showProtectionDetails, setShowProtectionDetails] = useState(false);
  const ringInfo = RING_DATA[spell.rank] || { name: "不明", alias: "Unknown" };
  const visualIcon = getSystemVisual(spell.system, spell.attribute);

  return (
    <div className="w-full max-w-5xl mx-auto p-2 md:p-4">
      {showProtectionDetails && (
          <ProtectionModal protection={spell.protection} onClose={() => setShowProtectionDetails(false)} />
      )}

      <div className="bg-[#0a0a0f] border border-white/10 rounded-sm overflow-hidden shadow-2xl relative ring-1 ring-white/5 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-500">
        
        {/* Holographic Header */}
        <div className="bg-white/5 border-b border-white/10 p-2 px-4 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-2 text-[10px] font-mono text-magic-accent tracking-widest min-w-0">
                <Database className="w-3 h-3 shrink-0" />
                <span className="truncate">ARCHIVE :: ENTRY {spell.id}</span>
             </div>
             <div className="flex items-center gap-3 shrink-0 ml-2">
               <div className="text-[10px] font-mono text-gray-500">TS: {spell.timestamp}</div>
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></div>
             </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-0">
          
          {/* Left Column: System Visual */}
          <div className="lg:col-span-5 relative border-r border-white/10 flex flex-col items-center justify-center bg-black/20 min-h-[300px] lg:min-h-auto overflow-hidden">
             
             {/* Background Glow */}
             <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${spell.eyeColor}, transparent 70%)` }}></div>
             
             {/* Main Icon */}
             <div className="relative z-10 transition-transform duration-700 hover:scale-105">
                {visualIcon}
             </div>

             {/* Rotating Ring Effect */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <svg className="w-[140%] h-[140%] animate-spin-slow opacity-10" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" fill="none" className="text-white"/>
                 </svg>
             </div>

            {/* OIP Stats Block */}
            <div className="absolute bottom-0 w-full p-4 bg-black/40 border-t border-white/10 grid grid-cols-2 gap-2 backdrop-blur-sm">
                 <div className="p-2 border border-white/10 bg-white/5 rounded">
                    <div className="text-[8px] text-gray-500 font-mono uppercase truncate">OIP 振幅 (Amplitude)</div>
                    <div className="text-xs text-magic-accent font-mono truncate">{spell.oipAmplitude}</div>
                 </div>
                 <div className="p-2 border border-white/10 bg-white/5 rounded">
                    <div className="text-[8px] text-gray-500 font-mono uppercase truncate">OIP 周波数 (Freq)</div>
                    <div className="text-xs text-magic-accent font-mono truncate" title={spell.oipFrequency}>{spell.oipFrequency}</div>
                 </div>
                 <div className="col-span-2 p-2 border border-white/10 bg-white/5 rounded flex items-center gap-2">
                    <Eye className="w-3 h-3 shrink-0" style={{ color: spell.eyeColor }} />
                    <div className="text-[9px] text-gray-400 font-mono truncate">W視核共鳴: <span style={{ color: spell.eyeColor }}>Active</span></div>
                 </div>
            </div>
          </div>

          {/* Right Column: Data */}
          <div className="lg:col-span-7 p-6 flex flex-col gap-6 bg-gradient-to-br from-[#0a0a0f] to-[#11111a]">
            
            {/* Title Section (Overview) */}
            <div>
               <div className="flex flex-wrap items-center gap-2 mb-2">
                 <span className="px-2 py-0.5 bg-magic-accent/10 border border-magic-accent/30 text-magic-accent text-[10px] font-mono tracking-wider uppercase rounded">
                    {ringInfo.alias}
                 </span>
               </div>
               <h1 className="text-3xl md:text-4xl font-serif text-white magic-glow leading-tight mb-2 tracking-wide break-words">{spell.name}</h1>
               <div className="text-sm text-gray-300 border-l-2 border-gray-700 pl-3 italic">
                   {spell.description}
               </div>
            </div>

            {/* Template: System / Genus / Ring */}
            <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded border border-white/5">
                <div className="min-w-0">
                    <div className="text-[9px] text-gray-500 font-mono uppercase truncate">系 (System)</div>
                    <div className="text-xs text-white flex items-center gap-2 truncate">{getIcon(spell.system)} <span className="truncate">{spell.system}</span></div>
                </div>
                <div className="min-w-0">
                    <div className="text-[9px] text-gray-500 font-mono uppercase truncate">属 (Genus)</div>
                    <div className="text-xs text-white truncate">{spell.attribute}</div>
                </div>
                <div className="min-w-0">
                    <div className="text-[9px] text-gray-500 font-mono uppercase truncate">環 (Ring)</div>
                    <div className="text-xs text-white truncate">Rank {spell.rank}</div>
                </div>
            </div>

            {/* Deep Lore Section (Features / Constraints) */}
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">
                  <Cpu className="w-3 h-3 shrink-0" /> 特徴・制約 (Features & Constraints)
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <DataRow label="タイプ (Type)" value={spell.lore.magicType} />
                  <DataRow label="媒体 (Medium)" value={spell.lore.medium} />
                  <DataRow label="条件 (Condition)" value={spell.lore.condition} />
                  <DataRow label="代償 (Cost)" value={spell.lore.cost} />
                  <DataRow label="理論 (Theory)" value={spell.lore.theory} full />
                  <DataRow label="起源 (Origin)" value={spell.lore.origin} full />
               </div>
            </div>

            {/* Chant Section */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
                   詠唱 (Chant)
                </div>
                <div className="p-3 bg-black/40 border-l-2 border-magic-accent text-sm italic text-gray-300 font-serif break-words">
                    "{spell.chantFeedback}"
                </div>
            </div>
            
             {/* Famous User */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-mono uppercase text-gray-600 shrink-0">Famous User:</span> 
                <span className="truncate">{spell.lore.famousUser}</span>
            </div>

            {/* Influence & Damage */}
            <div className="pt-4 border-t border-white/10 grid md:grid-cols-2 gap-4">
               {/* Equipment Influence */}
               <div className="space-y-2 col-span-2">
                   <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">
                      <Shield className="w-3 h-3 shrink-0 text-yellow-500" /> Equipment & Blessings
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-black/40 border border-white/5 rounded flex justify-between items-center group">
                         <div className="min-w-0 flex-1 pr-2">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-0.5 flex items-center gap-1">
                                <Shield className="w-3 h-3 shrink-0 text-magic-accent" /> Protection
                            </div>
                            <div className="text-xs text-gray-300 font-sans truncate">{spell.protection.name}</div>
                         </div>
                         {spell.protection.id !== 'none' && (
                             <button 
                                onClick={() => setShowProtectionDetails(true)}
                                className="px-2 py-1 bg-white/10 hover:bg-magic-accent/20 border border-white/10 rounded text-[9px] text-gray-300 hover:text-white transition-colors flex items-center gap-1 shrink-0"
                             >
                                <BookOpen className="w-3 h-3" /> Analyze
                             </button>
                         )}
                      </div>
                      <div className="p-2 bg-black/40 border border-white/5 rounded min-w-0">
                         <div className="text-[9px] text-gray-500 font-mono uppercase mb-0.5 flex items-center gap-1">
                             <Hammer className="w-3 h-3 shrink-0 text-blue-400" /> Tool
                         </div>
                         <div className="text-xs text-gray-300 font-sans truncate">{spell.tool.name} <span className="text-blue-500 font-mono text-[10px]">x{spell.tool.powerBonus}</span></div>
                      </div>
                   </div>
               </div>
            </div>
            
            {/* Damage Highlight - CLICKABLE */}
            <div className="space-y-2 mt-2">
                <div 
                    onClick={() => setShowFormula(!showFormula)}
                    className="p-3 bg-red-900/10 border border-red-500/20 rounded flex items-center justify-between shadow-[inset_0_0_20px_rgba(239,68,68,0.1)] cursor-pointer hover:bg-red-900/20 transition-all group"
                >
                    <div className="flex items-center gap-2 text-red-400/80 uppercase font-mono text-xs tracking-widest min-w-0">
                        <Swords className="w-4 h-4 shrink-0" />
                        <span className="truncate">Predicted Damage</span>
                        {showFormula ? <ChevronUp className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 shrink-0" />}
                    </div>
                    <div className="text-2xl font-mono font-bold text-red-200 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] shrink-0 ml-2">
                        {spell.predictedDamage ? spell.predictedDamage.toLocaleString() : '---'}
                    </div>
                </div>

                {/* Calculation Formula Dropdown */}
                {showFormula && spell.calculationFormula && (
                    <div className="p-3 bg-black/60 border border-white/10 rounded text-[10px] md:text-xs font-mono text-gray-400 animate-in slide-in-from-top-2">
                        <div className="mb-1 text-gray-600 uppercase tracking-widest">Calculation Matrix:</div>
                        <pre className="whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">{spell.calculationFormula}</pre>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-auto pt-4 flex gap-3">
               <button 
                  onClick={onReset}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-mono text-xs uppercase tracking-[0.2em] transition-all hover:border-magic-accent flex items-center justify-center gap-2 group rounded-sm"
                >
                  <Sparkles className="w-4 h-4 group-hover:animate-spin" />
                  Reset Matrix
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellResult;