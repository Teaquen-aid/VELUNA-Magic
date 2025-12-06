import React from 'react';
import { MagicSystem, AppState } from '../types';

interface MagicCircleProps {
  state: AppState;
  system?: MagicSystem;
  attribute?: string; // New prop for specific attribute geometry
  eyeColor?: string;
  stepText?: string;
  stepIndex?: number;
}

const getSystemColor = (system: MagicSystem) => {
  switch (system) {
    case MagicSystem.ELEMENTAL: return '#ef4444'; 
    case MagicSystem.CAUSAL: return '#8b5cf6';    
    case MagicSystem.CREATION: return '#10b981';  
    case MagicSystem.DAWN: return '#fef08a';      
    case MagicSystem.OTHER: return '#94a3b8';     
    default: return '#8b5cf6';
  }
};

const getGeometryType = (attr: string = '') => {
  const a = attr.toLowerCase();
  if (a.includes('fire') || a.includes('火') || a.includes('heat') || a.includes('flame')) return 'FIRE';
  if (a.includes('water') || a.includes('水') || a.includes('ice') || a.includes('rain')) return 'WATER';
  if (a.includes('wind') || a.includes('風') || a.includes('air') || a.includes('flight')) return 'WIND';
  if (a.includes('earth') || a.includes('土') || a.includes('rock') || a.includes('ground')) return 'EARTH';
  if (a.includes('light') || a.includes('光') || a.includes('holy') || a.includes('sun')) return 'LIGHT';
  if (a.includes('dark') || a.includes('闇') || a.includes('shadow') || a.includes('void')) return 'DARK';
  return 'DEFAULT';
};

const MagicCircle: React.FC<MagicCircleProps> = ({ state, system = MagicSystem.OTHER, attribute = '', eyeColor, stepText, stepIndex = 0 }) => {
  const baseColor = getSystemColor(system);
  const activeColor = eyeColor || baseColor;
  
  const isManifesting = state === 'MANIFESTING';
  const isAnalyzing = state === 'ANALYZING';
  const isIdle = state === 'IDLE';

  // Step logic
  // IDLE: Preview mode (show Outer & Inner geometries, HIDE Eye)
  // Step 0: Intent Focus (Hide ALL to blink/reset)
  // Step 1: W-Core Activation (Eye opens)
  // Step 2: Circle Formation (Outer geometry AND Magic Rings appear)
  // Step 3+: W-Flow (Inner geometry & Particles)
  
  // Eye active logic: Only during analysis (step 1+) or manifesting. NOT during IDLE.
  const isEyeActive = isManifesting || (isAnalyzing && stepIndex >= 1);
  const showEye = isEyeActive; 

  // Circle Active: IDLE (Preview), or Step 2+.
  // IMPORTANT: During Analyzing Step 0 & 1, it should be FALSE to create the "build up" effect.
  const isCircleActive = isIdle || isManifesting || (isAnalyzing && stepIndex >= 2);
  
  // Flow Active: IDLE (Preview), or Step 3+.
  const isFlowActive = isIdle || isManifesting || (isAnalyzing && stepIndex >= 3); 
  
  const showParticles = isManifesting;
  
  // Climax Logic: At step 6 (Manifestation) of MANIFESTING state, zoom in significantly.
  const isClimax = isManifesting && stepIndex >= 5;

  const geometry = getGeometryType(attribute);
  
  // Container Scale Logic
  let containerScale = 'scale-100 opacity-60';
  if (isClimax) {
    containerScale = 'scale-[4.0] opacity-0 blur-sm duration-300 ease-in'; // Explosive zoom out/in
  } else if (state !== 'IDLE') {
    containerScale = 'scale-110 opacity-100 duration-1000';
  }

  // Render different SVG paths based on attribute geometry
  const renderOuterGeometry = () => {
    // Enhanced entrance animation: Rotate and Scale in
    const commonProps = {
      stroke: isManifesting ? activeColor : baseColor,
      strokeWidth: "0.5",
      fill: "none",
      className: `transition-all duration-1000 ease-out origin-center ${
        isCircleActive 
          ? 'opacity-100 scale-100 rotate-0' 
          : 'opacity-0 scale-50 -rotate-45'
      }`
    };

    switch (geometry) {
      case 'FIRE': // Triangle / Acute
        return (
          <svg viewBox="0 0 100 100" className={`w-64 h-64 md:w-96 md:h-96 absolute ${isCircleActive ? 'animate-spin-slow' : ''}`} {...commonProps}>
             <polygon points="50,5 93,80 7,80" strokeDasharray="1 2" />
             <polygon points="50,15 85,75 15,75" strokeOpacity="0.5" transform="rotate(180 50 50)" />
             <circle cx="50" cy="50" r="48" strokeDasharray="10 10" strokeOpacity="0.3" />
          </svg>
        );
      case 'WATER': // Concentric / Waves
        return (
          <svg viewBox="0 0 100 100" className={`w-64 h-64 md:w-96 md:h-96 absolute ${isCircleActive ? 'animate-spin-slow' : ''}`} {...commonProps}>
             <circle cx="50" cy="50" r="48" strokeDasharray="5 5" />
             <circle cx="50" cy="50" r="40" strokeOpacity="0.6" />
             <circle cx="50" cy="50" r="32" strokeDasharray="2 4" strokeOpacity="0.4" />
             <path d="M50 2 A 48 48 0 0 1 50 98 A 48 48 0 0 1 50 2" strokeOpacity="0.2" transform="rotate(45 50 50)" />
          </svg>
        );
      case 'WIND': // Spiral / Dashed
        return (
          <svg viewBox="0 0 100 100" className={`w-64 h-64 md:w-96 md:h-96 absolute ${isCircleActive ? 'animate-spin-slow' : ''}`} {...commonProps}>
             <path d="M50 50 m 0 -45 a 45 45 0 1 1 0 90 a 45 45 0 1 1 0 -90" strokeDasharray="20 10" />
             <path d="M50 50 m 0 -35 a 35 35 0 1 0 0 70 a 35 35 0 1 0 0 -70" strokeDasharray="5 15" strokeOpacity="0.6" transform="rotate(60 50 50)" />
             <path d="M95 50 Q 50 0 5 50 Q 50 100 95 50" strokeOpacity="0.3" fill="none" />
          </svg>
        );
      case 'EARTH': // Square / Stable
        return (
          <svg viewBox="0 0 100 100" className={`w-64 h-64 md:w-96 md:h-96 absolute`} {...commonProps}>
             <rect x="15" y="15" width="70" height="70" strokeDasharray="2 2" />
             <rect x="15" y="15" width="70" height="70" transform="rotate(45 50 50)" strokeOpacity="0.5" />
             <circle cx="50" cy="50" r="48" strokeOpacity="0.2" />
          </svg>
        );
      case 'LIGHT': // Hexagon / Star
        return (
          <svg viewBox="0 0 100 100" className={`w-64 h-64 md:w-96 md:h-96 absolute ${isCircleActive ? 'animate-spin-slow' : ''}`} {...commonProps}>
             <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" strokeDasharray="4 2" />
             <polygon points="50,5 93,80 7,80" strokeOpacity="0.4" />
             <polygon points="50,95 7,20 93,20" strokeOpacity="0.4" />
             <circle cx="50" cy="50" r="48" strokeDasharray="1 5" strokeOpacity="0.3" />
          </svg>
        );
      case 'DARK': // Asymmetric / Distorted
        return (
          <svg viewBox="0 0 100 100" className={`w-64 h-64 md:w-96 md:h-96 absolute ${isCircleActive ? 'animate-spin-reverse' : ''}`} {...commonProps}>
             <path d="M50 5 L80 30 L70 80 L20 90 L10 40 Z" strokeDasharray="10 5" />
             <path d="M50 10 L90 50 L50 90 L10 50 Z" transform="rotate(15 50 50)" strokeOpacity="0.5" />
             <circle cx="50" cy="50" r="45" strokeDasharray="1 10" strokeOpacity="0.4" />
          </svg>
        );
      default: // Default Circular
        return (
          <svg viewBox="0 0 100 100" className={`w-64 h-64 md:w-96 md:h-96 absolute ${isCircleActive ? 'animate-spin-slow' : ''}`} {...commonProps}>
            <circle cx="50" cy="50" r="48" strokeDasharray="1 4" />
            <circle cx="50" cy="50" r="46" strokeOpacity="0.3" />
            <path d="M50 0 L50 10 M50 90 L50 100 M0 50 L10 50 M90 50 L100 50" strokeOpacity="0.8" />
            <circle cx="50" cy="50" r="40" strokeDasharray="10 2" strokeOpacity="0.6" />
          </svg>
        );
    }
  };

  const renderInnerFlow = () => {
    const commonProps = {
      stroke: isManifesting ? activeColor : baseColor,
      strokeWidth: "0.3",
      fill: "none",
      className: `transition-all duration-1000 ease-out origin-center ${
        isFlowActive 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-75'
      }`
    };

    switch (geometry) {
      case 'FIRE':
        return (
           <svg viewBox="0 0 100 100" className={`w-48 h-48 md:w-72 md:h-72 absolute`} {...commonProps}>
              <path d="M50 10 L50 90 M10 50 L90 50" transform="rotate(45 50 50)" />
              <polygon points="50,20 80,80 20,80" strokeOpacity="0.6" transform="rotate(180 50 50)" />
           </svg>
        );
      case 'WATER':
         return (
           <svg viewBox="0 0 100 100" className={`w-48 h-48 md:w-72 md:h-72 absolute animate-spin-reverse`} {...commonProps}>
              <path d="M20 50 Q 50 20 80 50 T 140 50" fill="none" />
              <path d="M20 50 Q 50 80 80 50 T 140 50" fill="none" strokeOpacity="0.5" />
              <circle cx="50" cy="50" r="30" strokeDasharray="2 2" />
           </svg>
         );
      case 'WIND':
          return (
            <svg viewBox="0 0 100 100" className={`w-48 h-48 md:w-72 md:h-72 absolute animate-spin-slow`} {...commonProps}>
               <path d="M50 50 m 0 -25 a 25 25 0 1 1 0 50 a 25 25 0 1 1 0 -50" strokeDasharray="10 20" />
               <path d="M50 20 L50 40 M50 60 L50 80 M20 50 L40 50 M60 50 L80 50" />
            </svg>
          );
      case 'EARTH':
          return (
            <svg viewBox="0 0 100 100" className={`w-48 h-48 md:w-72 md:h-72 absolute`} {...commonProps}>
               <rect x="30" y="30" width="40" height="40" />
               <line x1="10" y1="10" x2="90" y2="90" strokeOpacity="0.5" />
               <line x1="90" y1="10" x2="10" y2="90" strokeOpacity="0.5" />
            </svg>
          );
      case 'LIGHT':
           return (
             <svg viewBox="0 0 100 100" className={`w-48 h-48 md:w-72 md:h-72 absolute animate-pulse`} {...commonProps}>
                <line x1="50" y1="10" x2="50" y2="90" />
                <line x1="10" y1="50" x2="90" y2="50" />
                <line x1="20" y1="20" x2="80" y2="80" />
                <line x1="80" y1="20" x2="20" y2="80" />
                <circle cx="50" cy="50" r="10" strokeOpacity="0.8" />
             </svg>
           );
       case 'DARK':
            return (
              <svg viewBox="0 0 100 100" className={`w-48 h-48 md:w-72 md:h-72 absolute animate-spin-slow`} {...commonProps}>
                 <path d="M50 50 m-20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0" strokeDasharray="3 7" />
                 <path d="M30 30 L70 70 M70 30 L30 70" strokeOpacity="0.4" />
              </svg>
            );
      default:
        return (
          <svg viewBox="0 0 100 100" className={`w-48 h-48 md:w-72 md:h-72 absolute animate-spin-reverse`} {...commonProps}>
            <rect x="20" y="20" width="60" height="60" transform="rotate(45 50 50)" />
            <rect x="20" y="20" width="60" height="60" transform="rotate(22.5 50 50)" strokeOpacity="0.5"/>
            <circle cx="50" cy="50" r="35" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center transition-all ${containerScale}`}>
      
      {/* Outer Phenomenon Boundary - Activates at Step 2 (Circle Formation) */}
      {renderOuterGeometry()}

      {/* Middle W-Flow Channels - Activates at Step 3 (W-Flow) */}
      {renderInnerFlow()}

      {/* Inner Geometric Rings - Now synchronized with Circle Formation (Step 2) */}
      {/* Inner Ring - Geometric */}
      <div className={`absolute -inset-16 md:-inset-24 transition-all duration-1000 ease-out ${isCircleActive ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow text-white/30">
            {/* Base Circles */}
            <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="1 4" />
            
            {/* Geometric Decor - Dashed Ticks */}
            {[...Array(12)].map((_, i) => (
              <rect 
                key={i}
                x="98" 
                y="26" 
                width="4" 
                height="6" 
                fill="currentColor"
                transform={`rotate(${i * 30} 100 100)`}
                opacity="0.8"
              />
            ))}
            
            {/* Connecting Lines */}
            <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="0.5" fill="none" strokeOpacity="0.3" />
        </svg>
      </div>

      {/* Outer Ring - Geometric Patterns */}
      <div className={`absolute -inset-24 md:-inset-36 transition-all duration-1000 ease-out delay-150 ${isCircleActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75 -rotate-90'}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-reverse text-white/20">
            <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 2" />
            
            {/* Geometric Squares/Rhombus */}
            <rect x="60" y="60" width="80" height="80" stroke="currentColor" strokeWidth="0.5" fill="none" transform="rotate(45 100 100)" />
            <rect x="60" y="60" width="80" height="80" stroke="currentColor" strokeWidth="0.5" fill="none" />
            
            {/* Cardinal Points */}
            {[0, 90, 180, 270].map(deg => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                <circle cx="100" cy="12" r="2" fill="currentColor" />
                <line x1="100" y1="12" x2="100" y2="25" stroke="currentColor" strokeWidth="1" />
              </g>
            ))}
          </svg>
      </div>

      {/* W-CORE (EYE) Visualization - Activates at Step 1 (W-Core Activation) - HIDDEN IN IDLE */}
      <div 
        className={`relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center transition-all duration-500 ${showEye ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      >
        {/* Eye Shape Container */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${isEyeActive ? 'scale-100' : 'scale-75 opacity-50'}`}>
          {/* Sclera / Outer Eye Shape */}
          <svg viewBox="0 0 100 60" className="w-full h-auto drop-shadow-2xl">
            <path 
              d="M10,30 Q50,-10 90,30 Q50,70 10,30 Z" 
              fill="rgba(0,0,0,0.8)" 
              stroke={isEyeActive ? (isManifesting ? activeColor : '#fff') : '#333'} 
              strokeWidth="1"
              className="transition-all duration-500"
            />
          </svg>
          
          {/* Iris & Pupil */}
          <div className={`absolute w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden ${isEyeActive ? 'opacity-100' : 'opacity-0 scale-y-0'}`}>
             {/* Iris Glow */}
             <div 
               className="absolute inset-0 rounded-full animate-pulse-fast"
               style={{ 
                 background: `radial-gradient(circle, ${activeColor} 0%, transparent 70%)`,
                 boxShadow: isManifesting ? `0 0 20px ${activeColor}` : 'none'
               }}
             />
             {/* Iris Details */}
             <div className="absolute inset-0 rounded-full border border-white/20 opacity-50" style={{ borderColor: activeColor }}></div>
             
             {/* Pupil */}
             <div className={`w-3 h-3 md:w-6 md:h-6 bg-black rounded-full z-10 transition-all duration-300 ${isManifesting ? 'scale-75' : 'scale-100'}`}></div>
          </div>

          {/* Eyelids (Simulated by clipping or overlay) */}
          <div className={`absolute inset-0 bg-black transition-all duration-1000 ease-in-out ${isEyeActive ? 'h-0 opacity-0' : 'h-full opacity-90'}`} style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
        </div>

        {/* Status Text Overlay (Below Eye) */}
        <div className={`absolute -bottom-12 md:-bottom-16 w-64 text-center transition-opacity duration-300 ${showEye ? 'opacity-100' : 'opacity-0'}`}>
             <div className="font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/70">
                {stepText || 'W-Core Active'}
             </div>
             {/* OIP Waveform Simulation */}
             {isEyeActive && (
               <div className="flex justify-center items-end gap-0.5 h-4 mt-2 opacity-60">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-0.5 bg-current animate-pulse" 
                      style={{ 
                        color: activeColor,
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    ></div>
                  ))}
               </div>
             )}
        </div>

      </div>
      
      {/* Material W Particle Field */}
      {showParticles && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-spin-slow absolute w-[120%] h-[120%] rounded-full opacity-10" style={{ background: `conic-gradient(from 0deg, transparent, ${activeColor}, transparent)` }}></div>
        </div>
      )}
    </div>
  );
};

export default MagicCircle;