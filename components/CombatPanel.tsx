import React, { useRef, useEffect } from 'react';
import { EnemyDef, CombatLogEntry } from '../types';
import { Skull, X, RefreshCw, Swords, ShieldAlert, Target } from 'lucide-react';

interface CombatPanelProps {
    enemy: EnemyDef;
    logs: CombatLogEntry[];
    isOpen: boolean;
    onClose: () => void;
    onReset: () => void;
    onSelectEnemy: (id: string) => void;
    enemiesList: EnemyDef[];
}

const CombatPanel: React.FC<CombatPanelProps> = ({ enemy, logs, isOpen, onClose, onReset, onSelectEnemy, enemiesList }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    if (!isOpen) return null;

    const hpPercentage = Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));

    return (
        <div className="fixed top-20 left-4 md:left-8 z-40 w-full max-w-sm bg-black/80 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-2xl animate-in slide-in-from-left-4 fade-in duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-red-950/20">
                <div className="flex items-center gap-2 text-red-400">
                    <Swords className="w-5 h-5" />
                    <h3 className="font-serif text-sm tracking-widest uppercase">Combat Simulation</h3>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Enemy Display */}
            <div className="p-4 border-b border-white/10 relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Target Hostile</div>
                        <div className="text-lg text-white font-bold">{enemy.name}</div>
                        <div className="text-xs text-gray-400">{enemy.attribute} | {enemy.description}</div>
                    </div>
                    
                    {/* Enemy Select Dropdown (Quick Switch) */}
                    <div className="relative group">
                        <button className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded">
                            <RefreshCw className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f172a] border border-white/10 rounded shadow-xl hidden group-hover:block z-50">
                            {enemiesList.map(e => (
                                <button 
                                    key={e.id}
                                    onClick={() => onSelectEnemy(e.id)}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white truncate"
                                >
                                    {e.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Visual Placeholder */}
                <div className="flex justify-center my-4 relative">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)] ${hpPercentage <= 0 ? 'opacity-50 grayscale' : 'animate-pulse'}`}>
                        <Skull className={`w-12 h-12 text-red-500 ${hpPercentage <= 0 ? 'rotate-12' : ''}`} />
                    </div>
                    {/* Hit Effect Overlay could go here */}
                </div>

                {/* HP Bar */}
                <div className="mt-2">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                        <span>INTEGRITY</span>
                        <span className={hpPercentage < 30 ? 'text-red-500' : 'text-green-500'}>
                            {enemy.currentHp} / {enemy.maxHp}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className={`h-full transition-all duration-300 ${hpPercentage < 30 ? 'bg-red-600' : 'bg-green-500'}`}
                            style={{ width: `${hpPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Combat Log */}
            <div className="bg-black/40 h-48 overflow-y-auto scrollbar-hide p-3 font-mono text-[10px] space-y-1.5" ref={logContainerRef}>
                {logs.length === 0 && (
                    <div className="text-gray-600 text-center mt-10 italic">Waiting for spell impact...</div>
                )}
                {logs.map(log => (
                    <div key={log.id} className={`flex gap-2 ${log.isCritical ? 'text-yellow-300 font-bold' : 'text-gray-300'}`}>
                        <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]</span>
                        <span>
                            {log.message}
                            {log.damage && (
                                <span className={`ml-1 ${log.effectiveness === 'SUPER' ? 'text-red-400' : log.effectiveness === 'POOR' ? 'text-blue-400' : 'text-white'}`}>
                                    -{log.damage}
                                </span>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
                <button 
                    onClick={onReset}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] uppercase tracking-widest text-gray-300 transition-colors"
                >
                    Reset Battle
                </button>
            </div>
        </div>
    );
};

export default CombatPanel;
