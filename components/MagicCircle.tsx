import React from 'react';
import { MagicSystem, AppState } from '../types';

interface MagicCircleProps {
  state: AppState;
  system?: MagicSystem;
  attribute?: string;
  eyeColor?: string;
  stepText?: string;
  stepIndex?: number;
  onRelease?: () => void; // Click handler for the eye
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

const MagicCircle: React.FC<MagicCircleProps> = ({ state, system = MagicSystem.OTHER, attribute = '', eyeColor, stepText, stepIndex = 0, onRelease }) => {
  const baseColor = getSystemColor(system);
  const activeColor = eyeColor || baseColor;
  
  const isReady = state === 'READY';
  const isManifesting = state === 'MANIFESTING' || isReady;
  const isAnalyzing = state === 'ANALYZING';
  const isIdle = state === 'IDLE';
  const isCircleActive = isIdle || isManifesting || (isAnalyzing && stepIndex >= 2);
  const isEyeActive = isManifesting || (isAnalyzing && stepIndex >= 1);
  const showEye = isEyeActive; 
  const showParticles = isManifesting;

  // Updated Geometry: Large Dash-dotted Circle + Rotating Square
  const renderOuterGeometry = () => {
    const strokeColor = isManifesting ? activeColor : baseColor;
    
    // Significantly larger container for the magic circle
    return (
      <div className={`absolute w-[600px] h-[600px] md:w-[800px] md:h-[800px] flex items-center justify-center transition-all duration-1000 ease-out origin-center ${
          isCircleActive ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-12'
      }`}>
         
         {/* 1. Dash-dotted Circle */}
         <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '30s' }}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle 
                cx="100" cy="100" r="98" 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="0.5" 
                strokeDasharray="15 5 2 5" // Dash-dot pattern
                className="opacity-80 transition-colors duration-500"
              />
               {/* Inner decorative ring */}
               <circle 
                cx="100" cy="100" r="92" 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="0.2" 
                className="opacity-30"
              />
            </svg>
         </div>

         {/* 2. Rotating Square */}
         <div className="absolute inset-24 md:inset-32 animate-spin-reverse" style={{ animationDuration: '20s' }}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <rect 
                x="30" y="30" width="140" height="140" 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="0.8" 
                className="opacity-60 transition-colors duration-500"
              />
              {/* Inner Square accents */}
              <rect 
                x="30" y="30" width="140" height="140" 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="0.2" 
                strokeDasharray="2 10"
                className="opacity-40"
              />
            </svg>
         </div>

         {/* 3. Static Crosshairs / Stabilizers */}
         <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-[120%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
             <div className="h-[120%] w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
         </div>

      </div>
    );
  };

  return (
    <div className={`relative flex items-center justify-center transition-all`}>
      
      {/* Outer Phenomenon Boundary - THE BIG MAGIC CIRCLE */}
      {renderOuterGeometry()}

      {/* W-CORE (EYE) - Acts as Release Button in READY state */}
      <div 
        onClick={isReady && onRelease ? onRelease : undefined}
        className={`relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center transition-all duration-500 z-50
            ${showEye ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            ${isReady ? 'cursor-pointer hover:scale-110 active:scale-95 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]' : ''}
        `}
      >
        {/* Eye Shape Container */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${isEyeActive ? 'scale-100' : 'scale-75 opacity-50'}`}>
          {/* Sclera (Conjunctiva) - Increased Transparency */}
          <svg viewBox="0 0 100 60" className="w-full h-auto drop-shadow-2xl">
            <path 
              d="M10,30 Q50,-10 90,30 Q50,70 10,30 Z" 
              fill="rgba(255,255,255,0.1)"  // Transparent
              stroke={isEyeActive ? activeColor : '#555'} 
              strokeWidth={isReady ? "2" : "1"}
              strokeOpacity="0.8"
              className="transition-all duration-500"
            />
          </svg>
          
          {/* Iris & Pupil */}
          <div className={`absolute w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden ${isEyeActive ? 'opacity-100' : 'opacity-0 scale-y-0'}`}>
             
             {/* Cornea (Iris) - Attribute Color */}
             <div 
               className={`absolute inset-0 rounded-full ${isReady ? 'animate-ping' : 'animate-pulse-fast'}`}
               style={{ 
                 background: `radial-gradient(circle, ${activeColor} 0%, ${activeColor} 40%, transparent 80%)`,
                 opacity: 0.9,
                 boxShadow: isManifesting ? `0 0 20px ${activeColor}` : 'none'
               }}
             />
             <div className="absolute inset-2 rounded-full border border-white/30 opacity-60" style={{ borderColor: activeColor }}></div>
             
             {/* Pupil - Darker Shade of Attribute Color */}
             <div 
                className={`w-4 h-4 md:w-8 md:h-8 rounded-full z-10 transition-all duration-300 ${isManifesting ? 'scale-75' : 'scale-100'} ${isReady ? 'scale-125' : ''}`}
                style={{ 
                    backgroundColor: activeColor,
                    filter: 'brightness(0.3)' // Make it a darker version of the attribute color
                }}
             ></div>
          </div>

          <div className={`absolute inset-0 bg-black transition-all duration-1000 ease-in-out ${isEyeActive ? 'h-0 opacity-0' : 'h-full opacity-90'}`} style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
        </div>

        {/* Status Text Overlay - Centered nicely below eye */}
        <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 text-center transition-opacity duration-300 ${showEye ? 'opacity-100' : 'opacity-0'}`}>
             <div className={`font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase ${isReady ? 'text-white font-bold animate-pulse' : 'text-white/70'}`}>
                {isReady ? "TOUCH EYE TO RELEASE" : (stepText || 'W-Core Active')}
             </div>
             {/* OIP Waveform Simulation */}
             {isEyeActive && !isReady && (
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
            <div className={`animate-spin-slow absolute w-[120%] h-[120%] rounded-full opacity-10 ${isReady ? 'duration-100' : ''}`} style={{ background: `conic-gradient(from 0deg, transparent, ${activeColor}, transparent)` }}></div>
        </div>
      )}
    </div>
  );
};

export default MagicCircle;