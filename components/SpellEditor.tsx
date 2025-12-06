import React, { useState, useEffect } from 'react';
import { ManifestedSpell, MagicSystem, SYSTEM_ATTRIBUTES, RING_DATA, DivineProtectionDef, ToolDef, CasterStatus, SpellEnvironment, SpellLore } from '../types';
import { X, Sparkles, Save, Crown } from 'lucide-react';
import { DIVINE_PROTECTIONS, DEFAULT_TOOLS } from '../services/geminiService';

interface SpellEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (spell: ManifestedSpell) => void;
    initialData: ManifestedSpell | null;
}

const SpellEditor: React.FC<SpellEditorProps> = ({ isOpen, onClose, onSave, initialData }) => {
    // Basic Fields
    const [name, setName] = useState('');
    const [system, setSystem] = useState<MagicSystem>(MagicSystem.ELEMENTAL);
    const [attribute, setAttribute] = useState('');
    const [rank, setRank] = useState(1);
    const [damage, setDamage] = useState(100);
    const [description, setDescription] = useState('');
    const [chant, setChant] = useState('');
    
    // Protection Field
    const [protectionId, setProtectionId] = useState('none');
    
    // Auto-fill logic helpers
    const getSystemAttributes = (sys: MagicSystem) => SYSTEM_ATTRIBUTES[sys] || [];

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setSystem(initialData.system);
            setAttribute(initialData.attribute);
            setRank(initialData.rank);
            setDamage(initialData.predictedDamage);
            setDescription(initialData.description);
            setChant(initialData.chantFeedback);
            setProtectionId(initialData.protection.id);
        } else {
            // Defaults for new spell
            setName('Unnamed Spell');
            setSystem(MagicSystem.ELEMENTAL);
            setAttribute(SYSTEM_ATTRIBUTES[MagicSystem.ELEMENTAL][0]);
            setRank(1);
            setDamage(100);
            setDescription('Manually registered spell effect.');
            setChant('N/A');
            setProtectionId('none');
        }
    }, [initialData, isOpen]);

    // Handle System Change -> Reset Attribute
    const handleSystemChange = (sys: MagicSystem) => {
        setSystem(sys);
        const attrs = getSystemAttributes(sys);
        if (attrs.length > 0) setAttribute(attrs[0]);
    };

    const handleSave = () => {
        const id = initialData?.id || `MG${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const timestamp = initialData?.timestamp || Date.now();

        // Construct a ManifestedSpell object. 
        // For complex nested objects (Environment, Caster, Tools), we use defaults if not editing, 
        // or preserve existing ones if editing.
        
        const defaultEnv: SpellEnvironment = {
            location: { lat: 0, lng: 0, alt: 0 },
            temperature: 20,
            humidity: 50,
            wDensity: 1000
        };

        const defaultCaster: CasterStatus = {
            hp: 100,
            maxHp: 100,
            heartRate: 70,
            bodyTemp: 36.5,
            bloodPressure: "120/80",
            respiration: 16,
            spO2: 98,
            consciousnessLevel: "Normal",
            emotionIndex: 50
        };
        
        const defaultLore: SpellLore = {
             magicType: "Manual Entry",
             medium: "Unknown",
             condition: "None",
             cost: "Mana",
             theory: "Manual Registration",
             origin: "User",
             famousUser: "User"
        };
        
        // Find Protection Object
        const selectedProtection = DIVINE_PROTECTIONS.find(p => p.id === protectionId) || DIVINE_PROTECTIONS[0];

        const spell: ManifestedSpell = {
            id,
            timestamp,
            name,
            system,
            attribute,
            domain: attribute, // Simplify for manual
            rank,
            description,
            chantFeedback: chant,
            visualPrompt: `Magic circle of ${attribute}`,
            eyeColor: '#ffffff', // Default white
            oipAmplitude: '0 Wm',
            oipFrequency: '0 THz',
            casterStatus: initialData?.casterStatus || defaultCaster,
            environment: initialData?.environment || defaultEnv,
            protection: selectedProtection,
            tool: initialData?.tool || DEFAULT_TOOLS.find(t => t.id === 'tool_none')!,
            predictedDamage: damage,
            lore: initialData?.lore || defaultLore,
            // Keep existing formula if editing, else simple string
            calculationFormula: initialData?.calculationFormula || "Manual Entry"
        };

        onSave(spell);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0a0a0f] border border-white/20 w-full max-w-lg rounded-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-magic-accent to-transparent"></div>
                
                <div className="p-6 flex-1 overflow-y-auto scrollbar-hide">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-serif text-xl text-white flex items-center gap-2">
                           <Sparkles className="w-5 h-5 text-magic-accent" />
                           {initialData ? 'EDIT SPELL MATRIX' : 'NEW SPELL ENTRY'}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Spell Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-white focus:border-magic-accent outline-none font-serif"
                                placeholder="Enter spell name..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* System */}
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">System</label>
                                <select 
                                    value={system}
                                    onChange={(e) => handleSystemChange(e.target.value as MagicSystem)}
                                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-gray-300 focus:border-magic-accent outline-none"
                                >
                                    {Object.values(MagicSystem).map(sys => (
                                        <option key={sys} value={sys}>{sys}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Attribute */}
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Attribute</label>
                                <select 
                                    value={attribute}
                                    onChange={(e) => setAttribute(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-gray-300 focus:border-magic-accent outline-none"
                                >
                                    {getSystemAttributes(system).map(attr => (
                                        <option key={attr} value={attr}>{attr}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Protection Field */}
                        <div>
                            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1 flex items-center gap-1">
                                <Crown className="w-3 h-3 text-yellow-500" /> Divine Protection
                            </label>
                            <select 
                                value={protectionId}
                                onChange={(e) => setProtectionId(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-gray-300 focus:border-magic-accent outline-none"
                            >
                                {DIVINE_PROTECTIONS.map(p => (
                                    <option key={p.id} value={p.id}>[{p.category}] {p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Rank */}
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Rank</label>
                                <select 
                                    value={rank}
                                    onChange={(e) => setRank(Number(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-gray-300 focus:border-magic-accent outline-none"
                                >
                                    {[1,2,3,4,5,6,7].map(r => (
                                        <option key={r} value={r}>{r} - {RING_DATA[r].alias}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Damage */}
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Output (Damage)</label>
                                <input 
                                    type="number" 
                                    value={damage}
                                    onChange={(e) => setDamage(Number(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-red-300 focus:border-red-500 outline-none font-mono"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-gray-300 focus:border-magic-accent outline-none h-20"
                                placeholder="Spell effects description..."
                            />
                        </div>
                        
                         {/* Chant */}
                        <div>
                            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Incantation</label>
                            <textarea 
                                value={chant}
                                onChange={(e) => setChant(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-gray-300 focus:border-magic-accent outline-none h-16 italic"
                                placeholder="Chant text..."
                            />
                        </div>

                    </div>
                    
                    <button 
                        onClick={handleSave}
                        className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-widest rounded border border-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpellEditor;