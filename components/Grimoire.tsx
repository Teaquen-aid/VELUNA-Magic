import React, { useState, useMemo } from 'react';
import { ManifestedSpell, MagicSystem } from '../types';
import { Scroll, Zap, Hourglass, Hexagon, Star, Activity, Swords, Search, Trash2, X, Heart } from 'lucide-react';

interface GrimoireProps {
  history: ManifestedSpell[];
  onSelect: (spell: ManifestedSpell) => void;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
}

const getIcon = (system: MagicSystem) => {
  switch (system) {
    case MagicSystem.ELEMENTAL: return <Zap className="w-5 h-5 text-red-400" />;
    case MagicSystem.CAUSAL: return <Hourglass className="w-5 h-5 text-purple-400" />;
    case MagicSystem.CREATION: return <Hexagon className="w-5 h-5 text-green-400" />;
    case MagicSystem.DAWN: return <Star className="w-5 h-5 text-yellow-200" />;
    default: return <Activity className="w-5 h-5 text-gray-400" />;
  }
};

const Grimoire: React.FC<GrimoireProps> = ({ history, onSelect, isOpen, onToggle, onDelete }) => {
  // Local State for Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'RANK_DESC' | 'DAMAGE_DESC'>('NEWEST');
  const [filterSystem, setFilterSystem] = useState<MagicSystem | 'ALL'>('ALL');

  // Filter Logic
  const filteredHistory = useMemo(() => {
    let result = [...history];

    // Filter by System
    if (filterSystem !== 'ALL') {
        result = result.filter(spell => spell.system === filterSystem);
    }

    // Search
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(spell => 
            spell.name.toLowerCase().includes(q) || 
            spell.attribute.toLowerCase().includes(q)
        );
    }

    // Sort
    result.sort((a, b) => {
        switch (sortOrder) {
            case 'NEWEST': return b.timestamp - a.timestamp;
            case 'OLDEST': return a.timestamp - b.timestamp;
            case 'RANK_DESC': return b.rank - a.rank;
            case 'DAMAGE_DESC': return b.predictedDamage - a.predictedDamage;
            default: return 0;
        }
    });

    return result;
  }, [history, searchQuery, sortOrder, filterSystem]);

  return (
    <div className={`
      fixed z-40 bg-black/95 backdrop-blur-xl border-white/10 overflow-hidden transition-all duration-300 ease-in-out
      bottom-0 right-0 border-t md:border-t-0 md:border-l flex flex-col
      ${isOpen ? 'h-[80vh] w-full md:h-full md:top-0 md:w-96' : 'h-0 w-full md:h-full md:top-0 md:w-0'}
    `}>
      {/* Header */}
      <div 
        className="h-14 px-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-2">
          <Scroll className="text-magic-accent w-4 h-4 shrink-0" />
          <h3 className="font-serif text-sm text-white tracking-widest uppercase">
            Grimoire Database
          </h3>
        </div>

        <button 
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors"
        >
            <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b border-white/10 bg-black/20 shrink-0 space-y-3">
          {/* Search */}
          <div className="flex gap-2">
              <div className="relative flex-1">
                  <Search className="absolute left-2 top-2 w-3 h-3 text-gray-500" />
                  <input 
                      type="text" 
                      placeholder="Search known spells..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded pl-7 pr-2 py-1.5 text-xs text-white focus:border-magic-accent outline-none"
                  />
              </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
              <div className="flex-1">
                  <select 
                      value={filterSystem}
                      onChange={(e) => setFilterSystem(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] text-gray-300 focus:border-magic-accent outline-none"
                  >
                      <option value="ALL">All Systems</option>
                      {Object.values(MagicSystem).map(sys => (
                          <option key={sys} value={sys}>{sys}</option>
                      ))}
                  </select>
              </div>
              <div className="flex-1">
                  <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] text-gray-300 focus:border-magic-accent outline-none"
                  >
                      <option value="NEWEST">Date (New)</option>
                      <option value="OLDEST">Date (Old)</option>
                      <option value="RANK_DESC">Rank (High)</option>
                      <option value="DAMAGE_DESC">Power (High)</option>
                  </select>
              </div>
          </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {filteredHistory.length === 0 ? (
            <div className="text-center text-gray-600 py-10 text-xs font-mono">No spells found in Grimoire.</div>
        ) : (
            filteredHistory.map((spell) => {
                const isRecovery = spell.attribute.includes('光') || spell.attribute.includes('神聖') || spell.attribute.includes('回復');
                return (
                <div 
                    key={spell.id}
                    className="group bg-white/5 hover:bg-white/10 border border-white/5 rounded p-2 transition-all hover:border-magic-accent/50 relative overflow-hidden flex flex-col gap-2"
                >
                    {/* Rank Indicator Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-magic-accent to-transparent opacity-50"></div>

                    <div 
                        className="flex gap-3 items-center cursor-pointer"
                        onClick={() => onSelect(spell)}
                    >
                        <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-900 border border-white/10 shrink-0">
                            {getIcon(spell.system)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="font-serif text-white text-sm truncate group-hover:text-magic-accent transition-colors">{spell.name}</h4>
                                <span className="text-[9px] font-mono text-gray-500 border border-white/10 px-1 rounded">R{spell.rank}</span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-[10px] text-gray-400 truncate max-w-[100px]">{spell.attribute}</p>
                                {spell.predictedDamage && (
                                <span className={`flex items-center gap-1 text-[9px] font-mono ${isRecovery ? 'text-green-400/80' : 'text-red-400/80'}`}>
                                    {isRecovery ? <Heart className="w-2 h-2" /> : <Swords className="w-2 h-2" />}
                                    {(spell.predictedDamage > 9999 ? (spell.predictedDamage/1000).toFixed(0) + 'k' : spell.predictedDamage)}
                                </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Actions - Hidden by default, shown on hover or active */}
                    <div className="pt-2 border-t border-white/5 flex justify-end items-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(spell.id); }}
                                className="p-1 hover:text-red-400 text-gray-500 transition-colors"
                                title="Remove from Grimoire"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            )})
        )}
      </div>
    </div>
  );
};

export default Grimoire;